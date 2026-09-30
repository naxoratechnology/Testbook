import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });

export const contentImagesApiService = {
  upload(file: File, onProgress?: (percent: number) => void) {
    const data = new FormData();
    data.append('upload', file, file.name);
    return api.post('/content-images', data, {
      onUploadProgress: (event) => {
        if (event.total && onProgress) onProgress(Math.round((event.loaded / event.total) * 100));
      },
    });
  },
};
