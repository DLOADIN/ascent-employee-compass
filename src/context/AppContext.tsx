import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Task, Course, JobOpportunity, Notification, LoginSession } from '@/types';
import { mockUsers, mockTasks, mockCourses, mockJobOpportunities, mockNotifications, mockLoginSessions } from '@/data/mockData';
import { useToast } from "@/components/ui/use-toast";
import { login as authLogin, transformUserData } from '@/services/auth';
import axios from 'axios';

interface AppContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  users: User[];
  tasks: Task[];
  courses: Course[];
  jobOpportunities: JobOpportunity[];
  notifications: Notification[];
  loginSessions: LoginSession[];
  notificationsLoading: boolean;
  fetchNotifications: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; redirect?: string }>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>(mockJobOpportunities);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>(mockLoginSessions);

  // Check for existing auth on mount and validate token
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        console.log('No stored token or user found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Validating token with backend...');
        // Validate token with backend
        const response = await axios.get('http://localhost:5000/api/auth/validate', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        if (response.status === 200) {
          console.log('Token validation successful');
          const user = JSON.parse(storedUser);
          setCurrentUser(user);
          setToken(storedToken);
          
          // Update user data from backend response if available
          if (response.data.user) {
            const updatedUser = {
              ...user,
              ...response.data.user
            };
            setCurrentUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }
        } else {
          console.error('Token validation failed:', response.data);
          handleLogout();
        }
      } catch (error: any) {
        console.error('Token validation error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // Add axios interceptor for better error handling
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          console.error('Authentication error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          handleLogout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setToken(null);
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!token) return;
    setNotificationsLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Transform backend fields to Notification type
      const transformed = data.map((n: any) => ({
        id: n.id?.toString(),
        title: n.title,
        message: n.message,
        createdAt: n.createdAt ? new Date(n.createdAt) : undefined,
        isRead: n.is_read === 1 || n.is_read === true,
        userId: n.user_id?.toString(),
        type: n.type,
        link: n.link || undefined,
      }));
      setNotifications(transformed);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Fetch notifications on mount and when token changes
  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authLogin(email, password);
      const transformedUser = transformUserData(response.user);
      
      // Store auth data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(transformedUser));
      
      setCurrentUser(transformedUser);
      setToken(response.token);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${transformedUser.name}!`,
      });
      
      return { success: true, redirect: response.redirect };
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      return { success: false };
    }
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
      handleLogout();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    }
  };

  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    setUsers(users.map(u => (u.id === user.id ? user : u)));
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    });
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
    token,
    isLoading,
    users,
    tasks,
    courses,
    jobOpportunities,
    notifications,
    notificationsLoading,
    loginSessions,
    fetchNotifications,
    login,
    logout,
    updateCurrentUser,
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
