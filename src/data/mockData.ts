
import { User, Task, Course, JobOpportunity, Notification, LoginSession, Skill } from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    name: "John Smith",
    email: "admin@example.com",
    role: "Admin",
    phoneNumber: "123-456-7890",
    isActive: true,
    profileImage: "https://ui-avatars.com/api/?name=John+Smith&background=0D8ABC&color=fff"
  },
  {
    id: "2",
    name: "Jane Doe",
    email: "jane@example.com",
    role: "TeamLeader",
    department: "IT",
    skills: [
      { id: "1", name: "React", level: "Advanced" },
      { id: "2", name: "Node.js", level: "Intermediate" },
    ],
    experienceLevel: 5,
    description: "Senior developer with 5 years of experience",
    phoneNumber: "234-567-8901",
    isActive: true,
    profileImage: "https://ui-avatars.com/api/?name=Jane+Doe&background=0D8ABC&color=fff"
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Employee",
    department: "IT",
    skills: [
      { id: "3", name: "React", level: "Intermediate" },
      { id: "4", name: "CSS", level: "Beginner" },
    ],
    experienceLevel: 2,
    description: "Junior developer with 2 years of experience",
    phoneNumber: "345-678-9012",
    isActive: true,
    profileImage: "https://ui-avatars.com/api/?name=Bob+Johnson&background=0D8ABC&color=fff"
  },
  {
    id: "4",
    name: "Lisa Williams",
    email: "lisa@example.com",
    role: "TeamLeader",
    department: "Finance",
    skills: [
      { id: "5", name: "Financial Analysis", level: "Advanced" },
      { id: "6", name: "Excel", level: "Advanced" },
    ],
    experienceLevel: 7,
    description: "Financial analyst with 7 years of experience",
    phoneNumber: "456-789-0123",
    isActive: true,
    profileImage: "https://ui-avatars.com/api/?name=Lisa+Williams&background=0D8ABC&color=fff"
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael@example.com",
    role: "Employee",
    department: "Finance",
    skills: [
      { id: "7", name: "Accounting", level: "Intermediate" },
      { id: "8", name: "Excel", level: "Intermediate" },
    ],
    experienceLevel: 3,
    description: "Accountant with 3 years of experience",
    phoneNumber: "567-890-1234",
    isActive: true,
    profileImage: "https://ui-avatars.com/api/?name=Michael+Brown&background=0D8ABC&color=fff"
  }
];

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement new feature",
    description: "Implement the new authentication feature",
    assignedTo: "3",
    assignedBy: "2",
    status: "In Progress",
    deadline: new Date("2025-06-15"),
    createdAt: new Date("2025-06-01"),
  },
  {
    id: "2",
    title: "Fix bug in login",
    description: "There's a bug in the login form that needs to be fixed",
    assignedTo: "3",
    assignedBy: "2",
    status: "Todo",
    deadline: new Date("2025-06-10"),
    createdAt: new Date("2025-06-01"),
  },
  {
    id: "3",
    title: "Quarterly report",
    description: "Create the quarterly financial report",
    assignedTo: "5",
    assignedBy: "4",
    status: "Completed",
    deadline: new Date("2025-05-30"),
    createdAt: new Date("2025-05-15"),
  },
  {
    id: "4",
    title: "Budget planning",
    description: "Prepare the budget for next quarter",
    assignedTo: "5",
    assignedBy: "4",
    status: "Todo",
    deadline: new Date("2025-06-20"),
    createdAt: new Date("2025-06-01"),
  }
];

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Advanced React Patterns",
    description: "Learn advanced React patterns and best practices",
    department: "IT",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    createdAt: new Date("2025-01-15"),
    enrolledUsers: ["3"],
  },
  {
    id: "2",
    title: "Financial Analysis 101",
    description: "Introduction to financial analysis techniques",
    department: "Finance",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    createdAt: new Date("2025-02-10"),
    enrolledUsers: ["5"],
  },
  {
    id: "3",
    title: "Customer Service Best Practices",
    description: "Learn the best practices for customer service",
    department: "Customer-Service",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    createdAt: new Date("2025-03-05"),
    enrolledUsers: [],
  },
  {
    id: "4",
    title: "Sales Techniques",
    description: "Advanced sales techniques and strategies",
    department: "Sales",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    createdAt: new Date("2025-04-20"),
    enrolledUsers: [],
  }
];

export const mockJobOpportunities: JobOpportunity[] = [
  {
    id: "1",
    title: "Senior Developer",
    department: "IT",
    description: "Looking for a senior developer with React and Node.js experience",
    requiredSkills: ["React", "Node.js"],
    postedAt: new Date("2025-06-01"),
    deadline: new Date("2025-06-30"),
  },
  {
    id: "2",
    title: "Financial Analyst",
    department: "Finance",
    description: "Seeking a financial analyst with experience in budget planning",
    requiredSkills: ["Financial Analysis", "Excel"],
    postedAt: new Date("2025-06-02"),
    deadline: new Date("2025-06-25"),
  }
];

export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "New Task Assigned",
    message: "You have been assigned a new task: Implement new feature",
    userId: "3",
    isRead: false,
    createdAt: new Date("2025-06-01"),
    type: "task",
    link: "/tasks"
  },
  {
    id: "2",
    title: "Course Recommendation",
    message: "We recommend you check out the Advanced React Patterns course",
    userId: "3",
    isRead: true,
    createdAt: new Date("2025-05-28"),
    type: "course",
    link: "/courses"
  },
  {
    id: "3",
    title: "New Job Opportunity",
    message: "A new job opportunity has been posted that matches your skills",
    userId: "3",
    isRead: false,
    createdAt: new Date("2025-06-02"),
    type: "job",
    link: "/jobs"
  }
];

export const mockLoginSessions: LoginSession[] = [
  {
    id: "1",
    userId: "1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    ipAddress: "192.168.1.1",
    loginTime: new Date("2025-06-01T09:30:00"),
    isActive: true
  },
  {
    id: "2",
    userId: "2",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    ipAddress: "192.168.1.2",
    loginTime: new Date("2025-06-01T10:15:00"),
    isActive: true
  },
  {
    id: "3",
    userId: "3",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X)",
    ipAddress: "192.168.1.3",
    loginTime: new Date("2025-06-01T11:00:00"),
    logoutTime: new Date("2025-06-01T17:00:00"),
    isActive: false
  }
];
