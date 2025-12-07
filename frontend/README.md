# Geronimo Data Collection Tool - Frontend

React frontend for the Geronimo Data Collection Tool. This application provides a user-friendly interface for managing payloads and their associated document links.

## Features

- **Add Payloads Tab**: 
  - Form-based input for adding payloads with all fields
  - JSON input option for bulk payload creation
  - Sample JSON template available
  
- **Document Links Tab**:
  - View all payloads with their document counts
  - Add Google Drive document links to payloads
  - Manage and delete document links
  - Expandable payload details view

## Prerequisites

- Node.js 18+ and npm
- Backend server running (see backend README)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - The `.env` file is already created with default backend URL
   - Update `VITE_API_BASE_URL` in `.env` if your backend runs on a different port/URL
   ```env
   VITE_API_BASE_URL=http://localhost:8083/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── AddPayloadTab.jsx      # Tab for adding payloads
│   │   └── DocumentLinksTab.jsx   # Tab for managing document links
│   ├── services/
│   │   └── api.js                 # API service layer
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── .env                           # Environment variables
└── package.json
```

## Usage

### Adding Payloads

1. Go to the "Add Payloads" tab
2. Choose between:
   - **Form Input**: Fill in all fields manually
   - **JSON Input**: Paste a JSON payload (use "Load Sample" for template)
3. Click "Add Payload" to submit

### Managing Document Links

1. Go to the "Document Links" tab
2. Select a payload from the dropdown
3. Enter a Google Drive document link
4. Click "Add Document Link"
5. View all documents for the selected payload
6. Delete documents using the "Delete" button

## API Integration

The frontend communicates with the backend REST API:
- `GET /api/payloads` - Get all payloads
- `POST /api/payloads` - Create new payload
- `GET /api/payloads/{id}/documents` - Get payload with documents
- `POST /api/documents` - Add document link
- `DELETE /api/documents/{id}` - Delete document link

## Technologies

- React 19
- Vite
- Tailwind CSS 4
- Fetch API for HTTP requests
