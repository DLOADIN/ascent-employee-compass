export type UserRole = "Admin" | "Employee" | "TeamLeader";
export type Department = "Admin" | "IT" | "Finance" | "Sales" | "Customer-Service";
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'TeamLeader' | 'Employee';
  department: string;
  phoneNumber?: string;
  skillLevel?: string;
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
  assignedTo: number;
  assignedBy: number;
  assigned_to_name?: string;
  assigned_to_email?: string;
  assigned_by_name?: string;
  status: 'Todo' | 'In Progress' | 'Completed';
  progress?: number;
  deadline: string;
  created_at: string;
  updated_at: string;
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
