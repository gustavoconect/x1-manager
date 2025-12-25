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

// Request Interceptor: Inject Secret if available
api.interceptors.request.use(config => {
    const adminSecret = localStorage.getItem('admin_secret');
    if (adminSecret) {
        config.headers['x-admin-secret'] = adminSecret;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Response Interceptor: Handle 403 -> Prompt Password -> Retry
api.interceptors.response.use(response => {
    return response;
}, async error => {
    const originalRequest = error.config;

    // If 403 (Forbidden) and not already retried
    if (error.response && error.response.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Prompt User
        const password = window.prompt("⚠️ Modo Admin Necessário ⚠️\n\nEste comando altera o estado do torneio.\nDigite a senha de administrador:");

        if (password) {
            localStorage.setItem('admin_secret', password);
            // Update header and retry
            originalRequest.headers['x-admin-secret'] = password;
            return api(originalRequest);
        }
    }

    return Promise.reject(error);
});

export default api;
