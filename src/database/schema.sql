-- Create and use the database
DROP DATABASE IF EXISTS hrdatabase;
CREATE DATABASE hrdatabase;
USE hrdatabase;

-- USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'TeamLeader', 'Employee') NOT NULL,
    department ENUM('Admin', 'IT', 'Finance', 'Sales', 'Customer-Service') DEFAULT NULL,
    phone_number VARCHAR(50),
    skill_level ENUM('Beginner', 'Intermediate', 'Advanced'),
    experience INT,
    experience_level INT,
    description TEXT,
    profile_image_url VARCHAR(255),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SKILLS TABLE
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    level ENUM('Beginner', 'Intermediate', 'Advanced'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USER_SKILLS TABLE (Many-to-Many)
CREATE TABLE user_skills (
    user_id INT,
    skill_id INT,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- TASKS TABLE
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    documentation TEXT,
    assigned_to INT,
    assigned_by INT,
    status ENUM('Todo', 'In Progress', 'Completed') NOT NULL,
    progress INT CHECK (progress >= 0 AND progress <= 100),
    deadline TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id)
);

-- COURSES TABLE
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department ENUM('IT','Finance','Sales','Customer-Service'),
    video_url VARCHAR(255) NOT NULL,
    thumbnail_url VARCHAR(255),
    video_type ENUM('youtube', 'other') DEFAULT 'youtube',
    duration VARCHAR(50),
    difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- COURSE_ENROLLMENTS TABLE
CREATE TABLE course_enrollments (
    user_id INT,
    course_id INT,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed TINYINT(1) DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    last_accessed_at TIMESTAMP NULL DEFAULT NULL,
    total_watch_time INT DEFAULT 0, -- in seconds
    last_watch_position INT DEFAULT 0, -- in seconds
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

9
-- JOB_OPPORTUNITIES TABLE
CREATE TABLE job_opportunities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department ENUM('IT','Finance','Sales','Customer-Service'),
    description TEXT NOT NULL,
    posted_by INT,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deadline DATE NOT NULL,
    FOREIGN KEY (posted_by) REFERENCES users(id)
);

