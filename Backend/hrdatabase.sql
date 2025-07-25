

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `hrdatabase`
--

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `department` enum('IT','Finance','Sales','Customer-Service') DEFAULT NULL,
  `video_url` varchar(255) NOT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `video_type` enum('youtube','other') DEFAULT 'youtube',
  `duration` varchar(50) DEFAULT NULL,
  `difficulty` enum('Beginner','Intermediate','Advanced') DEFAULT 'Beginner'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


--
-- Table structure for table `course_certificates`
--

CREATE TABLE `course_certificates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `issue_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `certificate_url` varchar(255) DEFAULT NULL,
  `completion_percentage` int(11) DEFAULT NULL,
  `quiz_score` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `course_enrollments`
--

CREATE TABLE `course_enrollments` (
  `user_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `progress` int(11) DEFAULT 0 CHECK (`progress` >= 0 and `progress` <= 100),
  `completed` tinyint(1) DEFAULT 0,
  `enrolled_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `course_interactions`
--

CREATE TABLE `course_interactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `interaction_type` enum('play','pause','seek','complete_segment','complete_course') DEFAULT NULL,
  `interaction_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `video_position` int(11) DEFAULT NULL,
  `segment_id` varchar(50) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `course_quizzes`
--

CREATE TABLE `course_quizzes` (
  `id` int(11) NOT NULL,
  `course_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `passing_score` int(11) DEFAULT 70,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `course_quiz_attempts`
--

CREATE TABLE `course_quiz_attempts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `quiz_id` int(11) DEFAULT NULL,
  `attempt_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `score` int(11) DEFAULT NULL,
  `passed` tinyint(1) DEFAULT 0,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`answers`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `course_quiz_questions`
--

CREATE TABLE `course_quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) DEFAULT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','true_false','short_answer') DEFAULT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` text DEFAULT NULL,
  `points` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `course_watch_history`
--

CREATE TABLE `course_watch_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `course_id` int(11) DEFAULT NULL,
  `watch_date` date DEFAULT NULL,
  `watch_duration` int(11) DEFAULT NULL,
  `watch_start_time` timestamp NULL DEFAULT NULL,
  `watch_end_time` timestamp NULL DEFAULT NULL,
  `watch_position` int(11) DEFAULT NULL,
  `completed_segments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`completed_segments`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `employee_course_demonstrations`
--

CREATE TABLE `employee_course_demonstrations` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `course_name` longtext NOT NULL,
  `project_title` longtext NOT NULL,
  `project_description` text DEFAULT NULL,
  `document_url` longtext DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_course_demonstrations`
--

INSERT INTO `employee_course_demonstrations` (`id`, `user_id`, `course_name`, `project_title`, `project_description`, `document_url`, `submitted_at`) VALUES
(1, 5, 'Economy', 'Economy Progression', 'Potus', NULL, '2025-05-27 17:21:19'),
(2, 5, 'Economy', 'Economy Progression', 'Potus', NULL, '2025-05-28 14:59:21');

-- --------------------------------------------------------

--
-- Table structure for table `job_applications`
--

CREATE TABLE `job_applications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `cover_letter` text DEFAULT NULL,
  `cv_url` varchar(255) DEFAULT NULL,
  `status` enum('Pending','Reviewed','Accepted','Rejected') DEFAULT 'Pending',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `job_title` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `job_applications`
--

INSERT INTO `job_applications` (`id`, `user_id`, `cover_letter`, `cv_url`, `status`, `submitted_at`, `job_title`) VALUES
(3, 5, 'I want this job', '/uploads/cvs/5_1750449754_Employee_Compass_Add-ins.docx', 'Pending', '2025-06-20 20:02:34', 'Devops Job ');

-- --------------------------------------------------------

--
-- Table structure for table `job_opportunities`
--

CREATE TABLE `job_opportunities` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `department` enum('IT','Finance','Sales','Customer-Service') DEFAULT NULL,
  `description` text NOT NULL,
  `posted_by` int(11) DEFAULT NULL,
  `posted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deadline` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_required_skills`
--

CREATE TABLE `job_required_skills` (
  `job_id` int(11) NOT NULL,
  `skill_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `response` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `user_id`, `type`, `start_date`, `end_date`, `reason`, `status`, `response`, `submitted_at`) VALUES
(1, 5, 'Sick', '2025-06-27', '2025-06-30', 'Let me leave boy ', 'Rejected', NULL, '2025-06-20 18:37:21'),
(2, 5, 'Sick', '2025-07-16', '2025-07-23', 'uiwruiwrh', 'Approved', NULL, '2025-06-20 18:37:59');

