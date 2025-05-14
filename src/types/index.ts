
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
export type Department = "IT" | "Finance" | "Sales" | "Customer-Service";
export type UserRole = "Admin" | "Employee" | "TeamLeader";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department;
  skills?: string[];
  skillLevel?: SkillLevel;
  experience?: number;
  experienceLevel?: number;
  description?: string;
  phoneNumber: string;
  profileImage?: string;
  isActive: boolean;
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  documentation?: string; // Added documentation field
  assignedTo: string;
  assignedBy: string;
  status: "Todo" | "In Progress" | "Completed";
  deadline: Date;
  createdAt: Date;
  progress?: number; // Added progress tracking
}

export interface Course {
  id: string;
  title: string;
  description: string;
  department: Department;
  videoUrl: string;
  thumbnail?: string;
  createdAt: Date;
  enrolledUsers: string[];
}

export interface JobOpportunity {
  id: string;
  title: string;
  department: Department;
  description: string;
  requiredSkills: string[];
  postedAt: Date;
  deadline: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  userId: string;
  isRead: boolean;
  createdAt: Date;
  type: "task" | "course" | "job" | "general";
  link?: string;
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
