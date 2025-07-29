// src/services/authService.ts
import axios from '../config/axios';

export const login = async (username: string, password: string) => {
  const { data } = await axios.post('/auth/login', { username, password });
  return data;
};

export const logout = async () => {
  const { data } = await axios.post('/auth/logout');
  return data;
};
