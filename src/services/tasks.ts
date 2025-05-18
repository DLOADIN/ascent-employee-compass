import { Task, TaskStatus } from '@/types';
import apiClient, { apiGet, apiPost, apiPut, apiDelete } from './apiClient';

export interface BackendTask {
  id: number;
  title: string;
  description: string;
  assigned_to: string | string[] | null;
  assigned_by: number | string;
  status: TaskStatus;
  progress: number;
  deadline: string;
  documentation: string | null;
  created_at: string;
}

// Transform backend task data to frontend format
export const transformTaskData = (backendTask: BackendTask): Task => {
  // Handle assigned_to field - can be a string (comma-separated) or null
  let assignedTo: string | string[] = "";
  if (backendTask.assigned_to) {
    // Check if it's already an array
    if (Array.isArray(backendTask.assigned_to)) {
      assignedTo = backendTask.assigned_to.map(String);
    } else if (typeof backendTask.assigned_to === 'string') {
      // If it's a comma-separated string, split it
      assignedTo = backendTask.assigned_to.split(',').map(id => id.trim());
    } else {
      // Handle single ID case
      assignedTo = String(backendTask.assigned_to);
    }
  }

  const status = backendTask.status as TaskStatus || 'Todo';
  const progress = typeof backendTask.progress === 'number' ? backendTask.progress : 0;
  
  return {
    id: String(backendTask.id),
    title: backendTask.title || '',
    description: backendTask.description || '',
    assignedTo: assignedTo,
    assignedBy: String(backendTask.assigned_by || ''),
    status: status,
    progress: progress,
    deadline: backendTask.deadline ? new Date(backendTask.deadline) : new Date(),
    documentation: backendTask.documentation || "",
    createdAt: backendTask.created_at ? new Date(backendTask.created_at) : new Date()
  };
};

// Transform frontend task data to backend format
const transformTaskForBackend = (task: Partial<Task>) => {
  return {
    title: task.title,
    description: task.description,
    assigned_to: Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo],
    documentation: task.documentation || "",
    status: task.status || "Todo",
    progress: task.progress || 0,
    deadline: task.deadline instanceof Date ? task.deadline.toISOString() : task.deadline
  };
};

// Get all tasks with error handling
export const getTasks = async (): Promise<Task[]> => {
  const response = await apiGet<BackendTask[]>('/tasks');
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  if (!response.data) {
    return [];
  }
  
  return response.data.map(transformTaskData);
};

// Create a new task
export const createTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const response = await apiPost<BackendTask, ReturnType<typeof transformTaskForBackend>>('/tasks', transformTaskForBackend(taskData));
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  if (!response.data) {
    throw new Error('No data returned from create task API');
  }
  
  return transformTaskData(response.data);
};

// Update an existing task
export const updateTask = async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
  const response = await apiPut<BackendTask, ReturnType<typeof transformTaskForBackend>>(`/tasks/${taskId}`, transformTaskForBackend(taskData));
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  if (!response.data) {
    throw new Error('No data returned from update task API');
  }
  
  return transformTaskData(response.data);
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await apiDelete(`/tasks/${taskId}`);
  
  if (response.error) {
    throw new Error(response.error);
  }
};

// Get all users in a specific department
export const getDepartmentUsers = async (department: string): Promise<any[]> => {
  const response = await apiGet('/users');
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  if (!response.data) {
    return [];
  }
  
  // Filter users by department if needed
  const users = response.data;
  if (department && department !== 'all' && Array.isArray(users)) {
    return users.filter(user => user.department === department);
  }
  
  return Array.isArray(users) ? users : [];
};
