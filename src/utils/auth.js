// Authentication utility functions

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return localStorage.getItem('authToken') !== null;
};

/**
 * Get the current authenticated user
 * @returns {string|null} Username if authenticated, null otherwise
 */
export const getCurrentUser = () => {
  return localStorage.getItem('user');
};

/**
 * Get the authentication token
 * @returns {string|null} JWT token if authenticated, null otherwise
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Set authentication data after successful login
 * @param {string} token - JWT token
 * @param {string} username - Username
 */
export const setAuth = (token, username) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', username);
};

/**
 * Clear authentication data (logout)
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Get authorization header for API requests
 * @returns {Object} Headers object with Authorization
 */
export const getAuthHeader = () => {
  const token = getToken();
  return {
    'Authorization': `Bearer ${token}`
  };
};
