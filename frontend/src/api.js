import axios from 'axios';

// Change this URL if deploying or using Ngrok/Localtunnel
// For local dev: "http://localhost:8000"
// For remote: set VITE_API_URL in .env or Vercel Environment Variables
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;
