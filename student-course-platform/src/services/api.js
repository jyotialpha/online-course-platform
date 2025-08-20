import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Add token to axios requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signIn = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, credentials);
    return response;
  } catch (error) {
    console.error('API Error:', error);
    throw {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      response: error.response
    };
  }
};

export const googleSignIn = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/google-signin`, userData);
    return response;
  } catch (error) {
    console.error('Google Sign-In API Error:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Google sign-in failed',
      response: error.response
    };
  }
};

export const getStudentData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/student`);
    return response;
  } catch (error) {
    console.error('Student Data API Error:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Failed to fetch student data',
      response: error.response
    };
  }
};

export const signOut = async () => {
  try {
    await axios.get(`${API_BASE_URL}/api/auth/logout`);
  } catch (error) {
    throw error;
  }
};
