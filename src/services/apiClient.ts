import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to automatically add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally, redirect to login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  statusCode: number | null;
}

export async function apiGet<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<T> = await apiClient.get(endpoint, config);
    return {
      data: response.data,
      error: null,
      statusCode: response.status,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      data: null,
      error: axiosError.message || 'An unknown error occurred',
      statusCode: axiosError.response?.status || null,
    };
  }
}

export async function apiPost<T, D>(endpoint: string, data: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<T> = await apiClient.post(endpoint, data, config);
    return {
      data: response.data,
      error: null,
      statusCode: response.status,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      data: null,
      error: axiosError.message || 'An unknown error occurred',
      statusCode: axiosError.response?.status || null,
    };
  }
}

export async function apiPut<T, D>(endpoint: string, data: D, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<T> = await apiClient.put(endpoint, data, config);
    return {
      data: response.data,
      error: null,
      statusCode: response.status,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      data: null,
      error: axiosError.message || 'An unknown error occurred',
      statusCode: axiosError.response?.status || null,
    };
  }
}

export async function apiDelete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
  try {
    const response: AxiosResponse<T> = await apiClient.delete(endpoint, config);
    return {
      data: response.data,
      error: null,
      statusCode: response.status,
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    return {
      data: null,
      error: axiosError.message || 'An unknown error occurred',
      statusCode: axiosError.response?.status || null,
    };
  }
}

export default apiClient; 