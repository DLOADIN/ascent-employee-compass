-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 28, 2025 at 07:54 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

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

-- --------------------------------------------------------

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

-- --------------------------------------------------------

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

-- --------------------------------------------------------

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

-- --------------------------------------------------------

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

-- --------------------------------------------------------

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

-- --------------------------------------------------------

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

-- --------------------------------------------------------

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

-- --------------------------------------------------------

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
(1, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-18 20:37:09', NULL, 0),
(2, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-18 20:39:14', NULL, 0),
(4, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 13:30:23', NULL, 0),
(5, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 14:36:45', NULL, 0),
(6, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 14:38:56', NULL, 0),
(7, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 14:39:20', NULL, 0),
(8, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 14:39:43', NULL, 0),
(9, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 14:40:29', NULL, 0),
(10, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 14:41:45', NULL, 0),
(11, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 14:55:54', NULL, 0),
(12, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:03:28', NULL, 0),
(13, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:06:17', NULL, 0),
(14, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:15:46', NULL, 0),
(15, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:31:34', NULL, 0),
(16, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:33:45', NULL, 0),
(17, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:39:00', NULL, 0),
(18, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:39:14', NULL, 0),
(19, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:42:19', NULL, 0),
(20, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:44:57', NULL, 0),
(21, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:45:36', NULL, 0),
(22, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:57:46', NULL, 0),
(23, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 15:58:21', NULL, 0),
(24, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:08:14', NULL, 0),
(25, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:16:39', NULL, 0),
(26, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:17:12', NULL, 0),
(27, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:17:28', NULL, 0),
(28, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:21:18', NULL, 0),
(29, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:21:39', NULL, 0),
(30, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:22:03', NULL, 0),
(31, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:22:21', NULL, 0),
(32, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:24:28', NULL, 0),
(33, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:24:54', NULL, 0),
(34, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:25:16', NULL, 0),
(35, 9, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:34:21', NULL, 0),
(36, 9, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 16:37:10', NULL, 0),
(37, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 17:00:59', NULL, 0),
(38, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 17:13:36', NULL, 0),
(39, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 17:52:28', NULL, 0),
(40, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 17:54:15', NULL, 0),
(41, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 17:54:44', NULL, 0),
(42, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 17:56:40', NULL, 0),
(43, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 18:02:24', NULL, 0),
(44, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 18:05:52', NULL, 0),
(45, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 18:20:08', NULL, 0),
(46, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 18:25:50', NULL, 0),
(47, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 18:29:39', NULL, 0),
(48, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 19:08:40', NULL, 0),
(49, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 19:10:57', NULL, 0),
(50, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 19:57:21', NULL, 0),
(51, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 20:33:10', NULL, 0),
(52, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 20:47:58', NULL, 0),
(53, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 20:48:20', NULL, 0),
(54, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 20:49:31', NULL, 0),
(55, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 20:57:18', NULL, 0),
(56, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-19 21:12:10', NULL, 0),
(57, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 12:49:08', NULL, 0),
(58, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 12:49:46', NULL, 0),
(59, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 14:02:14', NULL, 0),
(60, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 14:14:36', NULL, 0),
(61, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 14:15:37', NULL, 0),
(62, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 14:28:29', NULL, 0),
(63, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 14:28:52', NULL, 0),
(64, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:05:25', NULL, 0),
(65, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:05:35', NULL, 0),
(66, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:12:42', NULL, 0),
(67, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:17:10', NULL, 0),
(68, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:18:09', NULL, 0),
(69, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:21:08', NULL, 0),
(70, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:26:15', NULL, 0),
(71, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:26:36', NULL, 0),
(72, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:37:05', NULL, 0),
(73, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:37:26', NULL, 0),
(74, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:37:44', NULL, 0),
(75, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 15:39:40', NULL, 0),
(76, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:03:41', NULL, 0),
(77, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:10:23', NULL, 0),
(78, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:10:42', NULL, 0),
(79, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:20:58', NULL, 0),
(80, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:21:25', NULL, 0),
(81, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:22:12', NULL, 0),
(82, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:25:00', NULL, 0),
(83, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:25:15', NULL, 0),
(84, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:27:52', NULL, 0),
(85, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-20 16:28:12', NULL, 0),
(86, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 13:10:06', NULL, 0),
(87, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 13:17:40', NULL, 0),
(88, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 13:19:18', NULL, 0),
(89, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 19:12:57', NULL, 0),
(90, 11, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 19:37:11', NULL, 0),
(91, 9, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 19:42:21', NULL, 0),
(92, 11, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 20:03:39', NULL, 1),
(93, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 20:08:39', NULL, 0),
(94, 7, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 20:09:14', NULL, 0),
(95, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 20:18:25', NULL, 0),
(96, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 20:30:32', NULL, 0),
(97, 7, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 20:30:56', NULL, 0),
(98, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 20:34:28', NULL, 0),
(99, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-22 20:42:43', NULL, 0),
(100, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 16:49:38', NULL, 0),
(101, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 16:50:16', NULL, 0),
(102, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 16:52:42', NULL, 0),
(103, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:20:45', NULL, 0),
(104, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:21:46', NULL, 0),
(105, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:22:27', NULL, 0),
(106, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:25:14', NULL, 0),
(107, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:25:50', NULL, 0),
(108, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:30:30', NULL, 0),
(109, 9, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:31:47', NULL, 1),
(110, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:32:39', NULL, 0),
(111, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:33:15', NULL, 0),
(112, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:45:10', NULL, 0),
(113, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:46:10', NULL, 0),
(114, 7, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:47:06', NULL, 0),
(115, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:48:59', NULL, 0),
(116, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 17:51:53', NULL, 0),
(117, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:43:58', NULL, 0),
(118, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:47:17', NULL, 0),
(119, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:47:59', NULL, 0),
(120, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:49:00', NULL, 0),
(121, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:51:38', NULL, 0),
(122, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:52:14', NULL, 0),
(123, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:52:46', NULL, 0),
(124, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:55:13', NULL, 0),
(125, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 18:55:46', NULL, 0),
(126, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 19:38:42', NULL, 0),
(127, 15, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 19:39:41', NULL, 1),
(128, 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 19:40:03', NULL, 0),
(129, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 19:46:18', NULL, 0),
(130, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 19:54:48', NULL, 0),
(131, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 20:04:12', NULL, 0),
(132, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 20:04:43', NULL, 0),
(133, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 20:16:22', NULL, 0),
(134, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 20:18:04', NULL, 0),
(135, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 20:20:03', NULL, 0),
(136, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 20:20:46', NULL, 0),
(137, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-23 20:29:55', NULL, 0),
(138, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 19:44:39', NULL, 0),
(139, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 20:12:48', NULL, 0),
(140, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 20:30:42', NULL, 0),
(141, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 20:36:22', NULL, 0),
(142, 10, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 20:41:05', NULL, 1),
(143, 7, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 20:51:47', NULL, 1),
(144, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 20:55:16', NULL, 0),
(145, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 21:04:32', NULL, 0),
(146, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 21:05:49', NULL, 0),
(147, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-24 21:06:22', NULL, 0),
(148, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-26 19:01:36', NULL, 0),
(149, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-26 19:03:51', NULL, 0),
(150, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-26 20:17:17', NULL, 0),
(151, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-26 20:18:03', NULL, 0),
(152, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-26 21:02:36', NULL, 0),
(153, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 07:41:15', NULL, 0),
(154, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 07:42:28', NULL, 0),
(155, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 08:15:34', NULL, 0),
(156, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 08:30:56', NULL, 0),
(157, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 13:04:40', NULL, 0),
(158, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 13:06:32', NULL, 0),
(159, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 13:45:30', NULL, 0),
(160, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 13:46:06', NULL, 0),
(161, 14, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 13:47:51', NULL, 1),
(162, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 13:48:13', NULL, 0),
(163, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 13:48:45', NULL, 0),
(164, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 14:07:41', NULL, 0),
(165, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 14:08:37', NULL, 0),
(166, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 14:37:43', NULL, 0),
(167, 25, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 14:39:13', NULL, 1),
(168, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 14:43:13', NULL, 0),
(169, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 14:50:28', NULL, 0),
(170, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 15:51:06', NULL, 0),
(171, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 17:11:01', NULL, 0),
(172, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 17:29:48', NULL, 0),
(173, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 19:05:00', NULL, 0),
(174, 2, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 19:22:30', NULL, 1),
(175, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 19:29:08', NULL, 0),
(176, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 19:33:35', NULL, 0),
(177, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-27 19:42:48', NULL, 0),
(178, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 10:49:16', NULL, 0),
(179, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 10:49:39', NULL, 0),
(180, 1, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 12:19:29', NULL, 1),
(181, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 16:11:21', NULL, 0),
(182, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 16:57:44', NULL, 0),
(183, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 16:59:47', NULL, 0),
(184, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 17:04:26', NULL, 0),
(185, 8, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 17:10:31', NULL, 1),
(186, 23, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 17:11:13', NULL, 0),
(187, 23, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 17:19:37', NULL, 1),
(188, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 17:22:38', NULL, 0),
(189, 6, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 17:23:04', NULL, 1),
(190, 3, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 17:27:06', NULL, 1),
(191, 5, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', '127.0.0.1', '2025-05-28 17:39:29', NULL, 1);

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
(1, 'dfihweifu', 'wedhiwe wefwniefn wefw ofiwje fw ofjwe fiojwef', '1', 0, 'job', NULL, '2025-05-19 15:25:16'),
(2, 'New Task Assigned', 'You have been assigned a new task', '1', 0, 'task', '/tasks/1', '2025-05-23 19:09:45'),
(3, 'Course Completed', 'Congratulations on completing the course!', '2', 0, 'course', '/courses/2', '2025-05-23 19:09:45'),
(4, 'Deadline Reminder', 'Task deadline is approaching', '3', 0, 'task', '/tasks/3', '2025-05-23 19:09:45'),
(5, 'New Course Available', 'A new course is available for your department', '4', 0, 'course', '/courses/4', '2025-05-23 19:09:45'),
(6, 'Task Update', 'Task status has been updated', '5', 0, 'task', '/tasks/5', '2025-05-23 19:09:45'),
(7, 'Achievement Unlocked', 'You have earned a new achievement', '6', 0, '', '/profile', '2025-05-23 19:09:45'),
(8, 'Team Meeting', 'Team meeting scheduled for tomorrow', '7', 0, '', '/calendar', '2025-05-23 19:09:45'),
(9, 'Performance Review', 'Your performance review is due', '8', 0, '', '/reviews', '2025-05-23 19:09:45'),
(10, 'Course Progress', 'You are 90% complete with your course', '1', 0, 'course', '/courses/9', '2025-05-23 19:09:45'),
(11, 'Task Completed', 'Great job on completing the task!', '2', 0, 'task', '/tasks/10', '2025-05-23 19:09:45'),
(12, 'new message', 'Take care guys', '1', 0, 'course', NULL, '2025-05-23 20:19:17'),
(13, 'A new job for you guys', 'We have a new role for backend engineers', '1', 0, 'job', NULL, '2025-05-24 20:19:34');

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

INSERT INTO `tasks` (`id`, `title`, `description`, `documentation`, `assigned_to`, `assigned_by`, `status`, `progress`, `deadline`, `created_at`, `updated_at`) VALUES
(3, 'cdhsuicdhsd', 'sdihcidhsd', 'In progress', 5, 3, 'In Progress', 52, '2025-05-19 20:57:42', '2025-05-19 20:49:43', '2025-05-19 20:57:42'),
(24, 'Implement New Authentication System', 'Upgrade the current authentication system to use OAuth 2.0', 'I am done with the documentation', 10, 2, 'Completed', 92, '2025-05-24 20:47:26', '2025-05-20 08:00:00', '2025-05-24 20:47:26'),
(25, 'Database Optimization', 'Optimize database queries and indexes for better performance', 'https://docs.example.com/db-optimization', 11, 2, 'Todo', 0, '2025-06-19 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(26, 'Q2 Financial Report Preparation', 'Prepare detailed financial reports for Q2 2025', 'https://docs.example.com/q2-reports', 5, 3, 'In Progress', 75, '2025-06-09 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(27, 'Budget Review Meeting', 'Review and analyze department budgets for next quarter', 'https://docs.example.com/budget-review', 5, 3, 'Todo', 47, '2025-05-27 15:52:46', '2025-05-20 08:00:00', '2025-05-27 15:52:46'),
(28, 'New Product Launch Strategy', 'Develop marketing and sales strategy for new product launch', 'https://docs.example.com/product-launch', 7, 6, 'In Progress', 60, '2025-06-24 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(29, 'Customer Feedback Analysis', 'Analyze and compile customer feedback from recent surveys', 'https://docs.example.com/feedback-analysis', 7, 6, 'Todo', 0, '2025-06-14 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(30, 'Service Quality Improvement', 'Implement new customer service quality metrics', 'https://docs.example.com/service-quality', 9, 8, 'In Progress', 30, '2025-06-29 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(31, 'Customer Support Training', 'Organize training session for new customer support protocols', 'https://docs.example.com/support-training', 9, 8, 'Todo', 0, '2025-06-19 22:00:00', '2025-05-20 08:00:00', '2025-05-20 08:00:00'),
(33, 'edwejd', 'wefwejfkwefi wfiojwef weofwpf ', NULL, 21, 6, 'Todo', 0, '2025-05-30 20:00:00', '2025-05-27 13:58:17', '2025-05-27 13:58:17');

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
(5, 'Jerry Jane', 'employee.finance@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Finance', '+1234567893', 'Intermediate', 2, 1, 'Finance Department Employee', NULL, 1, '2025-05-14 15:00:59', '2025-05-22 19:15:25'),
(6, 'Team Leader Sales', 'teamlead.sales@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Sales', '+1234567895', 'Advanced', 4, 2, 'Sales Team Leader', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:56:57'),
(7, 'Sales Employee', 'employee.sales@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Sales', '+1234567896', 'Intermediate', 2, 1, 'Sales Department Employee', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:57:09'),
(8, 'Team Leader Customer-Service', 'teamlead.customerservice@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'Customer-Service', '+1234567897', 'Advanced', 4, 2, 'Customer Service Team Leader', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 15:59:33'),
(9, 'Gary Jerry', 'employee.customerservice@hrms.com', 'pbkdf2:sha256:260000$YVhfBsgZd329O9wN$8d7556fb2af24e08817c3c89b1361707bc8e2af4cda5c4215be6de1f68fa98b6', 'Employee', 'Customer-Service', '234-567-8901', 'Intermediate', 2, 1, 'Customer Service Department Employee', NULL, 1, '2025-05-14 15:06:17', '2025-05-19 16:45:38'),
(10, 'Brian Joe', 'brian@gmal.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+250123456789', 'Beginner', 0, NULL, 'None', NULL, 1, '2025-05-16 11:04:06', '2025-05-19 15:57:19'),
(11, 'big boss', 'manzidavquion@gmail.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '234-567-8901', 'Intermediate', 10, NULL, 'He is courageous', NULL, 1, '2025-05-19 15:12:38', '2025-05-19 15:57:31'),
(14, 'Jill Wagner Joe', 'teamlead.iTt@hrms.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'TeamLeader', 'IT', '+250123456789', 'Intermediate', 4, 4, 'IT Team Leader', NULL, 1, '2025-05-14 15:00:59', '2025-05-15 19:29:02'),
(15, 'John Smith', 'john.smith@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+1234567890', 'Intermediate', 3, 2, 'Full-stack developer with React and Node.js experience', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(16, 'Sarah Johnson', 'sarah.j@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Finance', '+1234567891', '', 5, 3, 'Financial analyst with expertise in risk management', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(17, 'Mike Wilson', 'mike.w@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Sales', '+1234567892', '', 1, 1, 'Sales representative with strong communication skills', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(18, 'Lisa Brown', 'lisa.b@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'Customer-Service', '+1234567893', 'Intermediate', 2, 2, 'Customer service specialist with 2 years experience', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
(19, 'David Lee', 'david.l@company.com', 'pbkdf2:sha256:260000$HF57NjLd4YqjVLdX$881d2d8a603a95ef841baf58d859b48d9cc7895e51c809e5672f1a720aa22217', 'Employee', 'IT', '+1234567894', '', 4, 3, 'Backend developer with Python and Django expertise', NULL, 1, '2025-05-23 19:05:36', '2025-05-23 19:05:36'),
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
-- Indexes for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_login_sessions_user_id` (`user_id`),
  ADD KEY `idx_login_sessions_login_time` (`login_time`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_id` (`user_id`),
  ADD KEY `idx_notifications_created_at` (`created_at`);

--
-- Indexes for table `skills`
--
ALTER TABLE `skills`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_tasks_status` (`status`),
  ADD KEY `idx_tasks_assigned_to` (`assigned_to`),
  ADD KEY `idx_tasks_deadline` (`deadline`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_department` (`department`),
  ADD KEY `idx_users_email` (`email`);

--
-- Indexes for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD PRIMARY KEY (`user_id`,`skill_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_certificates`
--
ALTER TABLE `course_certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_interactions`
--
ALTER TABLE `course_interactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_quizzes`
--
ALTER TABLE `course_quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_quiz_attempts`
--
ALTER TABLE `course_quiz_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_quiz_questions`
--
ALTER TABLE `course_quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_watch_history`
--
ALTER TABLE `course_watch_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_course_demonstrations`
--
ALTER TABLE `employee_course_demonstrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `job_opportunities`
--
ALTER TABLE `job_opportunities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_sessions`
--
ALTER TABLE `login_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=192;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `skills`
--
ALTER TABLE `skills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `course_certificates`
--
ALTER TABLE `course_certificates`
  ADD CONSTRAINT `course_certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_certificates_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_enrollments`
--
ALTER TABLE `course_enrollments`
  ADD CONSTRAINT `course_enrollments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_interactions`
--
ALTER TABLE `course_interactions`
  ADD CONSTRAINT `course_interactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_interactions_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_quizzes`
--
ALTER TABLE `course_quizzes`
  ADD CONSTRAINT `course_quizzes_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_quiz_attempts`
--
ALTER TABLE `course_quiz_attempts`
  ADD CONSTRAINT `course_quiz_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_quiz_attempts_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `course_quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_quiz_questions`
--
ALTER TABLE `course_quiz_questions`
  ADD CONSTRAINT `course_quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `course_quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_watch_history`
--
ALTER TABLE `course_watch_history`
  ADD CONSTRAINT `course_watch_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_watch_history_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `employee_course_demonstrations`
--
ALTER TABLE `employee_course_demonstrations`
  ADD CONSTRAINT `employee_course_demonstrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `job_opportunities`
--
ALTER TABLE `job_opportunities`
  ADD CONSTRAINT `job_opportunities_ibfk_1` FOREIGN KEY (`posted_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `job_required_skills`
--
ALTER TABLE `job_required_skills`
  ADD CONSTRAINT `job_required_skills_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `job_opportunities` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD CONSTRAINT `login_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `user_skills`
--
ALTER TABLE `user_skills`
  ADD CONSTRAINT `user_skills_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_skills_ibfk_2` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;