-- --------------------------------------------------------

--
-- Table structure for table `login_sessions`
--

CREATE TABLE `login_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_agent` text NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `logout_time` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_sessions`
--

INSERT INTO `login_sessions` (`id`, `user_id`, `user_agent`, `ip_address`, `login_time`, `logout_time`, `is_active`) VALUES
(1, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-23 00:33:01', NULL, 0),
(2, 20, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-23 00:35:40', NULL, 0),
(3, 20, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-23 01:03:14', NULL, 0),
(4, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-23 01:19:25', NULL, 1),
(5, 20, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-23 01:20:16', NULL, 1),
(6, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-30 20:14:26', NULL, 0),
(7, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-30 20:16:24', NULL, 0),
(8, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-30 20:24:32', NULL, 0),
(9, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-30 20:46:34', NULL, 0),
(10, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-30 20:55:09', NULL, 0),
(11, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-06-30 20:56:39', NULL, 0),
(12, 1, 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1', '127.0.0.1', '2025-07-24 14:52:43', NULL, 1),
(13, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '127.0.0.1', '2025-07-24 14:53:13', NULL, 1),
(14, 10, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '127.0.0.1', '2025-07-24 14:53:34', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `type` enum('task','course','job','general') NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `title`, `message`, `user_id`, `is_read`, `type`, `link`, `created_at`) VALUES
(2, 'New Task Assigned', 'You have been assigned a new task', '1', 0, 'task', '/tasks/1', '2025-05-23 19:09:45'),
(3, 'Course Completed', 'Congratulations on completing the course!', '2', 0, 'course', '/courses/2', '2025-05-23 19:09:45'),
(4, 'Deadline Reminder', 'Task deadline is approaching', '3', 0, 'task', '/tasks/3', '2025-05-23 19:09:45'),
(5, 'New Course Available', 'A new course is available for your department', '4', 0, 'course', '/courses/4', '2025-05-23 19:09:45'),
(6, 'Task Update', 'Task status has been updated', '5', 0, 'task', '/tasks/5', '2025-05-23 19:09:45'),
(7, 'Achievement Unlocked', 'You have earned a new achievement', '6', 0, '', '/profile', '2025-05-23 19:09:45'),
(8, 'Team Meeting', 'Team meeting scheduled for tomorrow', '7', 0, '', '/calendar', '2025-05-23 19:09:45'),
(10, 'Course Progress', 'You are 90% complete with your course', '1', 0, 'course', '/courses/9', '2025-05-23 19:09:45'),
(11, 'Task Completed', 'Great job on completing the task!', '2', 0, 'task', '/tasks/10', '2025-05-23 19:09:45'),
(12, 'new message', 'Take care guys', '1', 0, 'course', NULL, '2025-05-23 20:19:17'),
(13, 'A new job for you guys', 'We have a new role for backend engineers', '1', 0, 'job', NULL, '2025-05-24 20:19:34');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(255) NOT NULL,
  `uploaded_by` int(11) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `title`, `description`, `file_url`, `uploaded_by`, `department`, `assigned_to`, `created_at`) VALUES
(1, 'Quiz One ', 'TestPassword123!', '/uploads/quizzes/1750452872_Employee_Compass_Add-ins.docx', 3, 'Finance', 5, '2025-06-20 20:54:32'),
(2, 'TestPassword123!', 'TestPassword123!', '/uploads/quizzes/1750453419_Employee_Compass_Add-ins.docx', 3, 'Finance', 5, '2025-06-20 21:03:39');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_submissions`
--

