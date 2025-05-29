// Simple fetch-based API client for Strapi
const API_URL = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337';
const API_TOKEN = import.meta.env.VITE_STRAPI_API_TOKEN;

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const fetchAPI = async (path: string, urlParamsObject = {}, options: RequestOptions = {}) => {
  try {
    const mergedOptions = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_TOKEN}`,
        ...options.headers,
      },
      ...options,
    };

    const queryString = new URLSearchParams(urlParamsObject).toString();
    const requestUrl = `${API_URL}/api${path}${queryString ? `?${queryString}` : ''}`;

    // For community stats, we'll simulate the data for now
    if (path === '/community-stats') {
      return {
        players: Math.floor(Math.random() * 200) + 150, // Random number between 150-350
        clubs: Math.floor(Math.random() * 10) + 12, // Random number between 12-22
        partners: Math.floor(Math.random() * 5) + 8, // Random number between 8-13
      };
    }

    const response = await fetch(requestUrl, mergedOptions);
    
    if (!response.ok) {
      throw new Error(`An error occurred: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
    throw error;
  }
};

export const getStrapiMedia = (url: string) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('//')) return url;
  return `${API_URL}${url}`;
};