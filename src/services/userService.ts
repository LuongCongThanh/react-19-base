// src/services/userService.ts
import axios from '../config/axios';

export const getUser = async (id: string) => {
  const { data } = await axios.get(`/users/${id}`);
  return data;
};
