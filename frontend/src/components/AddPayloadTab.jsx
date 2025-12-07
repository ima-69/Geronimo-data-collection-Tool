import { useState } from 'react';
import { payloadAPI } from '../services/api';

function AddPayloadTab({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    emailInfo: {
      subject: '',
      from: '',
      to: [''],
      cc: [''],
    },
    leadInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      company: '',
      country: '',
      state: '',
      industry: '',
      areaOfInterest: '',
      contactReason: '',
      canHelpComment: '',
    },
  });
  
  // JSON input state
  const [jsonInput, setJsonInput] = useState('');

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleFormChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section, field, index, value) => {
    setFormData(prev => {
      const newArray = [...prev[section][field]];
      newArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: newArray,
        },
      };
    });
  };

  const addArrayItem = (section, field) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: [...prev[section][field], ''],
      },
    }));
  };

  const removeArrayItem = (section, field, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].filter((_, i) => i !== index),
      },
    }));
  };

  const validatePayload = (payload) => {
    if (!payload.emailInfo || !payload.leadInfo) {
      return 'Invalid payload structure. Must have emailInfo and leadInfo.';
    }
    if (!payload.emailInfo.subject || !payload.emailInfo.from) {
      return 'Email subject and from are required.';
    }
    if (!Array.isArray(payload.emailInfo.to) || payload.emailInfo.to.length === 0) {
      return 'At least one "to" email is required.';
    }
    return null;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Clean up empty array items
      const cleanedData = {
        emailInfo: {
          ...formData.emailInfo,
          to: formData.emailInfo.to.filter(email => email.trim() !== ''),
          cc: formData.emailInfo.cc.filter(email => email.trim() !== ''),
        },
        leadInfo: formData.leadInfo,
      };

      const error = validatePayload(cleanedData);
      if (error) {
        showMessage('error', error);
        setLoading(false);
        return;
      }

      const response = await payloadAPI.create(cleanedData);
      showMessage('success', `Payload added successfully! ID: ${response.data.id}`);
      
      // Reset form
      setFormData({
        emailInfo: {
          subject: '',
          from: '',
          to: [''],
          cc: [''],
        },
        leadInfo: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          jobTitle: '',
          company: '',
          country: '',
          state: '',
          industry: '',
          areaOfInterest: '',
          contactReason: '',
          canHelpComment: '',
        },
      });
    } catch (error) {
      showMessage('error', error.message || 'Failed to add payload');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = JSON.parse(jsonInput);
      const error = validatePayload(payload);
      if (error) {
        showMessage('error', error);
        setLoading(false);
        return;
      }

      const response = await payloadAPI.create(payload);
      showMessage('success', `Payload added successfully! ID: ${response.data.id}`);
      setJsonInput('');
    } catch (error) {
      if (error instanceof SyntaxError) {
        showMessage('error', 'Invalid JSON format');
      } else {
        showMessage('error', error.message || 'Failed to add payload');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSampleJson = () => {
    const sample = {
      "emailInfo": {
        "subject": "Geronimo Test - API Management Inquiry",
        "from": "noreply-emali-service-v2-stg@wso2.com",
        "to": ["your-email@example.com"],
        "cc": []
      },
      "leadInfo": {
        "firstName": "",
        "lastName": "",
        "email": "",
        "phone": "",
        "jobTitle": "",
        "company": "",
        "country": "",
        "state": "",
        "industry": "",
        "areaOfInterest": "",
        "contactReason": "",
        "canHelpComment": ""
      }
    };
    setJsonInput(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Add Payloads</h2>
          <p className="text-gray-600">Add new payloads using form fields or JSON input</p>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('documents')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            Go to Document Submission
          </button>
        )}
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-2 border-green-200'
              : 'bg-red-50 text-red-800 border-2 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Form Input */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Form Input</h3>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Email Info Section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Email Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emailInfo.subject}
                    onChange={(e) => handleFormChange('emailInfo', 'subject', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    From <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.emailInfo.from}
                    onChange={(e) => handleFormChange('emailInfo', 'from', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    To Emails <span className="text-red-500">*</span>
                  </label>
                  {formData.emailInfo.to.map((email, index) => (
                    <div key={index} className="flex gap-1 mb-1">
                      <input
                        type="email"
                        required={index === 0}
                        value={email}
                        onChange={(e) => handleArrayChange('emailInfo', 'to', index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="email@example.com"
                      />
                      {formData.emailInfo.to.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('emailInfo', 'to', index)}
                          className="px-2 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('emailInfo', 'to')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    + Add Email
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    CC Emails
                  </label>
                  {formData.emailInfo.cc.map((email, index) => (
                    <div key={index} className="flex gap-1 mb-1">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleArrayChange('emailInfo', 'cc', index, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="email@example.com"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('emailInfo', 'cc', index)}
                        className="px-2 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('emailInfo', 'cc')}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    + Add CC Email
                  </button>
                </div>
              </div>
            </div>

            {/* Lead Info Section */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Lead Information</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.firstName}
                    onChange={(e) => handleFormChange('leadInfo', 'firstName', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.lastName}
                    onChange={(e) => handleFormChange('leadInfo', 'lastName', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.leadInfo.email}
                    onChange={(e) => handleFormChange('leadInfo', 'email', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.leadInfo.phone}
                    onChange={(e) => handleFormChange('leadInfo', 'phone', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.jobTitle}
                    onChange={(e) => handleFormChange('leadInfo', 'jobTitle', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.company}
                    onChange={(e) => handleFormChange('leadInfo', 'company', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.country}
                    onChange={(e) => handleFormChange('leadInfo', 'country', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.state}
                    onChange={(e) => handleFormChange('leadInfo', 'state', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.industry}
                    onChange={(e) => handleFormChange('leadInfo', 'industry', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Area of Interest
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.areaOfInterest}
                    onChange={(e) => handleFormChange('leadInfo', 'areaOfInterest', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Contact Reason
                  </label>
                  <input
                    type="text"
                    value={formData.leadInfo.contactReason}
                    onChange={(e) => handleFormChange('leadInfo', 'contactReason', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Can Help Comment
                  </label>
                  <textarea
                    value={formData.leadInfo.canHelpComment}
                    onChange={(e) => handleFormChange('leadInfo', 'canHelpComment', e.target.value)}
                    rows="3"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter help comment..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              {loading ? 'Adding...' : 'Add Payload'}
            </button>
          </form>
        </div>

        {/* Right Column - JSON Input */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">JSON Input</h3>
            <button
              type="button"
              onClick={loadSampleJson}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium"
            >
              Load Sample
            </button>
          </div>
          <form onSubmit={handleJsonSubmit} className="space-y-4">
            <div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows="25"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                placeholder='{"emailInfo": {...}, "leadInfo": {...}}'
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              {loading ? 'Adding...' : 'Add Payload from JSON'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddPayloadTab;
