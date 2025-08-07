// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://topperaimentor-production.up.railway.app';

export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`
  },
  CHATBOT: {
    CHAT: `${API_BASE_URL}/api/chatbot/chat`,
    STATISTICS: `${API_BASE_URL}/api/chatbot/statistics`,
    TEST: `${API_BASE_URL}/api/chatbot/test`
  },
  STUDENT: {
    PROFILE: `${API_BASE_URL}/api/student/profile`,
    PROGRESS: `${API_BASE_URL}/api/student/learning-progress`,
    RECOMMENDATIONS: `${API_BASE_URL}/api/student/recommendations`
  },
  DEADLINES: `${API_BASE_URL}/api/deadlines`,
  DOUBT_RESOLVER: `${API_BASE_URL}/api/doubt-resolver`,
  RECOMMENDATIONS: `${API_BASE_URL}/api/recommendations`,
  VOICE_TO_TEXT: `${API_BASE_URL}/api/voice-to-text`
};

export default API_ENDPOINTS;
