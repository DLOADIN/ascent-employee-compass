
import axios from 'axios';
import { Department, UserRole } from '@/types';

const API_URL = 'https://ascent-employee-compass.onrender.com/api';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    department: Department | 'Admin';
    phone_number: string;
    experience: number | null;
    experience_level: number | null;
    description: string | null;
    profile_image_url: string | null;
    is_active: boolean;
  };
  redirect?: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const transformUserData = (backendUser: LoginResponse['user']) => {
  return {
    id: String(backendUser.id),
    name: backendUser.name,
    email: backendUser.email,
    role: backendUser.role,
    department: backendUser.department === 'Admin' ? 'IT' : backendUser.department,
    phoneNumber: backendUser.phone_number || '',
    experience: backendUser.experience || 0,
    experienceLevel: backendUser.experience_level || 0,
    description: backendUser.description || '',
    profileImage: backendUser.profile_image_url || '',
    isActive: backendUser.is_active
  };
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const response = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    localStorage.removeItem('token');
    return null;
  }
};

export const updateUser = async (userId: number, userData: any) => {
  const token = localStorage.getItem('token');
  const response = await axios.put(`${API_URL}/users/${userId}`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const createUser = async (userData: any) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/users`, userData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteUser = async (userId: number) => {
  const token = localStorage.getItem('token');
  const response = await axios.delete(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getUsers = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}; 
