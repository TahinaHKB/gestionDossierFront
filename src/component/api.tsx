import axios, { type InternalAxiosRequestConfig } from "axios";
import { refreshToken } from "../component/auth"; // ta fonction refresh

const API = axios.create({
  baseURL: "https://gestiondossierback.onrender.com", // backend Django
});

// Request interceptor : ajouter automatiquement le token
API.interceptors.request.use(
  async (req: InternalAxiosRequestConfig) => {
    req.headers = req.headers ?? {};
    let token = localStorage.getItem("access_token");

    if (token) {
      (req.headers as any).Authorization = `Bearer ${token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// Response interceptor : rafraîchir le token si expiré (401)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // si 401 et qu'on a un refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // éviter boucle infinie
      const newToken = await refreshToken();

      if (newToken?.access) {
        localStorage.setItem("access_token", newToken.access);
        (originalRequest.headers as any).Authorization = `Bearer ${newToken.access}`;
        return API(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
