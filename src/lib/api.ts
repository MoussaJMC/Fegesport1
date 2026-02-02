import axios from 'axios';

const API_URL = import.meta.env.VITE_STRAPI_API_URL;
const API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

if (!API_URL) {
  throw new Error('VITE_STRAPI_API_URL environment variable is required');
}

// Enforce HTTPS in production
if (import.meta.env.PROD && !API_URL.startsWith('https://')) {
  throw new Error('API URL must use HTTPS in production');
}

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(API_TOKEN && { Authorization: `Bearer ${API_TOKEN}` }),
  },
});

// Auth endpoints
export const auth = {
  login: async (identifier: string, password: string) => {
    const response = await api.post('/auth/local', { identifier, password });
    return response.data;
  },
  register: async (username: string, email: string, password: string) => {
    const response = await api.post('/auth/local/register', { username, email, password });
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (code: string, password: string, passwordConfirmation: string) => {
    const response = await api.post('/auth/reset-password', {
      code,
      password,
      passwordConfirmation,
    });
    return response.data;
  },
};

// Content endpoints
export const content = {
  // News
  getNews: async (params = {}) => {
    const response = await api.get('/news', { params });
    return response.data;
  },
  getNewsById: async (id: string) => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },
  
  // Events
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  getEventById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  registerForEvent: async (eventId: string, data: any) => {
    const response = await api.post(`/event-registrations`, {
      data: { event: eventId, ...data },
    });
    return response.data;
  },
  
  // Members
  getMembers: async (params = {}) => {
    const response = await api.get('/members', { params });
    return response.data;
  },
  createMember: async (data: any) => {
    const response = await api.post('/members', { data });
    return response.data;
  },
  
  // Partners
  getPartners: async (params = {}) => {
    const response = await api.get('/partners', { params });
    return response.data;
  },
  createPartner: async (data: any) => {
    const response = await api.post('/partners', { data });
    return response.data;
  },
  
  // Resources
  getResources: async (params = {}) => {
    const response = await api.get('/resources', { params });
    return response.data;
  },
  
  // Newsletter
  subscribeNewsletter: async (data: any) => {
    const response = await api.post('/newsletter-subscriptions', { data });
    return response.data;
  },
  
  // Contact
  submitContact: async (data: any) => {
    const response = await api.post('/contacts', { data });
    return response.data;
  },
  
  // Community Stats
  getCommunityStats: async () => {
    const response = await api.get('/community-stats');
    return response.data;
  },
};

export default api;