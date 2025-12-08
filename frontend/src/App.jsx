import { useState } from 'react';
import AddPayloadTab from './components/AddPayloadTab';
import DocumentLinksTab from './components/DocumentLinksTab';
import SubmittedDetailsTable from './components/SubmittedDetailsTable';

const apiUrls = window?.configs?.apiUrl;

function App() {
  const [activeTab, setActiveTab] = useState('documents');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Geronimo Data Collection Tool</h1>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 justify-between items-center">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('documents')}
                className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === 'documents'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Document Submission
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === 'submitted'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Submitted Details
              </button>
            </div>
            <button
              onClick={() => setActiveTab('payloads')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'payloads'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Payloads
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        {activeTab === 'payloads' && <AddPayloadTab onNavigate={setActiveTab} />}
        {activeTab === 'documents' && <DocumentLinksTab />}
        {activeTab === 'submitted' && <SubmittedDetailsTable />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          Geronimo Data Collection Tool © 2025
        </div>
      </footer>
    </div>
  );
}

export default App;