CREATE TABLE `quiz_submissions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `quiz_submissions`
--

INSERT INTO `quiz_submissions` (`id`, `quiz_id`, `user_id`, `file_url`, `submitted_at`) VALUES
(1, 1, 5, '/uploads/quiz_submissions/1_5_1750453208_Employee_Compass_Add-ins.docx', '2025-06-20 21:00:08');

-- --------------------------------------------------------

--
-- Table structure for table `skills`
--

CREATE TABLE `skills` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `level` enum('Beginner','Intermediate','Advanced') DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `documentation` text DEFAULT NULL,
  `document_url` varchar(255) DEFAULT NULL,
  `assigned_to` int(11) DEFAULT NULL,
  `assigned_by` int(11) DEFAULT NULL,
  `status` enum('Todo','In Progress','Completed') NOT NULL,
  `progress` int(11) DEFAULT NULL CHECK (`progress` >= 0 and `progress` <= 100),
  `deadline` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `documentation`, `document_url`, `assigned_to`, `assigned_by`, `status`, `progress`, `deadline`, `created_at`, `updated_at`) VALUES
(3, 'cdhsuicdhsd', 'sdihcidhsd', 'In progress', NULL, 5, 3, 'Todo', 12, '2025-06-20 20:02:05', '2025-05-19 20:49:43', '2025-06-20 20:02:05'),
(24, 'Implement New Authentication System', 'Upgrade the current authentication system to use OAuth 2.0', 'I am done with the documentation', NULL, 10, 2, 'Completed', 92, '2025-05-24 20:47:26', '2025-05-20 08:00:00', '2025-05-24 20:47:26'),
(25, 'Database Optimization', 'Optimize database queries and indexes for better performance', 'https://docs.example.com/db-optimization', NULL, 11, 2, 'Todo', 0, '2025-06-19 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(26, 'Q2 Financial Report Preparation', 'Prepare detailed financial reports for Q2 2025', 'https://docs.example.com/q2-reports', NULL, 5, 3, 'Completed', 100, '2025-05-28 19:01:20', '2025-05-20 08:00:00', '2025-05-28 19:01:20'),
(28, 'New Product Launch Strategy', 'Develop marketing and sales strategy for new product launch', 'https://docs.example.com/product-launch', NULL, 7, 6, 'In Progress', 60, '2025-06-24 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(29, 'Customer Feedback Analysis', 'Analyze and compile customer feedback from recent surveys', 'https://docs.example.com/feedback-analysis', NULL, 7, 6, 'Todo', 0, '2025-06-14 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(30, 'Service Quality Improvement', 'Implement new customer service quality metrics', 'https://docs.example.com/service-quality', NULL, 9, 8, 'In Progress', 30, '2025-06-29 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(31, 'Customer Support Training', 'Organize training session for new customer support protocols', 'https://docs.example.com/support-training', NULL, 9, 8, 'Todo', 0, '2025-06-19 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(33, 'edwejd', 'wefwejfkwefi wfiojwef weofwpf ', NULL, NULL, 21, 6, 'Todo', 0, '2025-05-30 20:00:00', '2025-05-27 13:58:17', '2025-05-27 13:58:17'),
(34, 'Annotation dissertation', 'Please an annotation dissertation for the customers ', 'Please an annotation dissertation for the customers Please an annotation dissertation for the customers Please an annotation dissertation for the customers ', '/uploads/task_documents/1750638850_5_1750449754_Employee_Compass_Add-ins.docx', 20, 3, 'Todo', 0, '2025-07-04 20:00:00', '2025-06-23 00:34:10', '2025-06-23 00:34:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Admin','TeamLeader','Employee') NOT NULL,
  `department` enum('Admin','IT','Finance','Sales','Customer-Service') DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `skill_level` enum('Beginner','Intermediate','Advanced') DEFAULT NULL,
  `experience` int(11) DEFAULT NULL,
  `experience_level` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `department`, `phone_number`, `skill_level`, `experience`, `experience_level`, `description`, `profile_image_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'John Jerry', 'admin@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Admin', 'IT', '234-567-8901', 'Advanced', 5, 1, 'I am the main system Administrator', '', 1, '2025-05-14 15:00:59', '2025-05-24 20:29:36'),
