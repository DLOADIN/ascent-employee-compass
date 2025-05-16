export type UserRole = 'Admin' | 'TeamLeader' | 'Employee';
export type Department = 'IT' | 'Finance' | 'Sales' | 'Customer-Service';
export type TaskStatus = 'Todo' | 'In Progress' | 'Completed';
export type NotificationType = 'task' | 'course' | 'job' | 'general';

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
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string | string[];  // Can be a single user ID or an array of user IDs
  assignedBy: string;
  status: TaskStatus;
  progress: number;
  deadline: Date;
  documentation?: string;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  department?: Department;
  videoUrl: string;
  thumbnailUrl?: string;
  enrolledUsers: string[];
  createdAt: Date;
}

export interface JobOpportunity {
  id: string;
  title: string;
  department?: Department;
  description: string;
  postedBy: string;
  postedAt: Date;
  deadline: Date;
  requiredSkills?: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;  // User ID who should receive the notification
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface LoginSession {
  id: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  loginTime: Date;
  logoutTime?: Date;
  isActive: boolean;
} 