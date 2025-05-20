// User Roles
export type UserRole = "Admin" | "TeamLeader" | "Employee";

// Departments
export type Department = "IT" | "Finance" | "Sales" | "Customer-Service";

// Skill level
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

// Skills
export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
}

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department;
  phoneNumber?: string;
  experience?: number;
  experienceLevel?: number;
  description?: string;
  profileImage?: string;
  isActive: boolean;
  skillLevel?: SkillLevel;
  skills?: Skill[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Task status
export type TaskStatus = "Todo" | "In Progress" | "Completed";

// Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string | string[];
  assignedBy: string;
  status: TaskStatus;
  deadline: Date;
  createdAt: Date;
  progress?: number;
  documentation?: string;
}

// Course type
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  department: Department;
  duration?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  thumbnail?: string;
  createdAt?: Date;
  enrolledUsers?: string[];
  progress?: number;
  status?: "Not Started" | "In Progress" | "Completed";
  enrolledAt?: Date;
}

// Job Opportunity type
export interface JobOpportunity {
  id: string;
  title: string;
  department: Department;
  description: string;
  requiredSkills: string[];
  postedAt: Date;
  deadline: Date;
  postedBy: string;
}

// Notification Type
export type NotificationType = "Message" | "Task" | "Announcement" | "System" | "task" | "course" | "job" | "general";

// Notification Status
export type NotificationStatus = "Unread" | "Read";

// Notification
export interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt?: Date;
  isRead?: boolean;
  userId?: string;
  type?: string;
  link?: string;
}

// Login Session
export interface LoginSession {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  loginTime: Date;
  logoutTime?: Date;
  isActive: boolean;
}
