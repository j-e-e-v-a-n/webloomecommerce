import axios from 'axios';

export const axiosi = axios.create({
  withCredentials: true, // Ensures cookies are sent with requests
  baseURL: process.env.REACT_APP_BASE_URL || "https://webloomecommerce.vercel.app", // Default to local backend for development
});
