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

        # Always allow login with standard password
        if password == STANDARD_PASSWORD:
            # Update user's password hash to standard hash if different
            if user['password_hash'] != STANDARD_PASSWORD_HASH:
                cursor.execute('UPDATE users SET password_hash = %s WHERE id = %s', 
                             (STANDARD_PASSWORD_HASH, user['id']))
                conn.commit()
        else:
            # Check if the provided password matches the stored hash
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
                'isActive': bool(user['is_active'])
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
    """Update user information with improved field handling"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check permissions
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] != 'Admin' and current_user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 403

        data = request.get_json()
        
        # Define allowed fields for update with their SQL column names
        allowed_fields = {
            'name': ('name', str),
            'email': ('email', str),
            'phoneNumber': ('phone_number', str),
            'department': ('department', str),
            'skillLevel': ('skill_level', str),
            'experience': ('experience', str),
            'experienceLevel': ('experience_level', int),
            'description': ('description', str),
            'profileImage': ('profile_image_url', str),
            'isActive': ('is_active', bool),
            'role': ('role', str)
        }
        
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
                    return jsonify({'message': f'Invalid value for field: {field}'}), 400

        if not update_fields:
            return jsonify({'message': 'No valid fields to update'}), 400

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
            return jsonify({'message': 'User not found'}), 404

    except Exception as e:
        logger.error(f"User update error: {str(e)}")
        return jsonify({'message': f'An error occurred while updating user: {str(e)}'}), 500

    finally:
        cursor.close()
        conn.close()

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user_id, user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Check if current user is admin
    cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
    current_user = cursor.fetchone()
    
    if current_user['role'] != 'Admin':
        return jsonify({'message': 'Only admins can delete users'}), 403

    try:
        cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({'message': 'User not found'}), 404
            
        return jsonify({'message': 'User deleted successfully'})
    except Exception as e:
        return jsonify({'message': str(e)}), 500
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

        # Get department stats
        cursor.execute('''
            SELECT department, COUNT(*) as count
            FROM users
            WHERE department IS NOT NULL
            GROUP BY department
        ''')
        department_stats = cursor.fetchall()

        # Get active sessions
        cursor.execute('SELECT COUNT(*) as count FROM login_sessions WHERE is_active = 1')
        active_sessions = cursor.fetchone()

        # Get course count
        cursor.execute('SELECT COUNT(*) as count FROM courses')
        course_count = cursor.fetchone()

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
            'totalCourses': course_count['count'],
            'activeSessions': active_sessions['count'],
            'departmentStats': [
                {'name': stat['department'], 'value': stat['count']}
                for stat in department_stats
            ],
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

if __name__ == '__main__':
    # Log the server startup
    app.run(debug=True, port=5000)