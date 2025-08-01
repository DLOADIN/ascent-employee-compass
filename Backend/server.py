from flask import Flask, request, jsonify, send_file
from flask_cors import CORS, cross_origin
from mysql.connector import connect
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
import jwt
import datetime
import os
from pathlib import Path
import logging
from functools import wraps
from dotenv import load_dotenv
import json
from fpdf import FPDF
import io
import traceback
from decimal import Decimal
from werkzeug.utils import secure_filename
import time

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
        "origins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost:8082",
            "http://localhost:8083",
            "http://localhost:8084"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

@app.after_request
def after_request(response):
    origin = request.headers.get('Origin')
    if origin:
        response.headers['Access-Control-Allow-Origin'] = origin
    else:
        response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,PUT,DELETE,PATCH,OPTIONS'
    return response

# If not present, add an OPTIONS handler for /api/job-opportunities
@app.route('/api/job-opportunities', methods=['OPTIONS'])
def job_opportunities_options():
    return '', 200

CV_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'cvs')
os.makedirs(CV_UPLOAD_FOLDER, exist_ok=True)

QUIZ_SUBMISSION_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'quiz_submissions')
os.makedirs(QUIZ_SUBMISSION_FOLDER, exist_ok=True)

QUIZ_UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'quizzes')
os.makedirs(QUIZ_UPLOAD_FOLDER, exist_ok=True)

TASK_DOCUMENTS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads', 'task_documents')
os.makedirs(TASK_DOCUMENTS_FOLDER, exist_ok=True)

# # Database configuration
# db_config = {
#     'host': os.getenv('DB_HOST', 'localhost'),
#     'user': os.getenv('DB_USER', 'root'),
#     'password': os.getenv('DB_PASSWORD', ''),
#     'database': os.getenv('DB_NAME', 'hrdatabase'),
#     'port': int(os.getenv('DB_PORT', 3306))
# }


# Database configuration
db_config = {
    'host': os.getenv('DB_HOST', 'manzi897098.mysql.pythonanywhere-services.com'),
    'user': os.getenv('DB_USER', 'manzi897098'),
    'password': os.getenv('DB_PASSWORD', 'Sars1212@1220120'),
    'database': os.getenv('DB_NAME', 'manzi897098$default'),
    'port': int(os.getenv('DB_PORT', 3306))
}

# JWT Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'x7k9p2m4q8v5n3j6h1t0r2y5u8w3z6b9')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'hr_management_jwt_secret_key_2024_secure')

