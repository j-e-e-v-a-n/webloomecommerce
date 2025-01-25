import axios from 'axios';

export const axiosi = axios.create({
  withCredentials: true, // Ensures cookies are sent with requests
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:8000", // Default to local backend for development
});
