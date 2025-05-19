from flask import Flask, request, jsonify
from flask_cors import CORS
from mysql.connector import connect
from werkzeug.security import check_password_hash, generate_password_hash
import jwt
import datetime
import os
import logging
from functools import wraps
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Standard password and its hash
STANDARD_PASSWORD = 'password123'
STANDARD_PASSWORD_HASH = generate_password_hash(STANDARD_PASSWORD)

app = Flask(__name__)
# Configure CORS to allow requests from your frontend
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8081", "http://localhost:8082", "http://localhost:8083", "http://localhost:8084"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'hrdatabase'),
    'port': int(os.getenv('DB_PORT', '3306'))
}

# JWT Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'x7k9p2m4q8v5n3j6h1t0r2y5u8w3z6b9')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'hr_management_jwt_secret_key_2024_secure')

# Print JWT secret for reference
# print("JWT Secret Key:", app.config['JWT_SECRET_KEY'])
# print("App Secret Key:", app.config['SECRET_KEY'])

def get_db_connection():
    try:
        conn = connect(**db_config)
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            token = token.split(' ')[1]  # Remove 'Bearer ' prefix
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return jsonify({'message': 'Token is invalid'}), 401

        return f(current_user_id, *args, **kwargs)
    return decorated


# def db_connection():
#     db_settings = [
#         'DB_HOST':os.getenv('localhost')
#         'DB_PORT':os.getenv(3306)
#         'DB_NAME':os.getenv('hrdatabase')
#         'DB_PASSWORD':os.getenv('')
#         'DB_HOSTNAME':os.getenv('root')
#     ]
#     return db_settings


# def get_connection():
#     try:
#         connection = connect(**db_connection())
#         return connection

#     except Exception as error:

#         return jsonify({f"There is a database error: {str(error)}"})
#         raise

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'message': 'Invalid email or password'}), 401

        # Only allow login if the provided password matches the stored hash
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid email or password'}), 401

        # Delete any existing active sessions for this user
        cursor.execute('UPDATE login_sessions SET is_active = 0 WHERE user_id = %s', (user['id'],))
        
        # Create new session
        cursor.execute('''
            INSERT INTO login_sessions (user_id, user_agent, ip_address)
            VALUES (%s, %s, %s)
        ''', (user['id'], request.user_agent.string, request.remote_addr))
        conn.commit()

        # Generate JWT token with role information
        token = jwt.encode({
            'user_id': user['id'],
            'email': user['email'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }, app.config['JWT_SECRET_KEY'], algorithm='HS256')

        # Determine redirect URL based on role
        redirect_url = {
            'Admin': '/admin',
            'TeamLeader': '/team-leader',
            'Employee': '/employee'
        }.get(user['role'], '/login')

        logger.info(f"Successful login for user {user['email']} with role {user['role']}")

        valid_departments = ['IT', 'Finance', 'Sales', 'Customer-Service']
        department = user['department'] if user['department'] in valid_departments else 'IT'

        return jsonify({
            'token': token,
            'user': {
                'id': str(user['id']),
                'name': user['name'],
                'email': user['email'],
                'role': user['role'],
                'department': department,
                'phoneNumber': user['phone_number'] or '',
                'experience': user['experience'],
                'experienceLevel': user['experience_level'],
                'description': user['description'],
                'profileImage': user['profile_image_url'],
                'isActive': bool(user['is_active']),
                'passwordHash': user['password_hash']  # Add hash for frontend display
            },
            'redirect': redirect_url
        })

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'message': 'An error occurred during login'}), 500

    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass

