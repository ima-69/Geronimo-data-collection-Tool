// API service for backend communication
// Priority: window.configs.apiUrl (Choreo) > VITE_API_BASE_URL (env) > localhost (fallback)
// This function gets the API base URL at runtime to ensure config.js has loaded
function getApiBaseUrl() {
    let apiUrl = window?.configs?.apiUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8083/api';
    console.log('API Base URL:', apiUrl);
    // Ensure API_BASE_URL ends with /api for backend service path
    // Remove trailing slash if present, then append /api
    if (apiUrl && !apiUrl.endsWith('/api')) {
        // Remove trailing slash if present
        apiUrl = apiUrl.replace(/\/$/, '');
        // Append /api if not already present at the end
        if (!apiUrl.endsWith('/api')) {
            apiUrl = `${apiUrl}/api`;
        }
    }
    
    return apiUrl;
}

// Fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  const API_BASE_URL = getApiBaseUrl();
  console.log('API Base URL:', API_BASE_URL, 'Endpoint:', endpoint);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Payload APIs
export const payloadAPI = {
  // Get all payloads
  getAll: () => fetchAPI('/payloads'),
  
  // Get payload by ID
  getById: (id) => fetchAPI(`/payloads/${id}`),
  
  // Get payload with documents
  getWithDocuments: (id) => fetchAPI(`/payloads/${id}/documents`),
  
  // Get all payloads with documents
  getAllWithDocuments: () => fetchAPI('/payloads/all/documents'),
  
  // Add new payload
  create: (payload) => fetchAPI('/payloads', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

// Document APIs
export const documentAPI = {
  // Get documents for a payload
  getByPayloadId: (payloadId) => fetchAPI(`/documents/payload/${payloadId}`),
  
  // Add document link
  create: (payloadId, documentLink) => fetchAPI('/documents', {
    method: 'POST',
    body: JSON.stringify({ payloadId, documentLink }),
  }),
  
  // Delete document
  delete: (documentId) => fetchAPI(`/documents/${documentId}`, {
    method: 'DELETE',
  }),
};




