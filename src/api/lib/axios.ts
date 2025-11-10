import axios, { AxiosInstance } from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 1000 * 60 * 60 * 24, // 24 hours
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

export default api;