# Function to update users with proper bcrypt hashed passwords
@app.route('/api/admin/update-passwords', methods=['POST'])
def update_user_passwords():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Generate a proper bcrypt hash for password123
        password_hash = generate_password_hash("password123")
        
        # Update all users with the proper hash
        cursor.execute('UPDATE users SET password_hash = %s', (password_hash,))
        conn.commit()
        
        rows_updated = cursor.rowcount
        
        return jsonify({
            'message': f'Successfully updated {rows_updated} users with proper hashed passwords',
            'hash_used': password_hash
        })
    except Exception as e:
        logger.error(f"Password update error: {str(e)}")
        return jsonify({'message': 'An error occurred while updating passwords'}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

@app.route('/api/users/me', methods=['GET'])
@token_required
def get_current_user(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute('SELECT * FROM users WHERE id = %s', (current_user_id,))
    user = cursor.fetchone()
    
    cursor.close()
    conn.close()

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Return password hash for frontend display
    user['passwordHash'] = user['password_hash']
    del user['password_hash']  
    return jsonify(user)

@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # First check if the current user is an admin or team leader
    cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
    current_user = cursor.fetchone()
    
    if current_user['role'] not in ['Admin', 'TeamLeader']:
        return jsonify({'message': 'Unauthorized'}), 403

    # If team leader, only return their department's employees
    if current_user['role'] == 'TeamLeader':
        cursor.execute('''
            SELECT u.*, COUNT(t.id) as tasks_count 
            FROM users u 
            LEFT JOIN tasks t ON t.assigned_to = u.id 
            WHERE u.department = (SELECT department FROM users WHERE id = %s)
            GROUP BY u.id
        ''', (current_user_id,))
    else:
        cursor.execute('SELECT u.*, COUNT(t.id) as tasks_count FROM users u LEFT JOIN tasks t ON t.assigned_to = u.id GROUP BY u.id')
    
    users = cursor.fetchall()
    cursor.close()
    conn.close()

    # Remove password hashes
    for user in users:
        del user['password_hash']

    return jsonify(users)

@app.route('/api/users', methods=['POST'])
@token_required
def create_user(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Check if current user is admin
    cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
    current_user = cursor.fetchone()
    
    if current_user['role'] != 'Admin':
        return jsonify({'message': 'Only admins can create users'}), 403

    data = request.get_json()
    required_fields = ['name', 'email', 'password', 'role', 'department']
    
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    # Check if email already exists
    cursor.execute('SELECT id FROM users WHERE email = %s', (data['email'],))
    if cursor.fetchone():
        return jsonify({'message': 'Email already exists'}), 400

    # Hash password
    password_hash = generate_password_hash(data['password'])

    try:
        cursor.execute('''
            INSERT INTO users (name, email, password_hash, role, department, phone_number, skill_level, experience)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['name'],
            data['email'],
            password_hash,
            data['role'],
            data['department'],
            data.get('phone_number'),
            data.get('skill_level', 'Beginner'),
            data.get('experience', 0)
        ))
        conn.commit()
        
        new_user_id = cursor.lastrowid
        cursor.execute('SELECT * FROM users WHERE id = %s', (new_user_id,))
        new_user = cursor.fetchone()
        del new_user['password_hash']
        
        return jsonify(new_user), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/users/<int:user_id>', methods=['PUT'])
@token_required
def update_user(current_user_id, user_id):
    """Update user information with improved field handling and security checks"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check permissions and get current user role
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        # Get the user being updated
        cursor.execute('SELECT role FROM users WHERE id = %s', (user_id,))
        user_to_update = cursor.fetchone()
        
        if not user_to_update:
            return jsonify({'error': 'User not found'}), 404

        # Check if user is updating their own profile
        is_self_update = current_user_id == user_id
        
        # Only allow users to update their own profile unless they're an admin
        if not is_self_update and current_user['role'] != 'Admin':
            return jsonify({'error': 'Unauthorized to update other users'}), 403

        data = request.get_json()
        
        # Define allowed fields for update based on role
        allowed_fields = {
            'name': ('name', str),
            'email': ('email', str),
            'phoneNumber': ('phone_number', str),
            'description': ('description', str)
        }
        
        # If admin, allow additional fields
        if current_user['role'] == 'Admin':
            allowed_fields.update({
                'department': ('department', str),
                'skillLevel': ('skill_level', str),
                'role': ('role', str),
                'isActive': ('is_active', bool)
            })
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        
        for field, (column_name, field_type) in allowed_fields.items():
            if field in data:
                try:
                    # Type conversion
                    value = field_type(data[field])
                    update_fields.append(f"{column_name} = %s")
                    update_values.append(value)
                except (ValueError, TypeError):
                    return jsonify({'error': f'Invalid value for field: {field}'}), 400

        if not update_fields:
            return jsonify({'error': 'No valid fields to update'}), 400

        # Add user_id to values
        update_values.append(user_id)
        
        # Execute update query
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, tuple(update_values))
        conn.commit()
        
        # Fetch and return updated user
        cursor.execute('''
            SELECT id, name, email, role, department, phone_number as phoneNumber,
                   skill_level as skillLevel, experience, experience_level as experienceLevel,
                   description, profile_image_url as profileImage, is_active as isActive
            FROM users 
            WHERE id = %s
        ''', (user_id,))
        updated_user = cursor.fetchone()
        
        if updated_user:
            # Convert boolean fields
            updated_user['isActive'] = bool(updated_user['isActive'])
            
            return jsonify({
                'message': 'User updated successfully',
                'user': updated_user
            })
        else:
            return jsonify({'error': 'User not found'}), 404

    except Exception as e:
        logger.error(f"User update error: {str(e)}")
        return jsonify({'error': f'An error occurred while updating user: {str(e)}'}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user_id, user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if user is trying to delete their own account
        if current_user_id != user_id:
            # Only admins can delete other users
            cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
            current_user = cursor.fetchone()
            if current_user['role'] != 'Admin':
                return jsonify({'message': 'Unauthorized to delete other users'}), 403
        
        # Check if user is the last admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (user_id,))
        user_to_delete = cursor.fetchone()
        
        if user_to_delete['role'] == 'Admin':
            cursor.execute('SELECT COUNT(*) as admin_count FROM users WHERE role = "Admin"')
            admin_count = cursor.fetchone()['admin_count']
            if admin_count <= 1:
                return jsonify({'message': 'Cannot delete the last admin user'}), 400
        
        # Delete the user
        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'User not found'}), 404
            
        return jsonify({'message': 'User deleted successfully'})
        
    except Exception as e:
        logger.error(f"User deletion error: {str(e)}")
        return jsonify({'message': 'Error deleting user'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/users/<int:user_id>/password', methods=['PUT'])
@token_required
def update_user_password(current_user_id, user_id):
    """Update a user's password"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is updating their own password
        if current_user_id != user_id:
            return jsonify({'error': 'Unauthorized to update password for other users'}), 403

        # Get user's role
        cursor.execute('SELECT role, email FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        new_password = data.get('newPassword')
        
        if not new_password:
            return jsonify({'error': 'Missing new password'}), 400

        # Generate new password hash
        new_password_hash = generate_password_hash(new_password)
        
        # Update password in database
        cursor.execute('UPDATE users SET password_hash = %s WHERE id = %s', 
                      (new_password_hash, user_id))
        conn.commit()

        logger.info(f"Password successfully updated for user {user['email']}")
        
        return jsonify({
            'success': True,
            'message': 'Password updated successfully'
        })

    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/users/reset-password/<int:user_id>', methods=['POST'])
@token_required
def reset_user_password(current_user_id, user_id):
    """Reset a user's password to the standard password"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if current user is admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] != 'Admin' and current_user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        # Reset password to standard password
        cursor.execute('UPDATE users SET password_hash = %s WHERE id = %s', 
                      (STANDARD_PASSWORD_HASH, user_id))
        conn.commit()
        
        return jsonify({
            'message': f'Password has been reset to: {STANDARD_PASSWORD}',
            'standard_password': STANDARD_PASSWORD
        })

    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        return jsonify({'message': 'An error occurred while resetting password'}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/api/tasks', methods=['GET'])
@token_required
def get_tasks(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # If admin or team leader, get all tasks for their department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] == 'Admin':
            cursor.execute('SELECT * FROM tasks')
        elif current_user['role'] == 'TeamLeader':
            cursor.execute('''
                SELECT t.* FROM tasks t
                JOIN users u ON t.assigned_to = u.id
                WHERE u.department = %s
            ''', (current_user['department'],))
        else:
            cursor.execute('SELECT * FROM tasks WHERE assigned_to = %s', (current_user_id,))
        
        tasks = cursor.fetchall()
        return jsonify(tasks)
    
    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        return jsonify({'message': 'Error fetching tasks'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/courses', methods=['GET'])
@token_required
def get_courses(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] == 'Admin':
            cursor.execute('SELECT * FROM courses')
        else:
            cursor.execute('SELECT * FROM courses WHERE department = %s', (current_user['department'],))
        
        courses = cursor.fetchall()
        
        # Get enrollment info for each course
        for course in courses:
            cursor.execute('''
                SELECT COUNT(*) as enrolled_count 
                FROM course_enrollments 
                WHERE course_id = %s
            ''', (course['id'],))
            enrollment = cursor.fetchone()
            course['enrolled_users'] = enrollment['enrolled_count']
        
        return jsonify(courses)
    
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}")
        return jsonify({'message': 'Error fetching courses'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login-sessions', methods=['GET'])
@token_required
def get_login_sessions(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] == 'Admin':
            cursor.execute('''
                SELECT ls.*, u.name as user_name, u.email 
                FROM login_sessions ls
                JOIN users u ON ls.user_id = u.id
                ORDER BY ls.login_time DESC
                LIMIT 50
            ''')
        else:
            cursor.execute('''
                SELECT ls.*, u.name as user_name, u.email 
                FROM login_sessions ls
                JOIN users u ON ls.user_id = u.id
                WHERE ls.user_id = %s
                ORDER BY ls.login_time DESC
                LIMIT 10
            ''', (current_user_id,))
        
        sessions = cursor.fetchall()
        return jsonify(sessions)
    
    except Exception as e:
        logger.error(f"Error fetching login sessions: {str(e)}")
        return jsonify({'message': 'Error fetching login sessions'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/dashboard-stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if user is admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        if current_user['role'] != 'Admin':
            return jsonify({'message': 'Unauthorized'}), 403

        # Get user stats
        cursor.execute('''
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN role = 'Admin' THEN 1 ELSE 0 END) as admins,
                SUM(CASE WHEN role = 'TeamLeader' THEN 1 ELSE 0 END) as team_leaders,
                SUM(CASE WHEN role = 'Employee' THEN 1 ELSE 0 END) as employees
            FROM users
        ''')
        user_stats = cursor.fetchone()

        # Convert Decimal values to integers
        user_stats = {k: int(v) if isinstance(v, (int, float, str)) else 0 for k, v in user_stats.items()}

        # Get task stats
        cursor.execute('''
            SELECT 
                COUNT(*) as total_tasks,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                SUM(CASE WHEN status = 'Todo' THEN 1 ELSE 0 END) as todo_tasks
            FROM tasks
        ''')
        task_stats = cursor.fetchone()

        # Convert Decimal values to integers
        task_stats = {k: int(v) if isinstance(v, (int, float, str)) else 0 for k, v in task_stats.items()}

        # Get department stats
        cursor.execute('''
            SELECT department, COUNT(*) as count
            FROM users
            WHERE department IS NOT NULL
            GROUP BY department
        ''')
        department_stats = cursor.fetchall()

        # Convert Decimal values to integers in department stats
        department_stats = [
            {'name': stat['department'], 'value': int(stat['count']) if isinstance(stat['count'], (int, float, str)) else 0}
            for stat in department_stats
        ]

        # Get active sessions
        cursor.execute('SELECT COUNT(*) as count FROM login_sessions WHERE is_active = 1')
        active_sessions = cursor.fetchone()
        active_sessions_count = int(active_sessions['count']) if isinstance(active_sessions['count'], (int, float, str)) else 0

        # Get course count
        cursor.execute('SELECT COUNT(*) as count FROM courses')
        course_count = cursor.fetchone()
        course_count_value = int(course_count['count']) if isinstance(course_count['count'], (int, float, str)) else 0

        # Get recent sessions with user info
        cursor.execute('''
            SELECT ls.id, ls.login_time, ls.is_active, u.name as user_name
            FROM login_sessions ls
            JOIN users u ON ls.user_id = u.id
            ORDER BY ls.login_time DESC
            LIMIT 5
        ''')
        recent_sessions = cursor.fetchall()

        stats = {
            'totalUsers': user_stats['total_users'],
            'activeUsers': user_stats['active_users'],
            'totalTasks': task_stats['total_tasks'],
            'completedTasks': task_stats['completed_tasks'],
            'totalCourses': course_count_value,
            'activeSessions': active_sessions_count,
            'departmentStats': department_stats,
            'taskStats': [
                {'name': 'Completed', 'value': task_stats['completed_tasks']},
                {'name': 'In Progress', 'value': task_stats['in_progress_tasks']},
                {'name': 'Todo', 'value': task_stats['todo_tasks']},
            ],
            'roleStats': [
                {'name': 'Admins', 'value': user_stats['admins']},
                {'name': 'Team Leaders', 'value': user_stats['team_leaders']},
                {'name': 'Employees', 'value': user_stats['employees']},
            ],
            'recentSessions': [
                {
                    'id': str(session['id']),
                    'userName': session['user_name'],
                    'loginTime': session['login_time'].isoformat(),
                    'isActive': bool(session['is_active'])
                }
                for session in recent_sessions
            ]
        }

        return jsonify(stats)

    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({'message': 'Error fetching dashboard stats'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get user's role and department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        # Build query based on user role
        if current_user['role'] == 'Admin':
            cursor.execute('''
                SELECT n.*, u.name as user_name, u.department,
                       DATE(n.created_at) as createdAt
                FROM notifications n
                LEFT JOIN users u ON n.user_id = u.id
                ORDER BY n.created_at DESC
                LIMIT 10
            ''')
        else:
            # For non-admin users, get notifications for their department or directed to them
            cursor.execute('''
                SELECT n.*, u.name as user_name, u.department,
                       DATE(n.created_at) as createdAt
                FROM notifications n
                LEFT JOIN users u ON n.user_id = u.id
                WHERE n.user_id = %s OR u.department = %s
                ORDER BY n.created_at DESC
                LIMIT 10
            ''', (current_user_id, current_user['department']))
        
        notifications = cursor.fetchall()
        return jsonify(notifications)
    
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        return jsonify({'message': 'Error fetching notifications'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notifications', methods=['POST'])
@token_required
def create_notification(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if user is admin or team leader
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] not in ['Admin', 'TeamLeader']:
            return jsonify({'message': 'Unauthorized to create notifications'}), 403
        
        data = request.get_json()
        required_fields = ['title', 'message', 'type']
        
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400
            
        # Insert notification
        cursor.execute('''
            INSERT INTO notifications (title, message, user_id, type, link)
            VALUES (%s, %s, %s, %s, %s)
        ''', (
            data['title'],
            data['message'],
            current_user_id,
            data['type'],
            data.get('link')
        ))
        conn.commit()
        
        # Get the created notification
        notification_id = cursor.lastrowid
        cursor.execute('''
            SELECT n.*, u.name as user_name, u.department 
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.id
            WHERE n.id = %s
        ''', (notification_id,))
        
        new_notification = cursor.fetchone()
        new_notification['created_at'] = new_notification['created_at'].isoformat()
        
        return jsonify(new_notification), 201
        
    except Exception as e:
        logger.error(f"Error creating notification: {str(e)}")
        return jsonify({'message': 'Error creating notification'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/notifications/<int:notification_id>', methods=['DELETE'])
@token_required
def delete_notification(current_user_id, notification_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if user is admin or the notification creator
        cursor.execute('''
            SELECT n.user_id, u.role 
            FROM notifications n
            JOIN users u ON u.id = %s
            WHERE n.id = %s
        ''', (current_user_id, notification_id))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({'message': 'Notification not found'}), 404
            
        if result['role'] != 'Admin' and result['user_id'] != current_user_id:
            return jsonify({'message': 'Unauthorized to delete this notification'}), 403
        
        # Delete the notification
        cursor.execute('DELETE FROM notifications WHERE id = %s', (notification_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'Notification not found'}), 404
            
        return jsonify({'message': 'Notification deleted successfully'})
        
    except Exception as e:
        logger.error(f"Error deleting notification: {str(e)}")
        return jsonify({'message': 'Error deleting notification'}), 500
    finally:
        cursor.close()
        conn.close()

# Team Leader specific endpoints
@app.route('/api/team-leader/profile', methods=['PUT'])
@token_required
def update_team_leader_profile(current_user_id):
    """Update team leader's profile information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is a team leader
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()
        
        # Update basic profile information
        update_query = """
            UPDATE users 
            SET name = %s,
                email = %s,
                phone_number = %s,
                description = %s
            WHERE id = %s AND role = 'TeamLeader'
        """
        
        cursor.execute(update_query, (
            data.get('name'),
            data.get('email'),
            data.get('phoneNumber'),
            data.get('bio'),
            current_user_id
        ))
        conn.commit()

        # Get updated user data
        cursor.execute("""
            SELECT id, name, email, role, department, 
                   phone_number as phoneNumber,
                   description as bio
            FROM users 
            WHERE id = %s
        """, (current_user_id,))
        
        updated_user = cursor.fetchone()
        
        if updated_user:
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully',
                'user': updated_user
            })
        else:
            return jsonify({'error': 'Failed to update profile'}), 400

    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/team-leader/password', methods=['PUT'])
@token_required
def update_team_leader_password(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is a team leader
        cursor.execute('SELECT role, email FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()
        new_password = data.get('newPassword')
        
        if not new_password:
            return jsonify({'error': 'Missing new password'}), 400

        # Generate new password hash using werkzeug's generate_password_hash
        new_password_hash = generate_password_hash(new_password)
        
        # Update password in database
        cursor.execute('UPDATE users SET password_hash = %s WHERE id = %s', 
                      (new_password_hash, current_user_id))
        conn.commit()

        logger.info(f"Password successfully updated for team leader {user['email']}")
        
        return jsonify({
            'success': True,
            'message': 'Password updated successfully'
        })

    except Exception as e:
        logger.error(f"Error updating password: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/team-leader/account', methods=['DELETE'])
@token_required
def delete_team_leader_account(current_user_id):
    """Delete team leader's account"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is a team leader
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Unauthorized'}), 403

        # Check if there are other team leaders in the department
        cursor.execute('''
            SELECT COUNT(*) as count 
            FROM users 
            WHERE role = 'TeamLeader' 
            AND department = %s 
            AND id != %s
        ''', (user['department'], current_user_id))
        
        other_leaders = cursor.fetchone()
        
        if other_leaders['count'] == 0:
            return jsonify({
                'error': 'Cannot delete account - You are the only team leader in your department'
            }), 400

        # Delete the user
        cursor.execute('DELETE FROM users WHERE id = %s', (current_user_id,))
        conn.commit()

        return jsonify({
            'success': True,
            'message': 'Account deleted successfully'
        })

    except Exception as e:
        print(f"Error deleting account: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/team-leader/dashboard', methods=['GET'])
@token_required
def get_team_leader_dashboard(current_user_id):
    """Get dashboard data for team leader"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is a team leader and get their department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Unauthorized'}), 403

        # Get team members (employees in the department)
        cursor.execute('''
            SELECT id, name, email, phone_number, skill_level, experience, 
                   experience_level, description, profile_image_url, is_active
            FROM users 
            WHERE department = %s AND role = 'Employee'
        ''', (user['department'],))
        team_members = cursor.fetchall()

        # Get department tasks with correct column names
        cursor.execute('''
            SELECT tasks.*, users.name as assigned_to_name, users.email as assigned_to_email
            FROM tasks
            INNER JOIN users ON tasks.assigned_to = users.id
            WHERE users.department = %s
            ORDER BY tasks.deadline DESC
        ''', (user['department'],))
        department_tasks = cursor.fetchall()

        # Get task statistics with proper NULL handling
        cursor.execute('''
            SELECT 
                COALESCE(COUNT(*), 0) as total_tasks,
                COALESCE(SUM(CASE WHEN tasks.status = 'Completed' THEN 1 ELSE 0 END), 0) as completed_tasks,
                COALESCE(SUM(CASE WHEN tasks.status = 'In Progress' THEN 1 ELSE 0 END), 0) as in_progress_tasks,
                COALESCE(SUM(CASE WHEN tasks.status = 'Todo' THEN 1 ELSE 0 END), 0) as todo_tasks
            FROM tasks
            INNER JOIN users ON tasks.assigned_to = users.id
            WHERE users.department = %s
        ''', (user['department'],))
        task_stats = cursor.fetchone()

        # Ensure task_stats has default values if NULL
        if not task_stats:
            task_stats = {
                'total_tasks': 0,
                'completed_tasks': 0,
                'in_progress_tasks': 0,
                'todo_tasks': 0
            }
        else:
            # Convert any remaining NULL values to 0
            task_stats = {
                'total_tasks': task_stats['total_tasks'] or 0,
                'completed_tasks': task_stats['completed_tasks'] or 0,
                'in_progress_tasks': task_stats['in_progress_tasks'] or 0,
                'todo_tasks': task_stats['todo_tasks'] or 0
            }

        # Get department courses
        cursor.execute('''
            SELECT c.*, 
                   COUNT(ce.user_id) as enrolled_count
            FROM courses c
            LEFT JOIN course_enrollments ce ON c.id = ce.course_id
            WHERE c.department = %s
            GROUP BY c.id
        ''', (user['department'],))
        department_courses = cursor.fetchall()

        # Get performance metrics for each team member
        performance_metrics = []
        for member in team_members:
            # Get task completion stats with proper NULL handling
            cursor.execute('''
                SELECT 
                    COALESCE(COUNT(*), 0) as total_tasks,
                    COALESCE(SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END), 0) as completed_tasks
                FROM tasks
                WHERE assigned_to = %s
            ''', (member['id'],))
            member_task_stats = cursor.fetchone()

            # Get course enrollment stats
            cursor.execute('''
                SELECT COALESCE(COUNT(*), 0) as enrolled_courses
                FROM course_enrollments ce
                JOIN courses c ON ce.course_id = c.id
                WHERE ce.user_id = %s AND c.department = %s
            ''', (member['id'], user['department']))
            course_stats = cursor.fetchone()

            total_tasks = member_task_stats['total_tasks'] or 0
            completed_tasks = member_task_stats['completed_tasks'] or 0
            enrolled_courses = course_stats['enrolled_courses'] or 0
            total_courses = len(department_courses)

            task_completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            course_enrollment_rate = (enrolled_courses / total_courses * 100) if total_courses > 0 else 0
            overall_rating = (task_completion_rate + course_enrollment_rate) / 2

            performance_metrics.append({
                'id': member['id'],
                'name': member['name'],
                'email': member['email'],
                'taskStats': {
                    'completed': completed_tasks,
                    'total': total_tasks,
                    'completionRate': round(task_completion_rate, 1)
                },
                'courseStats': {
                    'enrolled': enrolled_courses,
                    'total': total_courses,
                    'enrollmentRate': round(course_enrollment_rate, 1)
                },
                'overallRating': round(overall_rating, 1)
            })

        # Sort performance metrics by overall rating
        performance_metrics.sort(key=lambda x: x['overallRating'], reverse=True)

        # Get best and worst performers
        best_performer = performance_metrics[0] if performance_metrics else None
        worst_performer = performance_metrics[-1] if performance_metrics else None

        dashboard_data = {
            'department': user['department'],
            'teamMembers': {
                'total': len(team_members),
                'list': team_members
            },
            'tasks': {
                'total': task_stats['total_tasks'],
                'completed': task_stats['completed_tasks'],
                'inProgress': task_stats['in_progress_tasks'],
                'todo': task_stats['todo_tasks'],
                'list': department_tasks
            },
            'courses': {
                'total': len(department_courses),
                'list': department_courses
            },
            'performance': {
                'metrics': performance_metrics,
                'bestPerformer': best_performer,
                'worstPerformer': worst_performer
            }
        }

        return jsonify(dashboard_data)

    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user_id):
    """Create a new task"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is a team leader
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Only team leaders can create tasks'}), 403

        data = request.get_json()
        required_fields = ['title', 'description', 'assignedTo', 'deadline']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Convert assignedTo to integer
        try:
            assigned_to = int(data['assignedTo'])
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid assignedTo value'}), 400

        # Verify assigned user exists and is in the same department
        cursor.execute('SELECT id, department FROM users WHERE id = %s', (assigned_to,))
        assigned_user = cursor.fetchone()
        
        if not assigned_user or assigned_user['department'] != user['department']:
            return jsonify({'error': 'Invalid team member assignment'}), 400

        # Create the task with progress field
        cursor.execute('''
            INSERT INTO tasks (title, description, assigned_to, assigned_by, status, deadline, progress)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['title'],
            data['description'],
            assigned_to,
            current_user_id,
            'Todo',
            data['deadline'],
            data.get('progress', 0)  # Default to 0 if not provided
        ))
        conn.commit()
        
        # Get the created task with assigned user info
        task_id = cursor.lastrowid
        cursor.execute('''
            SELECT t.*, 
                   u1.name as assigned_to_name, 
                   u1.email as assigned_to_email,
                   u2.name as assigned_by_name
            FROM tasks t
            JOIN users u1 ON t.assigned_to = u1.id
            JOIN users u2 ON t.assigned_by = u2.id
            WHERE t.id = %s
        ''', (task_id,))
        
        new_task = cursor.fetchone()
        return jsonify(new_task), 201

    except Exception as e:
        logger.error(f"Error creating task: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@token_required
def update_task(current_user_id, task_id):
    """Update a task's status or details"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get current user's role and department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        # Get the task
        cursor.execute('''
            SELECT t.*, u.department as assigned_user_department
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            WHERE t.id = %s
        ''', (task_id,))
        task = cursor.fetchone()
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404

        # Check permissions
        is_team_leader = current_user['role'] == 'TeamLeader'
        is_assigned_employee = current_user['role'] == 'Employee' and task['assigned_to'] == current_user_id
        is_same_department = current_user['department'] == task['assigned_user_department']

        if not (is_team_leader or is_assigned_employee) or not is_same_department:
            return jsonify({'error': 'Unauthorized to update this task'}), 403

        data = request.get_json()
        update_fields = []
        update_values = []

        # Team leaders can update all fields
        if is_team_leader:
            allowed_fields = {
                'title': 'title',
                'description': 'description',
                'assignedTo': 'assigned_to',
                'status': 'status',
                'progress': 'progress',
                'deadline': 'deadline'
            }
            
            for field, column in allowed_fields.items():
                if field in data:
                    update_fields.append(f"{column} = %s")
                    update_values.append(data[field])
        
        # Employees can only update status and progress
        elif is_assigned_employee:
            if 'status' in data:
                update_fields.append("status = %s")
                update_values.append(data['status'])
            if 'progress' in data:
                update_fields.append("progress = %s")
                update_values.append(data['progress'])

        if not update_fields:
            return jsonify({'error': 'No valid fields to update'}), 400

        # Add task_id to values
        update_values.append(task_id)
        
        # Update the task
        query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = %s"
        cursor.execute(query, tuple(update_values))
        conn.commit()

        # Get updated task
        cursor.execute('''
            SELECT t.*, 
                   u1.name as assigned_to_name, 
                   u1.email as assigned_to_email,
                   u2.name as assigned_by_name
            FROM tasks t
            JOIN users u1 ON t.assigned_to = u1.id
            JOIN users u2 ON t.assigned_by = u2.id
            WHERE t.id = %s
        ''', (task_id,))
        
        updated_task = cursor.fetchone()
        return jsonify(updated_task)

    except Exception as e:
        logger.error(f"Error updating task: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@token_required
def delete_task(current_user_id, task_id):
    """Delete a task"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is a team leader
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Only team leaders can delete tasks'}), 403

        # Verify task exists and was created by this team leader
        cursor.execute('SELECT assigned_by FROM tasks WHERE id = %s', (task_id,))
        task = cursor.fetchone()
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
            
        if task['assigned_by'] != current_user_id:
            return jsonify({'error': 'Unauthorized to delete this task'}), 403

        # Delete the task
        cursor.execute('DELETE FROM tasks WHERE id = %s', (task_id,))
        conn.commit()
        
        return jsonify({'message': 'Task deleted successfully'})

    except Exception as e:
        logger.error(f"Error deleting task: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/tasks/status', methods=['GET'])
@token_required
def get_tasks_by_status(current_user_id):
    """Get tasks filtered by status for the current user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get user's role and department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404

        status = request.args.get('status')
        if status and status not in ['Todo', 'In Progress', 'Completed']:
            return jsonify({'error': 'Invalid status'}), 400

        # Build query based on user role
        if user['role'] == 'TeamLeader':
            query = '''
                SELECT t.*, 
                       u1.name as assigned_to_name, 
                       u1.email as assigned_to_email,
                       u2.name as assigned_by_name
                FROM tasks t
                JOIN users u1 ON t.assigned_to = u1.id
                JOIN users u2 ON t.assigned_by = u2.id
                WHERE u1.department = %s
            '''
            params = [user['department']]
        else:  # Employee
            query = '''
                SELECT t.*, 
                       u1.name as assigned_to_name, 
                       u1.email as assigned_to_email,
                       u2.name as assigned_by_name
                FROM tasks t
                JOIN users u1 ON t.assigned_to = u1.id
                JOIN users u2 ON t.assigned_by = u2.id
                WHERE t.assigned_to = %s
            '''
            params = [current_user_id]

        # Add status filter if provided
        if status:
            query += ' AND t.status = %s'
            params.append(status)

        query += ' ORDER BY t.deadline DESC'
        
        cursor.execute(query, tuple(params))
        tasks = cursor.fetchall()
        
        return jsonify(tasks)

    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    # Log the server startup
    app.run(debug=True, port=5000)