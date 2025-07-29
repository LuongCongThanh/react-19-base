// src/pages/auth/services/authService.ts
// Service xử lý API liên quan đến xác thực
import axios from 'src/config/axios';

export const loginApi = async (username: string, password: string) => {
  // Thay đổi endpoint cho phù hợp backend
  const res = await axios.post('/auth/login', { username, password });
  return res.data; // { user, token }
};

export const registerApi = async (username: string, password: string, email: string) => {
  const res = await axios.post('/auth/register', { username, password, email });
  return res.data;
};

export const logoutApi = async () => {
  // Nếu cần gọi API logout
  return Promise.resolve();
};
