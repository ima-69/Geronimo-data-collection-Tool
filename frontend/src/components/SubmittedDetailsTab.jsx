import { useState, useEffect } from 'react';
import { payloadAPI } from '../services/api';

function SubmittedDetailsTab() {
  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [filter, setFilter] = useState('all'); // all, withDocuments, withoutDocuments
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPayloads();
  }, []);

  const loadPayloads = async () => {
    setLoading(true);
    try {
      const response = await payloadAPI.getAllWithDocuments();
      setPayloads(response.data || []);
    } catch (error) {
      console.error('Failed to load payloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getFilteredPayloads = () => {
    let filtered = payloads;

    // Filter by document status
    if (filter === 'withDocuments') {
      filtered = filtered.filter(p => p.documents && p.documents.length > 0);
    } else if (filter === 'withoutDocuments') {
      filtered = filtered.filter(p => !p.documents || p.documents.length === 0);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.emailInfo?.subject?.toLowerCase().includes(term) ||
        p.emailInfo?.from?.toLowerCase().includes(term) ||
        p.leadInfo?.firstName?.toLowerCase().includes(term) ||
        p.leadInfo?.lastName?.toLowerCase().includes(term) ||
        p.leadInfo?.company?.toLowerCase().includes(term) ||
        p.leadInfo?.canHelpComment?.toLowerCase().includes(term)
      );
    }

    return filtered;
  };

  const getStats = () => {
    const total = payloads.length;
    const withDocs = payloads.filter(p => p.documents && p.documents.length > 0).length;
    const withoutDocs = total - withDocs;
    const totalDocuments = payloads.reduce((sum, p) => sum + (p.documents?.length || 0), 0);
    
    return { total, withDocs, withoutDocs, totalDocuments };
  };

  const stats = getStats();
  const filteredPayloads = getFilteredPayloads();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Submitted Details</h2>
        <p className="text-gray-600">View and analyze all submitted payloads and their documents</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <div className="text-3xl font-bold mb-1">{stats.total}</div>
          <div className="text-blue-100 text-sm">Total Payloads</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
          <div className="text-3xl font-bold mb-1">{stats.withDocs}</div>
          <div className="text-green-100 text-sm">With Documents</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-lg text-white">
          <div className="text-3xl font-bold mb-1">{stats.withoutDocs}</div>
          <div className="text-yellow-100 text-sm">Without Documents</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
          <div className="text-3xl font-bold mb-1">{stats.totalDocuments}</div>
          <div className="text-purple-100 text-sm">Total Documents</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by subject, email, name, company, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('withDocuments')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'withDocuments'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              With Docs
            </button>
            <button
              onClick={() => setFilter('withoutDocuments')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'withoutDocuments'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Without Docs
            </button>
          </div>
          <button
            onClick={loadPayloads}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Payloads Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading payloads...</div>
      ) : filteredPayloads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm || filter !== 'all' 
            ? 'No payloads match your filters' 
            : 'No payloads found. Add payloads in the first tab.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPayloads.map((payload) => (
            <div
              key={payload.id}
              className={`bg-white rounded-lg shadow-md border-2 transition-all hover:shadow-xl cursor-pointer ${
                selectedPayload?.id === payload.id
                  ? 'border-blue-500 ring-4 ring-blue-200'
                  : payload.documents && payload.documents.length > 0
                  ? 'border-green-300'
                  : 'border-yellow-300'
              }`}
              onClick={() => setSelectedPayload(selectedPayload?.id === payload.id ? null : payload)}
            >
              {/* Header */}
              <div className={`p-4 rounded-t-lg ${
                payload.documents && payload.documents.length > 0
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gradient-to-r from-yellow-400 to-yellow-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="text-white">
                    <div className="text-lg font-bold">Payload #{payload.id}</div>
                    <div className="text-sm opacity-90 mt-1">
                      {payload.documents?.length || 0} document{payload.documents?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    payload.documents && payload.documents.length > 0
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }`}>
                    {payload.documents && payload.documents.length > 0 ? '✓ Complete' : '⚠ Pending'}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Subject</div>
                  <div className="text-sm font-medium text-gray-800 line-clamp-2">
                    {payload.emailInfo?.subject || 'No subject'}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">From</div>
                  <div className="text-sm text-gray-700 truncate">
                    {payload.emailInfo?.from || 'N/A'}
                  </div>
                </div>

                {payload.leadInfo?.firstName || payload.leadInfo?.lastName ? (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Lead</div>
                    <div className="text-sm text-gray-700">
                      {payload.leadInfo.firstName} {payload.leadInfo.lastName}
                    </div>
                  </div>
                ) : null}

                {payload.leadInfo?.company && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Company</div>
                    <div className="text-sm text-gray-700">{payload.leadInfo.company}</div>
                  </div>
                )}

                {payload.leadInfo?.canHelpComment && (
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Help Comment</div>
                    <div className="text-sm text-gray-700 line-clamp-2">
                      {payload.leadInfo.canHelpComment}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
                  Created: {formatDate(payload.createdAt)}
                </div>
              </div>

              {/* Documents Preview */}
              {payload.documents && payload.documents.length > 0 && (
                <div className="px-4 pb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Documents</div>
                  <div className="space-y-1">
                    {payload.documents.slice(0, 2).map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="block text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                      >
                        📄 {doc.documentLink}
                      </a>
                    ))}
                    {payload.documents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{payload.documents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detailed View Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPayload(null)}>
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Payload #{selectedPayload.id} Details</h3>
              <button
                onClick={() => setSelectedPayload(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Email Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Email Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Subject:</span>
                    <div className="text-gray-800">{selectedPayload.emailInfo?.subject}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">From:</span>
                    <div className="text-gray-800">{selectedPayload.emailInfo?.from}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">To:</span>
                    <div className="text-gray-800">{selectedPayload.emailInfo?.to?.join(', ') || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">CC:</span>
                    <div className="text-gray-800">{selectedPayload.emailInfo?.cc?.join(', ') || 'None'}</div>
                  </div>
                </div>
              </div>

              {/* Lead Info */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Lead Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <div className="text-gray-800">
                      {selectedPayload.leadInfo?.firstName} {selectedPayload.leadInfo?.lastName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.phone || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Job Title:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.jobTitle || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Company:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.company || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Country:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.country || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">State:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.state || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Industry:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.industry || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Area of Interest:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.areaOfInterest || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Contact Reason:</span>
                    <div className="text-gray-800">{selectedPayload.leadInfo?.contactReason || 'N/A'}</div>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-600">Can Help Comment:</span>
                    <div className="text-gray-800 mt-1">{selectedPayload.leadInfo?.canHelpComment || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Documents ({selectedPayload.documents?.length || 0})
                </h4>
                {selectedPayload.documents && selectedPayload.documents.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPayload.documents.map((doc) => (
                      <div key={doc.id} className="bg-white p-3 rounded border border-gray-200">
                        <a
                          href={doc.documentLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all block"
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
                Created: {formatDate(selectedPayload.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmittedDetailsTab;


