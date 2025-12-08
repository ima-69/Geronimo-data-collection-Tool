// API service for backend communication
// Priority: window.configs.apiUrl (Choreo) > VITE_API_BASE_URL (env) > localhost (fallback)
let API_BASE_URL = window?.configs?.apiUrl || import.meta.env.VITE_API_BASE_URL;

// Ensure API_BASE_URL ends with /api for backend service path
// Remove trailing slash if present, then append /api
if (API_BASE_URL && !API_BASE_URL.endsWith('/api')) {
    // Remove trailing slash if present
    API_BASE_URL = API_BASE_URL.replace(/\/$/, '');
    // Append /api if not already present at the end
    if (!API_BASE_URL.endsWith('/api')) {
        API_BASE_URL = `${API_BASE_URL}/api`;
    }
}

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);

// Fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
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