# Add this after your app initialization
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


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
            SELECT u.*, COUNT(t.id) as tasks_count,
                   ja.cv_url, ja.job_title as cv_job_title, ja.submitted_at as cv_submitted_at
            FROM users u 
            LEFT JOIN tasks t ON t.assigned_to = u.id 
            LEFT JOIN (
                SELECT user_id, cv_url, job_title, submitted_at,
                       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY submitted_at DESC) as rn
                FROM job_applications 
                WHERE cv_url IS NOT NULL
            ) ja ON u.id = ja.user_id AND ja.rn = 1
            WHERE u.department = (SELECT department FROM users WHERE id = %s)
            GROUP BY u.id
        ''', (current_user_id,))
    else:
        cursor.execute('''
            SELECT u.*, COUNT(t.id) as tasks_count,
                   ja.cv_url, ja.job_title as cv_job_title, ja.submitted_at as cv_submitted_at
            FROM users u 
            LEFT JOIN tasks t ON t.assigned_to = u.id 
            LEFT JOIN (
                SELECT user_id, cv_url, job_title, submitted_at,
                       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY submitted_at DESC) as rn
                FROM job_applications 
                WHERE cv_url IS NOT NULL
            ) ja ON u.id = ja.user_id AND ja.rn = 1
            GROUP BY u.id
        ''')
    
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
        task_stats = {
            'total_tasks': int(task_stats['total_tasks']),
            'completed_tasks': int(task_stats['completed_tasks']),
            'in_progress_tasks': int(task_stats['in_progress_tasks']),
            'todo_tasks': int(task_stats['todo_tasks'])
        }

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

        # Get total course enrollments from employee_course_demonstrations
        cursor.execute('SELECT COUNT(*) as count FROM employee_course_demonstrations')
        total_course_enrollments = int(cursor.fetchone()['count'])

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
            ],
            'totalCourseEnrollments': total_course_enrollments
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
        cursor.execute('''
            SELECT n.id, n.title, n.message, n.created_at as createdAt, n.is_read, n.user_id, n.type, n.link
            FROM notifications n
            ORDER BY n.created_at DESC
        ''')
        notifications = cursor.fetchall()
        for n in notifications:
            if isinstance(n['createdAt'], datetime.datetime):
                n['createdAt'] = n['createdAt'].isoformat()
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
            # Convert Decimal values to integers
            task_stats = {
                'total_tasks': int(task_stats['total_tasks']),
                'completed_tasks': int(task_stats['completed_tasks']),
                'in_progress_tasks': int(task_stats['in_progress_tasks']),
                'todo_tasks': int(task_stats['todo_tasks'])
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

        # For each course, get demonstration count from employee_course_demonstrations
        for course in department_courses:
            cursor.execute('''
                SELECT COUNT(*) as demo_count
                FROM employee_course_demonstrations d
                JOIN users u ON d.user_id = u.id
                WHERE u.department = %s
            ''', (user['department'],))
            demo_count = cursor.fetchone()['demo_count']
            course['demonstrations_count'] = demo_count

        # Get total number of completed courses by employees in the department
        cursor.execute('''
            SELECT COUNT(*) as completed_courses_count
            FROM course_enrollments ce
            JOIN users u ON ce.user_id = u.id
            WHERE ce.completed = 1 AND u.department = %s AND u.role = 'Employee'
        ''', (user['department'],))
        completed_courses_count = cursor.fetchone()['completed_courses_count']

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

            # Get course demonstration stats from employee_course_demonstrations
            cursor.execute('''
                SELECT COUNT(*) as total_demos, COUNT(DISTINCT course_name) as unique_courses
                FROM employee_course_demonstrations
                WHERE user_id = %s
            ''', (member['id'],))
            demo_stats = cursor.fetchone()
            total_demos = demo_stats['total_demos'] or 0
            unique_courses = demo_stats['unique_courses'] or 0
            total_courses = len(department_courses)

            total_tasks = member_task_stats['total_tasks'] or 0
            completed_tasks = member_task_stats['completed_tasks'] or 0

            task_completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
            # Use unique_courses for enrollment rate
            course_enrollment_rate = (unique_courses / total_courses * 100) if total_courses > 0 else 0
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
                    'enrolled': unique_courses,
                    'total': total_courses,
                    'demonstrations': total_demos,
                    'enrollmentRate': round(course_enrollment_rate, 1)
                },
                'overallRating': round(overall_rating, 1)
            })

        # Sort performance metrics by overall rating
        performance_metrics.sort(key=lambda x: x['overallRating'], reverse=True)

        # Get best and worst performers
        best_performer = performance_metrics[0] if performance_metrics else None
        worst_performer = performance_metrics[-1] if performance_metrics else None

        # Get total demonstration count for the team leader's department only
        cursor.execute('''
            SELECT COUNT(*) as demo_count
            FROM employee_course_demonstrations d
            JOIN users u ON d.user_id = u.id
            WHERE u.department = %s
        ''', (user['department'],))
        total_demonstrations = cursor.fetchone()['demo_count']

        # Find team members who have not started any tasks
        not_started_members = [
            m for m in performance_metrics if m['taskStats']['total'] == 0
        ]

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
                'total_demonstrations': total_demonstrations
            },
            'performance': {
                'metrics': performance_metrics,
                'bestPerformer': best_performer,
                'worstPerformer': worst_performer,
                'notStartedMembers': not_started_members
            }
        }

        return jsonify(convert_decimals(dashboard_data))

    except Exception as e:
        logger.error(f"Error fetching dashboard data: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()





@app.route('/api/employee/course-demonstration', methods=['POST'])
@token_required
def submit_course_demonstration(current_user_id):
    try:
        data = request.form
        course_name = data.get('course_name')
        project_title = data.get('project_title')
        project_description = data.get('project_description')

        if not all([course_name, project_title, project_description]):
            return jsonify({'error': 'Missing required fields'}), 400

        document_url = None
        if 'document' in request.files and request.files['document'].filename != '':
            document = request.files['document']
            filename = secure_filename(document.filename)
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_filename = f"{timestamp}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            try:
                document.save(filepath)
                document_url = filepath
            except Exception as e:
                logger.error(f"Error saving file: {str(e)}")
                return jsonify({'error': 'Error saving file'}), 500

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute('''
                INSERT INTO employee_course_demonstrations 
                (user_id, course_name, project_title, project_description, document_url)
                VALUES (%s, %s, %s, %s, %s)
            ''', (current_user_id, course_name, project_title, project_description, document_url))
            conn.commit()
        except Exception as e:
            logger.error(f"Database error: {str(e)}")
            # Clean up the file if database insert fails
            if document_url and os.path.exists(document_url):
                os.remove(document_url)
            return jsonify({'error': 'Database error'}), 500
        finally:
            cursor.close()
            conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Demonstration submitted successfully',
            'document_url': document_url
        })
        
    except Exception as e:
        logger.error(f"Error submitting demonstration: {str(e)}")
        return jsonify({'error': 'Server error', 'details': str(e)}), 500



@app.route('/api/tasks', methods=['POST'])
@token_required
def create_task(current_user_id):
    """Create a new task with department-based access control and file upload support"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get current user's role and department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if not current_user:
            return jsonify({'error': 'User not found'}), 404

        # Only allow TeamLeader and Admin to create tasks
        if current_user['role'] not in ['TeamLeader', 'Admin']:
            return jsonify({'error': 'Only team leaders and admins can create tasks'}), 403

        # Handle both JSON and form data
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Handle file upload
            data = request.form
            document_url = None
            
            # Handle file upload
            if 'document' in request.files and request.files['document'].filename != '':
                document = request.files['document']
                filename = secure_filename(document.filename)
                timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_filename = f"{timestamp}_{filename}"
                filepath = os.path.join(TASK_DOCUMENTS_FOLDER, unique_filename)
                try:
                    document.save(filepath)
                    document_url = f"/uploads/task_documents/{unique_filename}"
                except Exception as e:
                    logger.error(f"Error saving file: {str(e)}")
                    return jsonify({'error': 'Error saving file'}), 500
        else:
            # Handle JSON data
            data = request.get_json()
            document_url = None

        required_fields = ['title', 'description', 'assignedTo', 'deadline']
        
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400

        # Convert assignedTo to integer
        try:
            assigned_to = int(data['assignedTo'])
        except (ValueError, TypeError):
            return jsonify({'error': 'Invalid assignedTo value'}), 400

        # Verify assigned user exists and get their department
        cursor.execute('SELECT id, department FROM users WHERE id = %s', (assigned_to,))
        assigned_user = cursor.fetchone()
        
        if not assigned_user:
            return jsonify({'error': 'Assigned user not found'}), 404

        # Check department access
        if current_user['role'] == 'TeamLeader':
            # Customer Service team leaders can assign tasks to both Customer Service and Finance departments
            if current_user['department'] == 'Customer-Service':
                if assigned_user['department'] not in ['Customer-Service', 'Finance']:
                    return jsonify({'error': 'You can only assign tasks to users in Customer Service or Finance departments'}), 403
            else:
                # Other team leaders can only assign tasks within their department
                if assigned_user['department'] != current_user['department']:
                    return jsonify({'error': 'You can only assign tasks to users in your department'}), 403
        elif current_user['role'] == 'Admin':
            # Admins can assign tasks across departments
            pass

        # Create the task
        cursor.execute('''
            INSERT INTO tasks (title, description, assigned_to, assigned_by, status, deadline, progress, document_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ''', (
            data['title'],
            data['description'],
            assigned_to,
            current_user_id,
            'Todo',
            data['deadline'],
            data.get('progress', 0),
            document_url
        ))
        conn.commit()

        # Get the created task with assigned user info
        task_id = cursor.lastrowid
        cursor.execute('''
            SELECT t.*, 
                   u1.name as assigned_to_name, 
                   u1.email as assigned_to_email,
                   u1.department as assigned_to_department,
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
    """Get tasks filtered by status with department-based access control and progress calculation"""
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
        if user['role'] == 'Admin':
            # Admins can see all tasks
            query = '''
                SELECT t.*, 
                       u1.name as assigned_to_name, 
                       u1.email as assigned_to_email,
                       u1.department as assigned_to_department,
                       u2.name as assigned_by_name,
                       u2.email as assigned_by_email
                FROM tasks t
                JOIN users u1 ON t.assigned_to = u1.id
                JOIN users u2 ON t.assigned_by = u2.id
            '''
            params = []
        elif user['role'] == 'TeamLeader':
            # Customer Service team leaders can see tasks in both Customer Service and Finance departments
            if user['department'] == 'Customer-Service':
                query = '''
                    SELECT t.*, 
                           u1.name as assigned_to_name, 
                           u1.email as assigned_to_email,
                           u1.department as assigned_to_department,
                           u2.name as assigned_by_name,
                           u2.email as assigned_by_email
                    FROM tasks t
                    JOIN users u1 ON t.assigned_to = u1.id
                    JOIN users u2 ON t.assigned_by = u2.id
                    WHERE u1.department IN ('Customer-Service', 'Finance')
                '''
                params = []
            else:
                # Other team leaders can only see tasks in their department
                query = '''
                    SELECT t.*, 
                           u1.name as assigned_to_name, 
                           u1.email as assigned_to_email,
                           u1.department as assigned_to_department,
                           u2.name as assigned_by_name,
                           u2.email as assigned_by_email
                    FROM tasks t
                    JOIN users u1 ON t.assigned_to = u1.id
                    JOIN users u2 ON t.assigned_by = u2.id
                    WHERE u1.department = %s
                '''
                params = [user['department']]
        else:  # Employee
            # Employees can only see tasks assigned to them
            query = '''
                SELECT t.*, 
                       u1.name as assigned_to_name, 
                       u1.email as assigned_to_email,
                       u1.department as assigned_to_department,
                       u2.name as assigned_by_name,
                       u2.email as assigned_by_email
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
        
        # Calculate overall progress
        total_progress = 0
        for task in tasks:
            total_progress += task['progress'] if task['progress'] is not None else 0
        
        overall_progress = round(total_progress / len(tasks)) if tasks else 0

        # Get task counts by status
        task_counts = {
            'total': len(tasks),
            'completed': sum(1 for task in tasks if task['status'] == 'Completed'),
            'in_progress': sum(1 for task in tasks if task['status'] == 'In Progress'),
            'todo': sum(1 for task in tasks if task['status'] == 'Todo')
        }
        
        return jsonify({
            'tasks': tasks,
            'overall_progress': overall_progress,
            'task_counts': task_counts
        })

    except Exception as e:
        logger.error(f"Error fetching tasks: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

# Function to get all users for email recipients
@app.route('/api/all-users-for-email', methods=['GET'])
@token_required
def get_all_users_for_email(current_user_id):
    """Get all users (employees and team leaders) for email recipients"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Fetch all users with role Employee or TeamLeader
        cursor.execute('''
            SELECT id, name, email, role 
            FROM users 
            WHERE role = 'Employee' OR role = 'TeamLeader' OR role = 'Admin'
        ''') # Include Admin based on schema and potential use cases
        
        users_list = cursor.fetchall()
        
        return jsonify(users_list)

    except Exception as e:
        logger.error(f"Error fetching users for email: {str(e)}")
        return jsonify({'error': 'Error fetching users'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/tasks/<int:task_id>/progress', methods=['PUT'])
@token_required
def update_task_progress(current_user_id, task_id):
    """Update task progress and documentation with automatic status updates"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Get current user's role and the task
        cursor.execute('''
            SELECT t.*, u.role, u.department 
            FROM tasks t
            JOIN users u ON u.id = %s
            WHERE t.id = %s
        ''', (current_user_id, task_id))
        result = cursor.fetchone()
        
        if not result:
            return jsonify({'error': 'Task not found'}), 404
            
        task = result
        user_role = result['role']
        
        # Verify user has permission to update the task
        if user_role == 'Employee' and task['assigned_to'] != current_user_id:
            return jsonify({'error': 'Unauthorized to update this task'}), 403
            
        data = request.get_json()
        progress = data.get('progress')
        documentation = data.get('documentation')
        
        if progress is not None:
            # Validate progress value
            try:
                progress = int(progress)
                if not 0 <= progress <= 100:
                    return jsonify({'error': 'Progress must be between 0 and 100'}), 400
            except (ValueError, TypeError):
                return jsonify({'error': 'Invalid progress value'}), 400
                
            # Automatically update status based on progress
            if progress >= 90:
                status = 'Completed'
            elif progress >= 50:
                status = 'In Progress'
            else:
                status = 'Todo'
        else:
            status = task['status']
            progress = task['progress']
            
        # Build update query
        update_fields = []
        update_values = []
        
        if progress is not None:
            update_fields.append("progress = %s")
            update_values.append(progress)
            
        if documentation is not None:
            update_fields.append("documentation = %s")
            update_values.append(documentation)
            
        if status != task['status']:
            update_fields.append("status = %s")
            update_values.append(status)
            
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
                   u1.department as assigned_to_department,
                   u2.name as assigned_by_name
            FROM tasks t
            JOIN users u1 ON t.assigned_to = u1.id
            JOIN users u2 ON t.assigned_by = u2.id
            WHERE t.id = %s
        ''', (task_id,))
        
        updated_task = cursor.fetchone()
        return jsonify(updated_task)
        
    except Exception as e:
        logger.error(f"Error updating task progress: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/employee/dashboard', methods=['GET'])
@token_required
def get_employee_dashboard(current_user_id):
    """
    Returns dashboard data for the logged-in employee.
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get employee info
        cursor.execute('SELECT * FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        if not user or user['role'] != 'Employee':
            return jsonify({'error': 'Unauthorized'}), 403

        department = user['department']

        # Get all tasks for this employee
        cursor.execute('''
            SELECT t.*, u2.name as assigned_by_name FROM tasks t
            JOIN users u2 ON t.assigned_by = u2.id
            WHERE t.assigned_to = %s
        ''', (current_user_id,))
        tasks = cursor.fetchall()

        total_tasks = len(tasks)
        completed = sum(1 for t in tasks if t['status'] == 'Completed')
        in_progress = sum(1 for t in tasks if t['status'] == 'In Progress')
        todo = sum(1 for t in tasks if t['status'] == 'Todo')
        overall_progress = round(sum(t['progress'] or 0 for t in tasks) / total_tasks) if total_tasks else 0

        # Get upcoming tasks (next 5 by deadline)
        upcoming = sorted(tasks, key=lambda t: t['deadline'])[:5]

        # Get employee's course demonstrations
        cursor.execute('''
            SELECT * FROM employee_course_demonstrations 
            WHERE user_id = %s
            ORDER BY submitted_at DESC
        ''', (current_user_id,))
        demonstrations = cursor.fetchall()
        total_demonstrations = len(demonstrations)

        # Get unique course names from demonstrations
        unique_courses = set(d['course_name'] for d in demonstrations)
        total_courses = len(unique_courses)

        dashboard_data = {
            "department": department,
            "tasks": {
                "total": total_tasks,
                "completed": completed,
                "in_progress": in_progress,
                "todo": todo,
                "overall_progress": overall_progress,
                "upcoming": [
                    {
                        "id": str(t['id']),
                        "title": t['title'],
                        "description": t['description'],
                        "deadline": t['deadline'].isoformat() if hasattr(t['deadline'], 'isoformat') else str(t['deadline']),
                        "status": t['status'],
                        "progress": t['progress'],
                        "assigned_by_name": t.get('assigned_by_name', '')
                    }
                    for t in upcoming
                ]
            },
            "courses": {
                "total": total_courses,
                "enrolled": total_demonstrations,
                "completed": total_demonstrations,
                "list": [
                    {
                        "id": str(d['id']),
                        "title": d['project_title'],
                        "description": d['project_description'],
                        "course_name": d['course_name'],
                        "submitted_at": d['submitted_at'].isoformat() if hasattr(d['submitted_at'], 'isoformat') else str(d['submitted_at']),
                        "document_url": d['document_url']
                    }
                    for d in demonstrations
                ]
            },
            "department_stats": {
                "total_tasks": total_tasks,
                "completed_tasks": completed,
                "total_courses": total_courses,
                "enrolled_courses": total_demonstrations,
                "progress": {
                    "tasks": overall_progress,
                    "courses": 100 if total_demonstrations > 0 else 0
                }
            }
        }

        return jsonify(dashboard_data)
    except Exception as e:
        logger.error(f"Error fetching employee dashboard: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/courses/watch-history', methods=['POST'])
@token_required
def update_watch_history(current_user_id):
    """Update course watch history and progress"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        data = request.get_json()
        course_id = data.get('courseId')
        watch_duration = data.get('watchDuration')
        watch_position = data.get('watchPosition')
        completed_segments = data.get('completedSegments', [])
        
        if not all([course_id, watch_duration, watch_position]):
            return jsonify({'error': 'Missing required fields'}), 400

        # Update or insert watch history
        cursor.execute('''
            INSERT INTO course_watch_history 
            (user_id, course_id, watch_date, watch_duration, watch_position, completed_segments)
            VALUES (%s, %s, CURDATE(), %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            watch_duration = watch_duration + %s,
            watch_position = %s,
            completed_segments = %s
        ''', (
            current_user_id,
            course_id,
            watch_duration,
            watch_position,
            json.dumps(completed_segments),
            watch_duration,
            watch_position,
            json.dumps(completed_segments)
        ))

        # Update course enrollment progress
        cursor.execute('''
            UPDATE course_enrollments 
            SET progress = %s,
                last_accessed_at = CURRENT_TIMESTAMP,
                last_watch_position = %s
            WHERE user_id = %s AND course_id = %s
        ''', (
            data.get('progress', 0),
            watch_position,
            current_user_id,
            course_id
        ))

        conn.commit()
        
        return jsonify({
            'success': True,
            'message': 'Watch history updated successfully'
        })

    except Exception as e:
        logger.error(f"Error updating watch history: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/courses/watch-history/<int:course_id>', methods=['GET'])
@token_required
def get_watch_history(current_user_id, course_id):
    """Get watch history for a specific course"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute('''
            SELECT 
                watch_date,
                watch_duration,
                watch_position,
                completed_segments
            FROM course_watch_history
            WHERE user_id = %s AND course_id = %s
            ORDER BY watch_date DESC
        ''', (current_user_id, course_id))
        
        history = cursor.fetchall()
        
        # Convert JSON strings to objects
        for record in history:
            if record['completed_segments']:
                record['completed_segments'] = json.loads(record['completed_segments'])
        
        return jsonify(history)

    except Exception as e:
        logger.error(f"Error fetching watch history: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()










@app.route('/api/team-leader/course-progress', methods=['GET'])
@token_required
def get_team_course_progress(current_user_id):
    """Get course progress for all team members"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is a team leader and get their department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Unauthorized'}), 403

        # Get all team members' course progress
        cursor.execute('''
            SELECT 
                u.id as user_id,
                u.name as user_name,
                c.id as course_id,
                c.title as course_title,
                c.department,
                ce.progress,
                ce.last_accessed_at,
                ce.last_watch_position,
                (
                    SELECT SUM(watch_duration)
                    FROM course_watch_history
                    WHERE user_id = u.id AND course_id = c.id
                ) as total_watch_time,
                (
                    SELECT COUNT(DISTINCT watch_date)
                    FROM course_watch_history
                    WHERE user_id = u.id AND course_id = c.id
                ) as days_watched
            FROM users u
            JOIN course_enrollments ce ON u.id = ce.user_id
            JOIN courses c ON ce.course_id = c.id
            WHERE u.department = %s AND u.role = 'Employee'
            ORDER BY u.name, c.title
        ''', (user['department'],))
        
        progress_data = cursor.fetchall()
        
        # Group progress by user
        user_progress = {}
        for record in progress_data:
            if record['user_id'] not in user_progress:
                user_progress[record['user_id']] = {
                    'userId': record['user_id'],
                    'userName': record['user_name'],
                    'courses': []
                }
            
            user_progress[record['user_id']]['courses'].append({
                'courseId': record['course_id'],
                'courseTitle': record['course_title'],
                'progress': record['progress'],
                'lastAccessed': record['last_accessed_at'].isoformat() if record['last_accessed_at'] else None,
                'lastWatchPosition': record['last_watch_position'],
                'totalWatchTime': record['total_watch_time'] or 0,
                'daysWatched': record['days_watched'] or 0
            })
        
        return jsonify(list(user_progress.values()))

    except Exception as e:
        logger.error(f"Error fetching team course progress: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/team-leader/department-employees', methods=['GET'])
@token_required
def get_department_employees(current_user_id):
    """Get all employees from the team leader's department"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Verify user is a team leader and get their department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Unauthorized'}), 403

        # Get all employees from the team leader's department
        cursor.execute('''
            SELECT 
                id,
                name,
                email,
                phone_number,
                skill_level,
                experience,
                experience_level,
                description,
                profile_image_url,
                is_active,
                created_at
            FROM users 
            WHERE department = %s 
            AND role = 'Employee'
            ORDER BY name
        ''', (user['department'],))
        
        employees = cursor.fetchall()
        
        # Convert datetime objects to strings
        for employee in employees:
            if employee['created_at']:
                employee['created_at'] = employee['created_at'].isoformat()
        
        return jsonify(employees)

    except Exception as e:
        logger.error(f"Error fetching department employees: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/team-leader/department-members-progress', methods=['GET'])
@token_required
def get_department_members_progress(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get team leader's department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Unauthorized'}), 403

        department = user['department']

        # Get all employees in the department
        cursor.execute('SELECT id, name, email FROM users WHERE department = %s AND role = \"Employee\"', (department,))
        employees = cursor.fetchall()

        # For each employee, calculate average progress
        results = []
        for emp in employees:
            cursor.execute('SELECT progress FROM tasks WHERE assigned_to = %s', (emp['id'],))
            tasks = cursor.fetchall()
            if tasks:
                avg_progress = round(sum(t['progress'] or 0 for t in tasks) / len(tasks))
            else:
                avg_progress = 0
            results.append({
                'id': emp['id'],
                'name': emp['name'],
                'email': emp['email'],
                'progress': avg_progress
            })

        return jsonify(results)
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()


@app.route('/api/employee/progress', methods=['GET'])
@token_required
def get_employee_overall_progress(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get user and check role
        cursor.execute('SELECT role, name, email FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        if not user or user['role'] != 'Employee':
            return jsonify({'error': 'Unauthorized'}), 403

        # Get all tasks assigned to this employee
        cursor.execute('SELECT progress, status FROM tasks WHERE assigned_to = %s', (current_user_id,))
        tasks = cursor.fetchall()

        total_tasks = len(tasks)
        if total_tasks == 0:
            overall_progress = 0
        else:
            overall_progress = round(sum(t['progress'] or 0 for t in tasks) / total_tasks)

        # Count by status
        completed = sum(1 for t in tasks if t['status'] == 'Completed')
        in_progress = sum(1 for t in tasks if t['status'] == 'In Progress')
        todo = sum(1 for t in tasks if t['status'] == 'Todo')

        return jsonify({
            "overall_progress": overall_progress,
            "task_counts": {
                "total": total_tasks,
                "completed": completed,
                "in_progress": in_progress,
                "todo": todo
            }
        })
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/auth/validate', methods=['GET'])
@token_required
def validate_token(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if user exists and is active
        cursor.execute('SELECT id, is_active, role, email FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        
        if not user:
            logger.error(f"Token validation failed: User not found for ID {current_user_id}")
            return jsonify({
                'message': 'User not found',
                'error': 'USER_NOT_FOUND',
                'details': f'No user found with ID {current_user_id}'
            }), 401
            
        if not user['is_active']:
            logger.error(f"Token validation failed: User {user['email']} is inactive")
            return jsonify({
                'message': 'User account is inactive',
                'error': 'USER_INACTIVE',
                'details': f'User {user["email"]} has been deactivated'
            }), 401
            
        logger.info(f"Token validation successful for user {user['email']} with role {user['role']}")
        return jsonify({
            'message': 'Token is valid',
            'user': {
                'id': user['id'],
                'email': user['email'],
                'role': user['role'],
                'isActive': bool(user['is_active'])
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Token validation error: {str(e)}")
        return jsonify({
            'message': 'Error validating token',
            'error': 'VALIDATION_ERROR',
            'details': str(e)
        }), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/team-leader/export-tasks-pdf', methods=['GET'])
@token_required
def export_tasks_pdf(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get team leader's department
        cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        if not user or user['role'] != 'TeamLeader':
            return jsonify({'error': 'Unauthorized'}), 403

        department = user['department']

        # Get all tasks in the department
        cursor.execute('''
            SELECT t.id, t.title, t.description, t.status, t.progress, t.deadline, u.name as assigned_to_name
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            WHERE u.department = %s
            ORDER BY t.deadline DESC
        ''', (department,))
        tasks = cursor.fetchall()

        # Create PDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Tasks for Department: {department}", ln=True, align='C')
        pdf.ln(10)
        pdf.set_font("Arial", size=10)
        # Table header
        pdf.cell(10, 10, "ID", 1)
        pdf.cell(40, 10, "Title", 1)
        pdf.cell(30, 10, "Assigned To", 1)
        pdf.cell(25, 10, "Status", 1)
        pdf.cell(20, 10, "Progress", 1)
        pdf.cell(35, 10, "Deadline", 1)
        pdf.ln()
        # Table rows
        for t in tasks:
            deadline_str = str(t['deadline']) if not hasattr(t['deadline'], 'strftime') else t['deadline'].strftime('%Y-%m-%d %H:%M')
            pdf.cell(10, 10, str(t['id']), 1)
            pdf.cell(40, 10, t['title'][:20], 1)
            pdf.cell(30, 10, t['assigned_to_name'][:15], 1)
            pdf.cell(25, 10, t['status'], 1)
            pdf.cell(20, 10, f"{t['progress']}%", 1)
            pdf.cell(35, 10, deadline_str, 1)
            pdf.ln()

        # Output PDF to memory (fix for fpdf)
        try:
            pdf_bytes = pdf.output(dest='S').encode('latin1')
            pdf_output = io.BytesIO(pdf_bytes)
            pdf_output.seek(0)
            return send_file(pdf_output, as_attachment=True, download_name="tasks.pdf", mimetype='application/pdf')
        except Exception as e:
            print('PDF generation error:', traceback.format_exc())
            return jsonify({'error': 'PDF generation failed', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Server error', 'details': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/export-employees-pdf', methods=['GET'])
@token_required
def export_employees_pdf(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user is admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        if not user or user['role'] != 'Admin':
            return jsonify({'error': 'Unauthorized'}), 403

        # Get all employees
        cursor.execute('''
            SELECT name, email, phone_number, department, role, skill_level
            FROM users
            WHERE role = 'Employee'
            ORDER BY department, name
        ''')
        employees = cursor.fetchall()

        # Create PDF
        pdf = FPDF(orientation='L', unit='mm', format='A4')
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 10, txt="Employees Listing", ln=True, align='C')
        pdf.ln(5)
        pdf.set_font("Arial", size=10)
        # Table header
        col_widths = [45, 60, 35, 35, 25, 35]  # Adjusted to fit A4 landscape
        headers = ["Name", "Email", "Phone Number", "Department", "Role", "Skill Level"]
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 10, header, 1, 0, 'C')
        pdf.ln()
        # Table rows
        for emp in employees:
            pdf.cell(col_widths[0], 8, str(emp['name'])[:30], 1)
            pdf.cell(col_widths[1], 8, str(emp['email'])[:40], 1)
            pdf.cell(col_widths[2], 8, str(emp['phone_number'] or ''), 1)
            pdf.cell(col_widths[3], 8, str(emp['department'] or ''), 1)
            pdf.cell(col_widths[4], 8, str(emp['role']), 1)
            pdf.cell(col_widths[5], 8, str(emp['skill_level'] or ''), 1)
            pdf.ln()

        # Output PDF to memory
        try:
            pdf_bytes = pdf.output(dest='S').encode('latin1')
            pdf_output = io.BytesIO(pdf_bytes)
            pdf_output.seek(0)
            return send_file(pdf_output, as_attachment=True, download_name="employees.pdf", mimetype='application/pdf')
        except Exception as e:
            import traceback
            print('PDF generation error:', traceback.format_exc())
            return jsonify({'error': 'PDF generation failed', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Server error', 'details': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/export-team-leaders-pdf', methods=['GET'])
@token_required
def export_team_leaders_pdf(current_user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if user is admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        user = cursor.fetchone()
        if not user or user['role'] != 'Admin':
            return jsonify({'error': 'Unauthorized'}), 403

        # Get all team leaders
        cursor.execute('''
            SELECT name, email, phone_number, department, role, skill_level
            FROM users
            WHERE role = 'TeamLeader'
            ORDER BY department, name
        ''')
        leaders = cursor.fetchall()

        # Create PDF
        pdf = FPDF(orientation='L', unit='mm', format='A4')
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 10, txt="Team Leaders Listing", ln=True, align='C')
        pdf.ln(5)
        pdf.set_font("Arial", size=10)
        # Table header
        col_widths = [45, 60, 35, 35, 25, 35]  # Adjusted to fit A4 landscape
        headers = ["Name", "Email", "Phone Number", "Department", "Role", "Skill Level"]
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 10, header, 1, 0, 'C')
        pdf.ln()
        # Table rows
        for leader in leaders:
            pdf.cell(col_widths[0], 8, str(leader['name'])[:30], 1, 0, 'L')
            pdf.cell(col_widths[1], 8, str(leader['email'])[:40], 1, 0, 'L')
            pdf.cell(col_widths[2], 8, str(leader['phone_number'] or ''), 1, 0, 'L')
            pdf.cell(col_widths[3], 8, str(leader['department'] or ''), 1, 0, 'L')
            pdf.cell(col_widths[4], 8, str(leader['role']), 1, 0, 'L')
            pdf.cell(col_widths[5], 8, str(leader['skill_level'] or ''), 1, 0, 'L')
            pdf.ln()

        # Output PDF to memory
        try:
            pdf_bytes = pdf.output(dest='S').encode('latin1')
            pdf_output = io.BytesIO(pdf_bytes)
            pdf_output.seek(0)
            return send_file(pdf_output, as_attachment=True, download_name="team_leaders.pdf", mimetype='application/pdf')
        except Exception as e:
            import traceback
            print('PDF generation error:', traceback.format_exc())
            return jsonify({'error': 'PDF generation failed', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Server error', 'details': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

def to_number(val):
    if isinstance(val, Decimal):
        return float(val)
    return val

def convert_decimals(obj):
    if isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj
    
@app.route('/api/leave-requests', methods=['GET'])
@token_required
def get_leave_requests(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
    user = cursor.fetchone()
    if user['role'] in ['Admin', 'TeamLeader']:
        cursor.execute('''
            SELECT lr.*, u.name as employee_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            ORDER BY lr.submitted_at DESC
        ''')
    else:
        cursor.execute('''
            SELECT lr.*, u.name as employee_name
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            WHERE lr.user_id = %s
            ORDER BY lr.submitted_at DESC
        ''', (current_user_id,))
    requests = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(requests)

@app.route('/api/leave-requests', methods=['POST'])
@token_required
def submit_leave_request(current_user_id):
    data = request.get_json()
    required = ['type', 'start_date', 'end_date', 'reason']
    if not all(k in data for k in required):
        return jsonify({'error': 'Missing fields'}), 400
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        INSERT INTO leave_requests (user_id, type, start_date, end_date, reason)
        VALUES (%s, %s, %s, %s, %s)
    ''', (current_user_id, data['type'], data['start_date'], data['end_date'], data['reason']))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Leave request submitted'}), 201

@app.route('/api/job-applications', methods=['GET'])
@token_required
def get_job_applications(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
    user = cursor.fetchone()
    if user['role'] in ['Admin', 'TeamLeader']:
        cursor.execute('''
            SELECT ja.*, u.name as applicant_name
            FROM job_applications ja
            JOIN users u ON ja.user_id = u.id
            ORDER BY ja.submitted_at DESC
        ''')
    else:
        cursor.execute('''
            SELECT ja.*, u.name as applicant_name
            FROM job_applications ja
            JOIN users u ON ja.user_id = u.id
            WHERE ja.user_id = %s
            ORDER BY ja.submitted_at DESC
        ''', (current_user_id,))
    applications = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(applications)

@app.route('/api/job-applications', methods=['POST'])
@token_required
def submit_job_application(current_user_id):
    job_title = request.form.get('job_title')
    cover_letter = request.form.get('cover_letter')
    cv_file = request.files.get('cv')
    if not job_title or not cv_file:
        return jsonify({'error': 'Missing job_title or CV file'}), 400
    # File validation
    allowed_ext = {'.pdf', '.doc', '.docx'}
    filename = secure_filename(cv_file.filename)
    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed_ext:
        return jsonify({'error': 'Invalid file type. Only PDF, DOC, DOCX allowed.'}), 400
    if len(cv_file.read()) > 2 * 1024 * 1024:
        return jsonify({'error': 'File too large. Max 2MB.'}), 400
    cv_file.seek(0)
    # Unique filename
    unique_filename = f"{current_user_id}_{int(time.time())}_{filename}"
    filepath = os.path.join(CV_UPLOAD_FOLDER, unique_filename)
    cv_file.save(filepath)
    cv_url = f'/uploads/cvs/{unique_filename}'
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('''
        INSERT INTO job_applications (job_title, user_id, cover_letter, cv_url)
        VALUES (%s, %s, %s, %s)
    ''', (job_title, current_user_id, cover_letter, cv_url))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Application submitted', 'cv_url': cv_url}), 201

@app.route('/api/job-applications/<int:application_id>/status', methods=['PATCH'])
@token_required
def update_job_application_status(current_user_id, application_id):
    data = request.get_json()
    status = data.get('status')
    if status not in ['Pending', 'Reviewed', 'Accepted', 'Rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
    user = cursor.fetchone()
    if user['role'] not in ['Admin', 'TeamLeader']:
        return jsonify({'error': 'Unauthorized'}), 403
    cursor.execute('UPDATE job_applications SET status = %s WHERE id = %s', (status, application_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Status updated'})

@app.route('/api/leave-requests/<int:request_id>/status', methods=['PATCH'])
@token_required
def update_leave_request_status(current_user_id, request_id):
    data = request.get_json()
    status = data.get('status')
    response = data.get('response', None)
    if status not in ['Pending', 'Approved', 'Rejected']:
        return jsonify({'error': 'Invalid status'}), 400
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
    user = cursor.fetchone()
    if user['role'] not in ['Admin', 'TeamLeader']:
        return jsonify({'error': 'Unauthorized'}), 403
    cursor.execute('UPDATE leave_requests SET status = %s, response = %s WHERE id = %s', (status, response, request_id))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Status updated'})

@app.route('/uploads/cvs/<filename>')
def serve_cv(filename):
    return send_file(os.path.join(CV_UPLOAD_FOLDER, filename))


@app.route('/api/users/<int:user_id>/promote-skill', methods=['PUT'])
@token_required
def promote_user_skill(current_user_id, user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Check if current user is admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        if not current_user or current_user['role'] != 'Admin':
            return jsonify({'error': 'Only admins can promote skill level'}), 403

        data = request.get_json()
        skill_level = data.get('skillLevel')
        if skill_level not in ['Beginner', 'Intermediate', 'Advanced']:
            return jsonify({'error': 'Invalid skill level'}), 400

        cursor.execute('UPDATE users SET skill_level = %s WHERE id = %s', (skill_level, user_id))
        conn.commit()

        # Fetch and return updated user
        cursor.execute('SELECT id, name, email, skill_level FROM users WHERE id = %s', (user_id,))
        updated_user = cursor.fetchone()
        return jsonify({'message': 'Skill level updated', 'user': updated_user})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/quizzes/<int:quiz_id>/submit', methods=['POST'])
@token_required
def submit_quiz(current_user_id, quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Check if user is allowed to submit (assigned or in department)
    cursor.execute('SELECT department, assigned_to FROM quizzes WHERE id = %s', (quiz_id,))
    quiz = cursor.fetchone()
    cursor.execute('SELECT department FROM users WHERE id = %s', (current_user_id,))
    user = cursor.fetchone()
    if not quiz or not user:
        return jsonify({'error': 'Quiz or user not found'}), 404
    if quiz['assigned_to'] and int(quiz['assigned_to']) != current_user_id:
        return jsonify({'error': 'Not assigned to you'}), 403
    if not quiz['assigned_to'] and quiz['department'] != user['department']:
        return jsonify({'error': 'Not your department'}), 403

    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    filename = secure_filename(file.filename)
    unique_filename = f'{quiz_id}_{current_user_id}_{int(time.time())}_{filename}'
    filepath = os.path.join(QUIZ_SUBMISSION_FOLDER, unique_filename)
    file.save(filepath)
    file_url = f'/uploads/quiz_submissions/{unique_filename}'

    cursor.execute('''
        INSERT INTO quiz_submissions (quiz_id, user_id, file_url)
        VALUES (%s, %s, %s)
    ''', (quiz_id, current_user_id, file_url))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Submission successful'})

@app.route('/api/quizzes/<int:quiz_id>/submissions', methods=['GET'])
@token_required
def get_quiz_submissions(current_user_id, quiz_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Only TeamLeader who uploaded can view
    cursor.execute('SELECT uploaded_by FROM quizzes WHERE id = %s', (quiz_id,))
    quiz = cursor.fetchone()
    if not quiz or quiz['uploaded_by'] != current_user_id:
        return jsonify({'error': 'Not authorized'}), 403
    cursor.execute('''
        SELECT qs.*, u.name as user_name FROM quiz_submissions qs
        JOIN users u ON qs.user_id = u.id
        WHERE qs.quiz_id = %s
    ''', (quiz_id,))
    submissions = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(submissions)

@app.route('/api/quizzes', methods=['OPTIONS'])
def quizzes_options():
    return '', 200

@app.route('/api/quizzes', methods=['POST'])
@token_required
def upload_quiz(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
    user = cursor.fetchone()
    if not user or user['role'] != 'TeamLeader':
        return jsonify({'error': 'Only TeamLeaders can upload quizzes'}), 403

    title = request.form.get('title')
    description = request.form.get('description')
    assigned_to = request.form.get('assigned_to')  # optional
    file = request.files.get('file')
    if not title or not file:
        return jsonify({'error': 'Missing title or file'}), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{int(time.time())}_{filename}"
    filepath = os.path.join(QUIZ_UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    file_url = f'/uploads/quizzes/{unique_filename}'

    cursor.execute('''
        INSERT INTO quizzes (title, description, file_url, uploaded_by, department, assigned_to)
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', (title, description, file_url, current_user_id, user['department'], assigned_to if assigned_to else None))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Quiz uploaded successfully'}), 201

@app.route('/api/quizzes', methods=['GET'])
@token_required
def list_quizzes(current_user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT role, department FROM users WHERE id = %s', (current_user_id,))
    user = cursor.fetchone()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user['role'] == 'TeamLeader':
        # See all quizzes uploaded by this team leader
        cursor.execute('SELECT * FROM quizzes WHERE uploaded_by = %s', (current_user_id,))
    else:
        # Employee: see quizzes for their department or assigned to them
        cursor.execute('''
            SELECT * FROM quizzes
            WHERE (department = %s AND (assigned_to IS NULL OR assigned_to = ''))
               OR assigned_to = %s
        ''', (user['department'], current_user_id))
    quizzes = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(quizzes)

@app.route('/uploads/quizzes/<filename>')
def serve_quiz_file(filename):
    filepath = os.path.join(QUIZ_UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(filepath, as_attachment=True)

@app.route('/uploads/quiz_submissions/<filename>')
def serve_quiz_submission_file(filename):
    return send_file(os.path.join(QUIZ_SUBMISSION_FOLDER, filename))

@app.route('/uploads/task_documents/<filename>')
def serve_task_document(filename):
    return send_file(os.path.join(TASK_DOCUMENTS_FOLDER, filename))

@app.route('/api/users/<int:user_id>/cv', methods=['GET'])
@token_required
def get_user_cv(current_user_id, user_id):
    """Get CV for a specific user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if current user is admin or team leader
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] not in ['Admin', 'TeamLeader']:
            return jsonify({'error': 'Unauthorized'}), 403

        # Get user's CV from job applications (most recent)
        cursor.execute('''
            SELECT cv_url, job_title, submitted_at
            FROM job_applications 
            WHERE user_id = %s AND cv_url IS NOT NULL
            ORDER BY submitted_at DESC
            LIMIT 1
        ''', (user_id,))
        
        cv_data = cursor.fetchone()
        
        if not cv_data:
            return jsonify({'error': 'No CV found for this user'}), 404
            
        return jsonify({
            'cv_url': cv_data['cv_url'],
            'job_title': cv_data['job_title'],
            'submitted_at': cv_data['submitted_at'].isoformat() if cv_data['submitted_at'] else None
        })

    except Exception as e:
        logger.error(f"Error fetching user CV: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/users/<int:user_id>/cv', methods=['POST'])
@token_required
def upload_user_cv(current_user_id, user_id):
    """Upload CV for a specific user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if current user is admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Only admins can upload CVs'}), 403

        # Check if file was uploaded
        if 'cv' not in request.files:
            return jsonify({'error': 'No CV file provided'}), 400
            
        cv_file = request.files['cv']
        if cv_file.filename == '':
            return jsonify({'error': 'No CV file selected'}), 400

        # File validation
        allowed_ext = {'.pdf', '.doc', '.docx'}
        filename = secure_filename(cv_file.filename)
        ext = os.path.splitext(filename)[1].lower()
        if ext not in allowed_ext:
            return jsonify({'error': 'Invalid file type. Only PDF, DOC, DOCX allowed.'}), 400

        # Check file size (max 5MB)
        cv_file.seek(0, 2)  # Seek to end
        file_size = cv_file.tell()
        cv_file.seek(0)  # Reset to beginning
        if file_size > 5 * 1024 * 1024:
            return jsonify({'error': 'File too large. Max 5MB.'}), 400

        # Create unique filename
        unique_filename = f"{user_id}_{int(time.time())}_{filename}"
        filepath = os.path.join(CV_UPLOAD_FOLDER, unique_filename)
        cv_file.save(filepath)
        cv_url = f'/uploads/cvs/{unique_filename}'

        # Store CV information in job_applications table as a special entry
        cursor.execute('''
            INSERT INTO job_applications (user_id, job_title, cover_letter, cv_url, status)
            VALUES (%s, %s, %s, %s, %s)
        ''', (user_id, 'Employee CV', 'CV uploaded by admin', cv_url, 'Accepted'))
        
        conn.commit()
        
        return jsonify({
            'message': 'CV uploaded successfully',
            'cv_url': cv_url
        }), 201

    except Exception as e:
        logger.error(f"Error uploading user CV: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/employee-report', methods=['GET'])
@token_required
def generate_employee_report(current_user_id):
    """Generate a comprehensive employee report"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if current user is admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Only admins can generate reports'}), 403

        # Get all employees with their details
        cursor.execute('''
            SELECT 
                u.id,
                u.name,
                u.email,
                u.role,
                u.department,
                u.phone_number,
                u.skill_level,
                u.experience,
                u.experience_level,
                u.description,
                u.is_active,
                u.created_at,
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_tasks,
                AVG(t.progress) as avg_progress
            FROM users u
            LEFT JOIN tasks t ON u.id = t.assigned_to
            WHERE u.role = 'Employee'
            GROUP BY u.id
            ORDER BY u.department, u.name
        ''')
        
        employees = cursor.fetchall()
        
        # Get department statistics
        cursor.execute('''
            SELECT 
                department,
                COUNT(*) as employee_count,
                AVG(experience) as avg_experience,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_count
            FROM users 
            WHERE role = 'Employee'
            GROUP BY department
        ''')
        
        department_stats = cursor.fetchall()
        
        # Get overall statistics
        cursor.execute('''
            SELECT 
                COUNT(*) as total_employees,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_employees,
                AVG(experience) as avg_experience,
                COUNT(CASE WHEN skill_level = 'Beginner' THEN 1 END) as beginners,
                COUNT(CASE WHEN skill_level = 'Intermediate' THEN 1 END) as intermediates,
                COUNT(CASE WHEN skill_level = 'Advanced' THEN 1 END) as advanced
            FROM users 
            WHERE role = 'Employee'
        ''')
        
        overall_stats = cursor.fetchone()
        
        # Get recent activity
        cursor.execute('''
            SELECT 
                u.name,
                u.department,
                t.title as task_title,
                t.status,
                t.updated_at
            FROM tasks t
            JOIN users u ON t.assigned_to = u.id
            WHERE u.role = 'Employee'
            ORDER BY t.updated_at DESC
            LIMIT 10
        ''')
        
        recent_activity = cursor.fetchall()
        
        report = {
            'generated_at': datetime.datetime.now().isoformat(),
            'overall_stats': {
                'total_employees': overall_stats['total_employees'],
                'active_employees': overall_stats['active_employees'],
                'avg_experience': float(overall_stats['avg_experience']) if overall_stats['avg_experience'] else 0,
                'skill_distribution': {
                    'beginners': overall_stats['beginners'],
                    'intermediates': overall_stats['intermediates'],
                    'advanced': overall_stats['advanced']
                }
            },
            'department_stats': department_stats,
            'employees': employees,
            'recent_activity': recent_activity
        }
        
        return jsonify(report)

    except Exception as e:
        logger.error(f"Error generating employee report: {str(e)}")
        return jsonify({'error': 'Server error'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/admin/export-employee-report-pdf', methods=['GET'])
@token_required
def export_employee_report_pdf(current_user_id):
    """Export employee report as PDF"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if current user is admin
        cursor.execute('SELECT role FROM users WHERE id = %s', (current_user_id,))
        current_user = cursor.fetchone()
        
        if current_user['role'] != 'Admin':
            return jsonify({'error': 'Only admins can export reports'}), 403

        # Get employee data for PDF
        cursor.execute('''
            SELECT 
                name, email, department, phone_number, skill_level, 
                experience, experience_level, is_active, created_at
            FROM users 
            WHERE role = 'Employee'
            ORDER BY department, name
        ''')
        
        employees = cursor.fetchall()

        # Create PDF
        pdf = FPDF(orientation='L', unit='mm', format='A4')
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(0, 10, txt="Employee Report", ln=True, align='C')
        pdf.ln(5)
        
        # Add generation date
        pdf.set_font("Arial", size=10)
        pdf.cell(0, 8, txt=f"Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
        pdf.ln(5)
        
        # Table header
        col_widths = [35, 50, 25, 30, 25, 20, 20, 15, 25]
        headers = ["Name", "Email", "Department", "Phone", "Skill Level", "Experience", "Exp Level", "Active", "Created"]
        
        for i, header in enumerate(headers):
            pdf.cell(col_widths[i], 10, header, 1, 0, 'C')
        pdf.ln()
        
        # Table rows
        for emp in employees:
            pdf.cell(col_widths[0], 8, str(emp['name'])[:25], 1)
            pdf.cell(col_widths[1], 8, str(emp['email'])[:35], 1)
            pdf.cell(col_widths[2], 8, str(emp['department'] or ''), 1)
            pdf.cell(col_widths[3], 8, str(emp['phone_number'] or '')[:20], 1)
            pdf.cell(col_widths[4], 8, str(emp['skill_level'] or ''), 1)
            pdf.cell(col_widths[5], 8, str(emp['experience'] or ''), 1)
            pdf.cell(col_widths[6], 8, str(emp['experience_level'] or ''), 1)
            pdf.cell(col_widths[7], 8, 'Yes' if emp['is_active'] else 'No', 1)
            
            created_date = emp['created_at'].strftime('%Y-%m-%d') if emp['created_at'] else ''
            pdf.cell(col_widths[8], 8, created_date, 1)
            pdf.ln()

        # Output PDF to memory
        try:
            pdf_bytes = pdf.output(dest='S').encode('latin1')
            pdf_output = io.BytesIO(pdf_bytes)
            pdf_output.seek(0)
            return send_file(pdf_output, as_attachment=True, download_name="employee_report.pdf", mimetype='application/pdf')
        except Exception as e:
            print('PDF generation error:', traceback.format_exc())
            return jsonify({'error': 'PDF generation failed', 'details': str(e)}), 500
            
    except Exception as e:
        return jsonify({'error': 'Server error', 'details': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

#
if __name__ == '__main__':
    # Log the server startup
    #Always remember to run the app at port 5000
    app.run(debug=True, port=5000)