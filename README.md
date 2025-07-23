# Ascent Employee Compass

## Project Overview
Ascent Employee Compass is a comprehensive HR management platform designed to streamline employee, team leader, and admin workflows. It provides robust tools for task management, employee progress tracking, course enrollments, notifications, and administrative controls, all with a modern, user-friendly interface.

## Key Features
- **Role-based Dashboard:** Separate dashboards for Admin, Team Leader, and Employee roles.
- **Task Management:** Assign, update, and track tasks with progress and documentation.
- **Progress Tracking:** Employees and team leaders can view individual and departmental progress.
- **The Course Management:** Enroll in and track progress on department-specific courses.
- **Notifications:** System-wide and targeted notifications for important events.
- **User Management:** Admins can add, edit, promote, demote, and delete users.
- **PDF Export:** Export employee and team leader tables, as well as department tasks, to PDF.
- **Authentication & Authorization:** Secure JWT-based login and role-based access control.
- **Responsive UI:** Modern, mobile-friendly design using React and Tailwind CSS.

## Technologies Used
- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Python, Flask, MySQL, fpdf (for PDF generation)
- **Other:** JWT for authentication, axios/fetch for API calls

## Setup & Installation

### Prerequisites
- Node.js (v16+ recommended)
- Python 3.8+
- MySQL Server

### Backend Setup
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd ascent-employee-compass/Backend
   ```
2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   pip install fpdf
   pip install python-dotenv
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set your DB credentials and secret keys.
4. **Set up the database:**
   - Import the schema from `src/database/realschema.sql` into your MySQL server.
5. **Run the backend server:**
   ```bash
   python server.py
   ```
   The backend will run on `https://ascent-employee-compass.onrender.com` by default.

### Frontend Setup
1. **Navigate to the frontend directory:**
   ```bash
   cd ../ # from Backend to project root
   npm install
   ```
2. **Start the frontend:**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:8080` (or your configured port).

## Main API Endpoints
- **Authentication:**
  - `POST /api/auth/login` — User login
  - `GET /api/auth/validate` — Validate JWT token
- **User Management:**
  - `GET /api/users` — List users (admin/team leader)
  - `POST /api/users` — Create user (admin)
  - `PUT /api/users/<id>` — Update user
  - `DELETE /api/users/<id>` — Delete user
  - `POST /api/admin/export-employees-pdf` — Export employees as PDF (admin)
  - `POST /api/admin/export-team-leaders-pdf` — Export team leaders as PDF (admin)
- **Task Management:**
  - `GET /api/tasks/status` — Get tasks by status
  - `POST /api/tasks` — Create task
  - `PUT /api/tasks/<id>` — Update task
  - `PUT /api/tasks/<id>/progress` — Update task progress
  - `GET /api/team-leader/department-members-progress` — Get progress for all employees in department
  - `GET /api/team-leader/export-tasks-pdf` — Export department tasks as PDF (team leader)
- **Course Management:**
  - `GET /api/courses` — List courses
  - `GET /api/courses/watch-history/<course_id>` — Get course watch history
- **Notifications:**
  - `GET /api/notifications` — List notifications
  - `POST /api/notifications` — Create notification

## Usage Notes
- **Roles:**
  - Admin: Full access to all features and user management.
  - Team Leader: Manage department tasks and view team progress.
  - Employee: View and update own tasks and courses.
- **PDF Export:**
  - Employees, team leaders, and department tasks can be exported to PDF from the respective management pages.
- **Security:**
  - All sensitive endpoints require a valid JWT token in the `Authorization` header.

