import { useState, useEffect } from 'react';
import { payloadAPI } from '../services/api';

function SubmittedDetailsTable() {
  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewPayloadDetails, setViewPayloadDetails] = useState(null);
  const [filter, setFilter] = useState('all');

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
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Submitted Details</h2>
        <p className="text-gray-600">View all submitted payloads and their documents in a table format</p>
      </div>

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

      {/* Table */}
      {loading && payloads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading payloads...</div>
      ) : filteredPayloads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {filter !== 'all' 
            ? 'No payloads match your filter' 
            : 'No payloads found. Add payloads in the first tab.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Payload ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Lead Question
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Submitted Documents
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayloads.map((payload) => {
                  const hasDocuments = payload.documents && payload.documents.length > 0;
                  return (
                    <tr 
                      key={payload.id} 
                      className={`transition-colors ${
                        hasDocuments 
                          ? 'hover:bg-green-50' 
                          : 'hover:bg-orange-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`text-lg font-bold ${
                            hasDocuments ? 'text-green-700' : 'text-orange-700'
                          }`}>
                            #{payload.id}
                          </div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            hasDocuments
                              ? 'bg-green-200 text-black'
                              : 'bg-orange-200 text-black'
                          }`}>
                            {hasDocuments ? '✓' : '⚠'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md line-clamp-2">
                          {payload.leadInfo?.canHelpComment || 'No lead question provided'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {hasDocuments ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-green-700">
                                  {payload.documents.length} document{payload.documents.length !== 1 ? 's' : ''}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 text-black">
                                  Complete
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {payload.documents.slice(0, 3).map((doc, index) => (
                                  <a
                                    key={doc.id}
                                    href={doc.documentLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline px-2 py-1 bg-blue-50 rounded-md transition-colors"
                                    title={doc.documentLink}
                                  >
                                    📄 Doc {index + 1}
                                  </a>
                                ))}
                                {payload.documents.length > 3 && (
                                  <span className="text-xs text-gray-500 px-2 py-1 bg-gray-50 rounded-md">
                                    +{payload.documents.length - 3} more
                                  </span>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-orange-700">No documents submitted</span>
                              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-200 text-black">
                                Pending
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => setViewPayloadDetails(payload)}
                          className="px-4 py-2 h-[36px] bg-white text-gray-900 rounded-lg font-semibold text-xs transition-all shadow-md hover:shadow-lg hover:bg-gray-50 border-2 border-gray-200 flex items-center justify-center mx-auto"
                        >
                          View Full Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

export default SubmittedDetailsTable;

