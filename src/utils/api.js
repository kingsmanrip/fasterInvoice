import { getAuthHeader } from './auth';

/**
 * Make an authenticated API request
 * @param {string} url - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} Fetch promise
 */
export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  return fetch(url, config);
};

/**
 * Get data from an API endpoint
 * @param {string} url - API endpoint
 * @returns {Promise} Promise resolving to JSON data
 */
export const getData = async (url) => {
  const response = await fetchWithAuth(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
};

/**
 * Post data to an API endpoint
 * @param {string} url - API endpoint
 * @param {Object} data - Data to send
 * @returns {Promise} Promise resolving to JSON response
 */
export const postData = async (url, data) => {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Update data at an API endpoint
 * @param {string} url - API endpoint
 * @param {Object} data - Data to send
 * @returns {Promise} Promise resolving to JSON response
 */
export const putData = async (url, data) => {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};

/**
 * Delete data at an API endpoint
 * @param {string} url - API endpoint
 * @returns {Promise} Promise resolving to JSON response
 */
export const deleteData = async (url) => {
  const response = await fetchWithAuth(url, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
};
