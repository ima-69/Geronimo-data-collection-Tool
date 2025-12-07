import { useState, useEffect } from 'react';
import { payloadAPI, documentAPI } from '../services/api';

function DocumentLinksTab() {
  const [payloads, setPayloads] = useState([]);
  const [expandedPayload, setExpandedPayload] = useState(null);
  const [viewPayloadDetails, setViewPayloadDetails] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newDocumentLinks, setNewDocumentLinks] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPayloads();
  }, []);

  useEffect(() => {
    if (expandedPayload) {
      loadDocuments(expandedPayload.id);
    }
  }, [expandedPayload]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const loadPayloads = async () => {
    setLoading(true);
    try {
      const response = await payloadAPI.getAllWithDocuments();
      setPayloads(response.data || []);
    } catch (error) {
      showMessage('error', 'Failed to load payloads: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (payloadId) => {
    try {
      const response = await documentAPI.getByPayloadId(payloadId);
      setDocuments(prev => ({ ...prev, [payloadId]: response.data || [] }));
    } catch (error) {
      showMessage('error', 'Failed to load documents: ' + error.message);
      setDocuments(prev => ({ ...prev, [payloadId]: [] }));
    }
  };

  const handleAddDocument = async (payloadId, e) => {
    e.preventDefault();
    const documentLink = newDocumentLinks[payloadId]?.trim();
    
    if (!documentLink) {
      showMessage('error', 'Please enter a document link');
      return;
    }

    setLoading(true);
    try {
      await documentAPI.create(payloadId, documentLink);
      showMessage('success', 'Document link added successfully!');
      setNewDocumentLinks(prev => ({ ...prev, [payloadId]: '' }));
      await loadDocuments(payloadId);
      await loadPayloads();
    } catch (error) {
      showMessage('error', 'Failed to add document: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (payloadId, documentId) => {
    if (!confirm('Are you sure you want to delete this document link?')) {
      return;
    }

    setLoading(true);
    try {
      await documentAPI.delete(documentId);
      showMessage('success', 'Document link deleted successfully!');
      await loadDocuments(payloadId);
      await loadPayloads();
    } catch (error) {
      showMessage('error', 'Failed to delete document: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const togglePayloadExpansion = (payload) => {
    if (expandedPayload?.id === payload.id) {
      setExpandedPayload(null);
    } else {
      setExpandedPayload(payload);
    }
  };

  const getFilteredPayloads = () => {
    let filtered = payloads;
    if (filter === 'withDocuments') {
      filtered = filtered.filter(p => p.documents && p.documents.length > 0);
    } else if (filter === 'withoutDocuments') {
      filtered = filtered.filter(p => !p.documents || p.documents.length === 0);
    }
    // Sort by ID in ascending order
    return filtered.sort((a, b) => a.id - b.id);
  };

  const filteredPayloads = getFilteredPayloads();
  const stats = {
    total: payloads.length,
    withDocs: payloads.filter(p => p.documents && p.documents.length > 0).length,
    withoutDocs: payloads.filter(p => !p.documents || p.documents.length === 0).length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Document Submission</h2>
        <p className="text-gray-600">Add Google Drive document links based on lead questions (help comments)</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setFilter('withDocuments')}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                filter === 'withDocuments'
                  ? 'bg-green-200 text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              With Docs ({stats.withDocs})
            </button>
            <button
              onClick={() => setFilter('withoutDocuments')}
              className={`px-3 py-1.5 rounded-md font-medium text-xs transition-colors ${
                filter === 'withoutDocuments'
                  ? 'bg-orange-200 text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Need Docs ({stats.withoutDocs})
            </button>
          <button
            onClick={loadPayloads}
            className="ml-auto px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* All Payloads List */}
      {loading && payloads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading payloads...</div>
      ) : filteredPayloads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {filter !== 'all' 
            ? 'No payloads match your filter' 
            : 'No payloads found. Add payloads in the first tab.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayloads.map((payload) => {
            const isExpanded = expandedPayload?.id === payload.id;
            const payloadDocuments = documents[payload.id] || payload.documents || [];
            
            return (
              <div
                key={payload.id}
                className={`bg-white rounded-lg shadow-md border-2 transition-all ${
                  isExpanded
                    ? 'border-blue-500 ring-4 ring-blue-200'
                    : payload.documents && payload.documents.length > 0
                    ? 'border-green-300 hover:border-green-400'
                    : 'border-orange-200 hover:border-orange-300'
                }`}
              >
                {/* Payload Card Header */}
                <div className={`p-5 rounded-t-lg cursor-pointer ${
                  payload.documents && payload.documents.length > 0
                    ? 'bg-gradient-to-r from-green-200 to-green-300'
                    : 'bg-gradient-to-r from-orange-200 to-orange-300'
                }`} onClick={() => togglePayloadExpansion(payload)}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl font-bold text-black">Payload #{payload.id}</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          payload.documents && payload.documents.length > 0
                            ? 'bg-green-300 text-black'
                            : 'bg-orange-300 text-black'
                        }`}>
                          {payload.documents && payload.documents.length > 0 ? '✓ Complete' : '⚠ Pending'}
                        </div>
                        <div className="text-sm text-black">
                          {payloadDocuments.length} document{payloadDocuments.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewPayloadDetails(payload);
                        }}
                        className="px-4 py-2 h-[36px] bg-white text-gray-900 rounded-lg font-semibold text-xs transition-all shadow-md hover:shadow-lg hover:bg-gray-50 border-2 border-white border-opacity-50 flex items-center justify-center"
                      >
                        View Full Payload
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePayloadExpansion(payload);
                        }}
                        className="px-4 py-2 h-[36px] bg-white text-gray-900 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg hover:bg-gray-50 border-2 border-white border-opacity-50"
                      >
                        <span>{isExpanded ? 'Hide Details' : 'View & Submit Documents'}</span>
                        <span className={`text-lg font-bold transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ↓
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lead Question Preview */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">❓</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Lead Question</div>
                      <div className="text-sm font-medium text-gray-800 line-clamp-2">
                        {payload.leadInfo?.canHelpComment || 'No question provided'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Document Submission Section */}
                {isExpanded && (
                  <div className="p-3 bg-gray-50 animate-fadeIn border-t border-gray-200">
                    <div className="mb-3">
                      <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                        <span className="text-base">📎</span>
                        Submit Documents
                      </h4>
                      
                      <form onSubmit={(e) => handleAddDocument(payload.id, e)} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            <span className="flex items-center gap-1.5">
                              <span className="text-sm">🔗</span>
                              Google Drive Document Link
                              <span className="text-red-500">*</span>
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="url"
                              value={newDocumentLinks[payload.id] || ''}
                              onChange={(e) => setNewDocumentLinks(prev => ({
                                ...prev,
                                [payload.id]: e.target.value
                              }))}
                              placeholder="https://drive.google.com/file/d/..."
                              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              required
                            />
                            {(newDocumentLinks[payload.id] || '').trim() && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <span className="text-green-500 text-sm">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Paste the Google Drive link that answers the lead question above. You can add multiple documents.
                          </p>
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          {loading ? (
                            <>
                              <span className="animate-spin text-sm">⏳</span>
                              <span>Adding...</span>
                            </>
                          ) : (
                            <>
                              <span className="text-sm">➕</span>
                              <span>Submit Document</span>
                              <span className="text-sm">→</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Existing Documents Section */}
                    <div className="mt-3">
                      <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                        <span className="text-base">📄</span>
                        Submitted Documents ({payloadDocuments.length})
                      </h4>
                      
                      {payloadDocuments.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {payloadDocuments.map((doc, index) => (
                            <div
                              key={doc.id}
                              className="relative p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-md border border-blue-200 hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center mb-1.5">
                                    <span className="text-lg mr-1.5">📄</span>
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                      Doc #{index + 1}
                                    </span>
                                  </div>
                                  <a
                                    href={doc.documentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all block text-xs font-medium"
                                  >
                                    {doc.documentLink}
                                  </a>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(doc.createdAt)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteDocument(payload.id, doc.id)}
                                  className="ml-2 px-1.5 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs font-medium flex-shrink-0"
                                  title="Delete document"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-xl mb-1">📎</div>
                          <p className="text-xs">No documents submitted yet</p>
                          <p className="text-xs mt-0.5">Use the form above to add your first document</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Full Payload Details Modal */}
      {viewPayloadDetails && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50" 
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
          onClick={() => setViewPayloadDetails(null)}
        >
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Payload #{viewPayloadDetails.id} - Full Details</h3>
              <button
                onClick={() => setViewPayloadDetails(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Email Info */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-3">Email Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Subject:</span>
                    <div className="text-gray-800">{viewPayloadDetails.emailInfo?.subject}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">From:</span>
                    <div className="text-gray-800">{viewPayloadDetails.emailInfo?.from}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">To:</span>
                    <div className="text-gray-800">{viewPayloadDetails.emailInfo?.to?.join(', ') || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">CC:</span>
                    <div className="text-gray-800">{viewPayloadDetails.emailInfo?.cc?.join(', ') || 'None'}</div>
                  </div>
                </div>
              </div>

              {/* Lead Info */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-3">Lead Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <div className="text-gray-800">
                      {viewPayloadDetails.leadInfo?.firstName} {viewPayloadDetails.leadInfo?.lastName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Job Title:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.jobTitle || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Company:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.company || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Country:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.country || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">State:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.state || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Industry:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.industry || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Area of Interest:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.areaOfInterest || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Contact Reason:</span>
                    <div className="text-gray-800">{viewPayloadDetails.leadInfo?.contactReason || 'N/A'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Can Help Comment:</span>
                    <div className="text-gray-800 mt-1">{viewPayloadDetails.leadInfo?.canHelpComment || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Documents ({viewPayloadDetails.documents?.length || 0})
                </h4>
                {viewPayloadDetails.documents && viewPayloadDetails.documents.length > 0 ? (
                  <div className="space-y-2">
                    {viewPayloadDetails.documents.map((doc) => (
                      <div key={doc.id} className="bg-white p-3 rounded border border-gray-200">
                        <a
                          href={doc.documentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all block text-sm"
                        >
                          📄 {doc.documentLink}
                        </a>
                        <div className="text-xs text-gray-500 mt-1">
                          Added: {formatDate(doc.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No documents added yet</div>
                )}
              </div>

              <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-200">
                Created: {formatDate(viewPayloadDetails.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentLinksTab;