-- JOB_REQUIRED_SKILLS TABLE
CREATE TABLE job_required_skills (
    job_id INT,
    skill_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (job_id, skill_name),
    FOREIGN KEY (job_id) REFERENCES job_opportunities(id) ON DELETE CASCADE
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    type ENUM('task', 'course', 'job', 'general') NOT NULL,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LOGIN_SESSIONS TABLE
CREATE TABLE login_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    user_agent TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    is_active TINYINT(1) DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);
CREATE INDEX idx_courses_department ON courses(department);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_login_sessions_user_id ON login_sessions(user_id);
CREATE INDEX idx_login_sessions_login_time ON login_sessions(login_time);
CREATE INDEX idx_course_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_watch_history_user ON course_watch_history(user_id);
CREATE INDEX idx_watch_history_course ON course_watch_history(course_id);
CREATE INDEX idx_watch_history_date ON course_watch_history(watch_date);
CREATE INDEX idx_interactions_user ON course_interactions(user_id);
CREATE INDEX idx_interactions_course ON course_interactions(course_id);
CREATE INDEX idx_interactions_type ON course_interactions(interaction_type);
CREATE INDEX idx_quiz_attempts_user ON course_quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON course_quiz_attempts(quiz_id);
CREATE INDEX idx_certificates_user ON course_certificates(user_id);
CREATE INDEX idx_certificates_course ON course_certificates(course_id);

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `department`, `phone_number`, `skill_level`, `experience`, `experience_level`, `description`, `profile_image_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'John Doe', 'admin@gmail.com', 'scrypt:32768:8:1$Zw5glzBMAGFYE7jD$15c41f88eff5cf4912165649db0818c60ce7272174fb3bc468035929e2e34630108e3cc2abe69af0723c1f7a98b1012b31961efada00fcfcef5d1a07a4a36210', 'Admin', 'Admin', '0791289100', 'Advanced', 5, 3, 'I am the main system Administrator', '', 1, '2025-05-14 17:00:59', '2025-05-16 12:54:37'),
(2, 'Jill Wagner Joe', 'teamlead.it@hrms.com', 'scrypt:32768:8:1$FocRm5GWF5pf1NeQ$bbff1791b3e46913cef01addd710308827015921095c1bcd928292b416a2dec0330f49d2d5362e35af0d51cf6d87c62ee3e92c513ab1acd0390b1abef9ed5bc5', 'TeamLeader', 'IT', '+250123456789', 'Intermediate', 4, 4, 'IT Team Leader', NULL, 1, '2025-05-14 17:00:59', '2025-05-15 21:29:02'),
(3, 'Team Leader Finance', 'teamlead.finance@hrms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGpJ4P6XyJ2', 'TeamLeader', 'Finance', '+1234567892', 'Advanced', 4, 2, 'Finance Team Leader', NULL, 1, '2025-05-14 17:00:59', '2025-05-15 13:44:55'),
(4, 'IT Employee', 'employee.it@hrms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGpJ4P6XyJ2', 'Employee', 'IT', '+1234567893', 'Intermediate', 2, 1, 'IT Department Employee', NULL, 1, '2025-05-14 17:00:59', '2025-05-15 13:45:24'),
(5, 'Finance Employee', 'employee.finance@hrms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGpJ4P6XyJ2', 'Employee', 'Finance', '+1234567894', 'Intermediate', 2, 1, 'Finance Department Employee', NULL, 1, '2025-05-14 17:00:59', '2025-05-15 13:45:07'),
(6, 'Team Leader Sales', 'teamlead.sales@hrms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGpJ4P6XyJ2', 'TeamLeader', 'Sales', '+1234567895', 'Advanced', 4, 2, 'Sales Team Leader', NULL, 1, '2025-05-14 17:06:17', '2025-05-15 13:44:44'),
(7, 'Sales Employee', 'employee.sales@hrms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGpJ4P6XyJ2', 'Employee', 'Sales', '+1234567896', 'Intermediate', 2, 1, 'Sales Department Employee', NULL, 1, '2025-05-14 17:06:17', '2025-05-15 13:44:33'),
(8, 'Team Leader Customer-Service', 'teamlead.customerservice@hrms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGpJ4P6XyJ2', 'TeamLeader', 'Customer-Service', '+1234567897', 'Advanced', 4, 2, 'Customer Service Team Leader', NULL, 1, '2025-05-14 17:06:17', '2025-05-15 13:44:19'),
(9, 'Customer Service Employee', 'employee.customerservice@hrms.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGpJ4P6XyJ2', 'Employee', 'Customer-Service', '+1234567898', 'Intermediate', 2, 1, 'Customer Service Department Employee', NULL, 1, '2025-05-14 17:06:17', '2025-05-15 13:44:09'),
(10, 'Brian Joe', 'brian@gmal.com', 'scrypt:32768:8:1$ha6ptfvXoPQyaHjO$b4be85bc8652417122e555f1432d8402960a91f5ad24572eddf29328c59d4186c62d0e6ac0d6360131199cd9fe8ccf2fb736028c2cef4d0d8ddf506d8860802d', 'Employee', 'IT', '+250123456789', 'Beginner', 0, NULL, 'None', NULL, 1, '2025-05-16 13:04:06', '2025-05-16 14:16:51');

-- Sample course data for IT department
INSERT INTO courses (title, description, department, video_url, thumbnail_url, video_type, duration, difficulty) VALUES
('Introduction to Software Development', 'Learn the basics of software development and programming concepts', 'IT', 'https://www.youtube.com/embed/VIDEO_ID_1', 'https://img.youtube.com/vi/VIDEO_ID_1/maxresdefault.jpg', 'youtube', '10:00', 'Beginner'),
('Web Development Fundamentals', 'Master the fundamentals of web development including HTML, CSS, and JavaScript', 'IT', 'https://www.youtube.com/embed/VIDEO_ID_2', 'https://img.youtube.com/vi/VIDEO_ID_2/maxresdefault.jpg', 'youtube', '15:00', 'Beginner'),
('Database Design Principles', 'Learn essential database design principles and SQL', 'IT', 'https://www.youtube.com/embed/VIDEO_ID_3', 'https://img.youtube.com/vi/VIDEO_ID_3/maxresdefault.jpg', 'youtube', '20:00', 'Intermediate');

-- Sample course data for Finance department
INSERT INTO courses (title, description, department, video_url, thumbnail_url, video_type, duration, difficulty) VALUES
('Financial Accounting Basics', 'Learn the fundamentals of financial accounting', 'Finance', 'https://www.youtube.com/embed/VIDEO_ID_4', 'https://img.youtube.com/vi/VIDEO_ID_4/maxresdefault.jpg', 'youtube', '12:00', 'Beginner'),
('Investment Strategies', 'Master different investment strategies and portfolio management', 'Finance', 'https://www.youtube.com/embed/VIDEO_ID_5', 'https://img.youtube.com/vi/VIDEO_ID_5/maxresdefault.jpg', 'youtube', '18:00', 'Intermediate'),
('Financial Analysis Techniques', 'Learn advanced financial analysis techniques', 'Finance', 'https://www.youtube.com/embed/VIDEO_ID_6', 'https://img.youtube.com/vi/VIDEO_ID_6/maxresdefault.jpg', 'youtube', '25:00', 'Advanced');