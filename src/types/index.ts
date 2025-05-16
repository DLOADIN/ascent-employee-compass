export type UserRole = "Admin" | "Employee" | "TeamLeader";
export type Department = "Admin" | "IT" | "Finance" | "Sales" | "Customer-Service";
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: Department;
  phoneNumber?: string;
  skillLevel?: SkillLevel;
  experience?: number;
  experienceLevel?: number;
  description?: string;
  profileImage?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  skills?: Skill[];
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
  documentation?: string;
  assignedTo: string;
  assignedBy: string;
  status: "Todo" | "In Progress" | "Completed";
  deadline: Date;
  createdAt: Date;
  progress?: number;
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
  type: "task" | "course" | "job" | "general";
  createdAt: string;
  user_id: string;
  user_name?: string;
  department?: string;
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
