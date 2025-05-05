
import React, { createContext, useState, useContext } from 'react';
import { User, Task, Course, JobOpportunity, Notification, LoginSession } from '@/types';
import { mockUsers, mockTasks, mockCourses, mockJobOpportunities, mockNotifications, mockLoginSessions } from '@/data/mockData';
import { useToast } from "@/components/ui/use-toast";

interface AppContextType {
  currentUser: User | null;
  users: User[];
  tasks: Task[];
  courses: Course[];
  jobOpportunities: JobOpportunity[];
  notifications: Notification[];
  loginSessions: LoginSession[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'isActive'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'enrolledUsers'>) => void;
  enrollInCourse: (courseId: string, userId: string) => void;
  addJobOpportunity: (job: Omit<JobOpportunity, 'id' | 'postedAt'>) => void;
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>(mockJobOpportunities);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>(mockLoginSessions);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      // Add a new login session
      const newSession: LoginSession = {
        id: Date.now().toString(),
        userId: user.id,
        userAgent: navigator.userAgent,
        ipAddress: "127.0.0.1", // Placeholder
        loginTime: new Date(),
        isActive: true
      };
      setLoginSessions([...loginSessions, newSession]);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.name}!`,
      });
      return true;
    }
    toast({
      title: "Login failed",
      description: "Invalid email or password",
      variant: "destructive",
    });
    return false;
  };

  const logout = () => {
    if (currentUser) {
      const updatedSessions = loginSessions.map(session => {
        if (session.userId === currentUser.id && session.isActive) {
          return { ...session, isActive: false, logoutTime: new Date() };
        }
        return session;
      });
      setLoginSessions(updatedSessions);
      setCurrentUser(null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    }
  };

  const addUser = (user: Omit<User, 'id' | 'isActive'>) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      isActive: true,
    };
    setUsers([...users, newUser]);
    toast({
      title: "User added",
      description: `${newUser.name} has been added successfully`,
    });
  };

  const updateUser = (user: User) => {
    setUsers(users.map(u => (u.id === user.id ? user : u)));
    if (currentUser && currentUser.id === user.id) {
      setCurrentUser(user);
    }
    toast({
      title: "User updated",
      description: `${user.name}'s profile has been updated`,
    });
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== id));
      toast({
        title: "User deleted",
        description: `${userToDelete.name} has been removed`,
      });
    }
  };

  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTasks([...tasks, newTask]);
    
    // Notify the assigned user
    addNotification({
      title: "New Task Assigned",
      message: `You have been assigned a new task: ${newTask.title}`,
      userId: newTask.assignedTo,
      type: "task",
      link: "/tasks",
    });
    
    toast({
      title: "Task added",
      description: "New task has been created successfully",
    });
  };

  const updateTask = (task: Task) => {
    setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    toast({
      title: "Task updated",
      description: "Task has been updated successfully",
    });
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast({
      title: "Task deleted",
      description: "Task has been removed",
    });
  };

  const addCourse = (course: Omit<Course, 'id' | 'createdAt' | 'enrolledUsers'>) => {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
      createdAt: new Date(),
      enrolledUsers: [],
    };
    setCourses([...courses, newCourse]);
    toast({
      title: "Course added",
      description: "New course has been created successfully",
    });
  };

  const enrollInCourse = (courseId: string, userId: string) => {
    const courseToUpdate = courses.find(c => c.id === courseId);
    if (courseToUpdate && !courseToUpdate.enrolledUsers.includes(userId)) {
      const updatedCourse = {
        ...courseToUpdate,
        enrolledUsers: [...courseToUpdate.enrolledUsers, userId],
      };
      setCourses(courses.map(c => (c.id === courseId ? updatedCourse : c)));
      toast({
        title: "Enrolled in course",
        description: `You have successfully enrolled in ${courseToUpdate.title}`,
      });
    }
  };

  const addJobOpportunity = (job: Omit<JobOpportunity, 'id' | 'postedAt'>) => {
    const newJob: JobOpportunity = {
      ...job,
      id: Date.now().toString(),
      postedAt: new Date(),
    };
    setJobOpportunities([...jobOpportunities, newJob]);
    
    // Notify users with matching skills
    users.forEach(user => {
      if (user.department === newJob.department) {
        addNotification({
          title: "New Job Opportunity",
          message: `A new job opportunity matching your department has been posted: ${newJob.title}`,
          userId: user.id,
          type: "job",
          link: "/jobs",
        });
      }
    });
    
    toast({
      title: "Job opportunity added",
      description: "New job opportunity has been posted",
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      isRead: false,
    };
    setNotifications([...notifications, newNotification]);
    toast({
      title: newNotification.title,
      description: newNotification.message,
    });
  };

  const value = {
    currentUser,
    users,
    tasks,
    courses,
    jobOpportunities,
    notifications,
    loginSessions,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    addTask,
    updateTask,
    deleteTask,
    addCourse,
    enrollInCourse,
    addJobOpportunity,
    markNotificationAsRead,
    addNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
