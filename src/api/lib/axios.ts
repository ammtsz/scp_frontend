import axios, { AxiosInstance } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3002',
  timeout: 1000 * 60 * 60 * 24, // 24 hours
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default api;