(2, 'Jill Wagner Joe', 'jillwagner@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', '+250123456789', 'Intermediate', 4, 4, 'IT Team Leader', NULL, 1, '2025-05-14 15:00:59', '2025-05-26 19:02:34'),
(3, 'Fina Niicer', 'teamlead.finance@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Finance', '234-567-8901', 'Advanced', 4, 2, 'Finance Team Leaders', NULL, 1, '2025-05-14 15:00:59', '2025-05-28 17:00:08'),
(5, 'Jerry Jane', 'employee.finance@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Finance', '+1234567893', 'Advanced', 2, 1, 'Finance Department Employee', NULL, 1, '2025-05-14 15:00:59', '2025-06-20 16:10:09'),
(6, 'Team Leader Sales', 'teamlead.sales@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Sales', '+1234567895', 'Advanced', 4, 2, 'Sales Team Leader', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:56:57'),
(7, 'Sales Employee', 'employee.sales@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Sales', '+1234567896', 'Intermediate', 2, 1, 'Sales Department Employee', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:57:09'),
(8, 'Team Leader Customer-Service', 'teamlead.customerservice@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Customer-Service', '+1234567897', 'Advanced', 4, 2, 'Customer Service Team Leader', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:59:33'),
(9, 'Gary Jerry', 'employee.customerservice@hrms.com', 'pbkdf2:sha256:260000$YVhfBsgZd329O9wN$8d7556fb2af24e08817c3c89b1361707bc8e2af4cda5c4215be6de1f68fa98b6', 'Employee', 'Customer-Service', '234-567-8901', 'Intermediate', 2, 1, 'Customer Service Department Employee', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 16:45:38'),
(10, 'Brian Joe', 'brian@gmal.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+250123456789', 'Beginner', 0, NULL, 'None', NULL, 1, '2025-05-16 11:04:06', '2025-05-19 15:57:19'),
(11, 'big boss', 'manzidavquion@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '234-567-8901', 'Intermediate', 10, NULL, 'He is courageous', NULL, 1, '2025-05-19 15:12:38', '2025-05-19 15:57:31'),
(14, 'Jill Wagner Joe', 'teamlead.iTt@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', '+250123456789', 'Intermediate', 4, 4, 'IT Team Leader', NULL, 1, '2025-05-14 15:00:59', '2025-05-15 19:29:02'),
(15, 'John Smith', 'john.smith@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+1234567890', 'Intermediate', 3, 2, 'Full-stack developer with React and Node.js experience', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(16, 'Sarah Johnson', 'sarah.j@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Finance', '+1234567891', '', 5, 3, 'Financial analyst with expertise in risk management', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(17, 'Mike Wilson', 'mike.w@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Sales', '+1234567892', 'Advanced', 1, 1, 'Sales representative with strong communication skills', NULL, 1, '2025-05-23 19:05:36', '2025-06-20 16:06:45'),
(18, 'Lisa Brown', 'lisa.b@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Customer-Service', '+1234567893', 'Intermediate', 2, 2, 'Customer service specialist with 2 years experience', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(19, 'David Lee', 'david.l@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+1234567894', 'Intermediate', 4, 3, 'Backend developer with Python and Django expertise', NULL, 1, '2025-05-23 19:05:36', '2025-06-20 16:00:41'),
(20, 'Emma Davis', 'emma.d@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Finance', '+1234567895', 'Intermediate', 2, 2, 'Accountant with CPA certification', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(21, 'James Wilson', 'james.w@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Sales', '+1234567896', '', 6, 3, 'Sales manager with proven track record', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(22, 'Maria Garcia', 'maria.g@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Customer-Service', '+1234567897', '', 1, 1, 'Customer support representative', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(23, 'Tom Anderson', 'tom.a@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', '+1234567898', '', 7, 3, 'IT Team Leader with 7 years of experience', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(24, 'Rachel Chen', 'rachel.c@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Finance', '+1234567899', '', 8, 3, 'Finance Team Leader with MBA', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(25, 'Titi brown', 'Titibrown@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', NULL, 'Beginner', NULL, NULL, 'A well performing employee', NULL, 1, '2025-05-24 20:15:04', '2025-05-27 14:39:05');

-- --------------------------------------------------------

--
-- Table structure for table `user_skills`
--

CREATE TABLE `user_skills` (
  `user_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_courses_department` (`department`);

--
-- Indexes for table `course_certificates`
--
ALTER TABLE `course_certificates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_enrollments`
--
ALTER TABLE `course_enrollments`
  ADD PRIMARY KEY (`user_id`,`course_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_interactions`
--
ALTER TABLE `course_interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_quizzes`
--
ALTER TABLE `course_quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `course_quiz_attempts`
--
ALTER TABLE `course_quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `course_quiz_questions`
--
ALTER TABLE `course_quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `course_watch_history`
--
ALTER TABLE `course_watch_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `course_id` (`course_id`);

--
-- Indexes for table `employee_course_demonstrations`
--
ALTER TABLE `employee_course_demonstrations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `job_applications`
--
ALTER TABLE `job_applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `job_opportunities`
--
ALTER TABLE `job_opportunities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `posted_by` (`posted_by`);

--
-- Indexes for table `job_required_skills`
--
ALTER TABLE `job_required_skills`
  ADD PRIMARY KEY (`job_id`,`skill_name`);

--
-- Indexes for table `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_course_demonstrations`
--
ALTER TABLE `employee_course_demonstrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `job_applications`
--
ALTER TABLE `job_applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `job_opportunities`
--
ALTER TABLE `job_opportunities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `login_sessions`
--
ALTER TABLE `login_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quiz_submissions`
--
ALTER TABLE `quiz_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `user_skills`
--
ALTER TABLE `user_skills`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
