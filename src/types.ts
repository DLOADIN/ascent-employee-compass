
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
  department: Department;
  phoneNumber: string;
  experience: number;
  experienceLevel: number;
  description: string;
  profileImage: string;
  isActive: boolean;
  skillLevel?: SkillLevel;
  skills?: Skill[];
}

// Task status
export type TaskStatus = "Todo" | "In Progress" | "Completed";

// Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  status: TaskStatus;
  deadline: Date;
  createdAt: Date;
  progress: number;
}

// Course type
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  department: Department;
  duration: string;
  thumbnailUrl: string;
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
export type NotificationType = "Message" | "Task" | "Announcement" | "System";

// Notification Status
export type NotificationStatus = "Unread" | "Read";

// Notification
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  timestamp: Date;
  sender?: string;
  relatedId?: string;
}
