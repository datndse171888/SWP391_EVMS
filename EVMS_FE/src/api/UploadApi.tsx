import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

export const uploadImageApi = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/uploads/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl;
    } else {
      throw new Error('No imageUrl in response');
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload image');
  }
};

export const uploadMultipleImagesApi = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageApi(file));
  return Promise.all(uploadPromises);
};
