import axios from 'axios';

// Retrieve the token from localStorage
const token = window.localStorage.getItem("token");

// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});
export const api2 = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token if available
api.interceptors.request.use(
  (config) => {
    const token = window.localStorage.getItem("token"); // Re-check token for each request
    if (token) {
      config.headers['authorization'] = `bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export backend URL separately
export const backend_url = 'http://localhost:8081';

// Forum API functions using Axios
export const fetchMentorGroups = async (mentor_id) => {
  try {
      const response = await api.get(`/api/teacher/forum/groups/${mentor_id}`);
      return response.data;
  } catch (error) {
      console.error("Failed to fetch mentor groups:", error.response?.data || error.message);
      throw error;
  }
};

export const fetchMentees = async (mmr_id) => {
  try {
      const response = await api.get(`/api/teacher/forum/mentees/${mmr_id}`);
      return response.data;
  } catch (error) {
      console.error("Failed to fetch mentees:", error.response?.data || error.message);
      throw error;
  }
};

export const fetchForumMessages = async (mmr_id) => {
  try {
      const response = await api.get(`/api/teacher/forum/messages/${mmr_id}`);
      return response.data;
  } catch (error) {
      console.error("Failed to fetch forum messages:", error.response?.data || error.message);
      throw error;
  }
};

export const sendMessage = async (data) => {
  try {
      const response = await api.post(`/api/teacher/forum/messages`, data);
      return response.data;
  } catch (error) {
      console.error("Failed to send message:", error.response?.data || error.message);
      throw error;
  }
};

export default api;