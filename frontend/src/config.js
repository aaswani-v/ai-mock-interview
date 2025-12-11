// API Configuration
// In production, set VITE_API_URL environment variable
// In development, falls back to localhost

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'production' ? "https://interaura-api.onrender.com" : "http://127.0.0.1:8000");

export const API_URL = `${API_BASE}/api`;
