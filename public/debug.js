// Debug script to help diagnose navigation issues
console.log('Debug script loaded');

// Listen for fetch events
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch request:', args[0]);
  return originalFetch.apply(this, args)
    .then(response => {
      console.log('Fetch response for', args[0], ':', response.status);
      return response;
    })
    .catch(error => {
      console.error('Fetch error for', args[0], ':', error);
      throw error;
    });
};

// Log route changes
console.log('Current pathname:', window.location.pathname);
