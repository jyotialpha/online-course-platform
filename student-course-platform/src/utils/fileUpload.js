import { API_BASE_URL } from '../config/api';

export const uploadThumbnail = async (file, token) => {
  const formData = new FormData();
  formData.append('thumbnail', file);
  
  const response = await fetch(`${API_BASE_URL}/api/upload/thumbnail`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload thumbnail');
  }
  
  const data = await response.json();
  return data.data.url;
};

export const uploadPDF = async (file, token) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  const response = await fetch(`${API_BASE_URL}/api/upload/pdf`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload PDF');
  }
  
  const data = await response.json();
  return data.data.url;
};