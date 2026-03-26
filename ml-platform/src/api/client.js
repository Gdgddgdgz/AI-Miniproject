/**
 * client.js – Axios-based API client for AutoML Studio.
 * Automatically attaches JWT from localStorage to every request.
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 180_000, // 3 minutes for long training jobs
});

// Attach JWT token to every outgoing request
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler – log 401s for debugging
apiInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid – clear it
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const api = {
  baseURL: BASE_URL,

  // ── Dataset ───────────────────────────────────────────────────────────
  uploadDataset(file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiInstance.post('/upload', formData);
  },

  analyzeDataset() {
    return apiInstance.get('/analyze');
  },

  preprocessDataset(targetColumn) {
    return apiInstance.post('/preprocess', { target_column: targetColumn });
  },

  // ── Training ──────────────────────────────────────────────────────────
  trainModel(target, modelName, testSize, problemType = null, advancedConfig = {}) {
    return apiInstance.post('/train', {
      target,
      model: modelName,
      test_size: testSize,
      problem_type: problemType,
      ...advancedConfig,
    });
  },

  compareModels(target, testSize, problemType = null, advancedConfig = {}) {
    return apiInstance.post('/compare', {
      target,
      test_size: testSize,
      problem_type: problemType,
      ...advancedConfig,
    });
  },

  // ── Auth ──────────────────────────────────────────────────────────────
  login(username, password) {
    // OAuth2PasswordRequestForm requires application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    return apiInstance.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  signup(username, password) {
    return apiInstance.post('/auth/signup', { username, password });
  },

  // ── Download ──────────────────────────────────────────────────────────
  // Uses axios so the auth header is sent correctly (browser <a> can't send headers)
  async downloadModel() {
    const token = localStorage.getItem('token');
    const response = await apiInstance.get('/download-model', {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    // Auto-trigger browser save dialog
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    const disposition = response.headers['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    link.href = url;
    link.setAttribute('download', match ? match[1] : 'model.pkl');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // ── Dashboard ─────────────────────────────────────────────────────────
  getModelHistory() {
    return apiInstance.get('/dashboard/models');
  },
};
