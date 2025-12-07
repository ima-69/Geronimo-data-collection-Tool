# Geronimo Data Collection Tool - Backend

Ballerina backend for the Geronimo Data Collection Tool. This backend provides REST API endpoints for managing payloads and their associated document links.

## Prerequisites

- Ballerina 2201.12.9 or later
- MySQL 8.0 or later
- Java 11 or later

## Setup

### 1. Database Setup

1. Create the MySQL database and tables by running:
   ```bash
   mysql -u root -p < schema.sql
   ```

2. Update the database configuration in `Config.toml`:
   ```toml
   dbHost = "localhost"
   dbPort = 3306
   dbName = "datacollection"
   dbUser = "root"
   dbPassword = "your_password"
   ```

### 2. Build the Project

```bash
bal build
```

### 3. Run the Backend

```bash
bal run
```

The server will start on port 8080 (configurable in `Config.toml`).

## API Endpoints

### Payloads

- `POST /api/payloads` - Add a new payload
- `GET /api/payloads` - Get all payloads
- `GET /api/payloads/{id}` - Get a specific payload by ID
- `GET /api/payloads/{id}/documents` - Get payload with all documents
- `GET /api/payloads/all/documents` - Get all payloads with documents

### Documents

- `POST /api/documents` - Add a document link to a payload
- `GET /api/documents/payload/{payloadId}` - Get all documents for a payload
- `DELETE /api/documents/{id}` - Delete a document

## Project Structure

```
backend/
├── Ballerina.toml      # Project configuration
├── Config.toml          # Runtime configuration (not committed)
├── schema.sql          # Database schema
├── config.bal          # Configurable variables
├── types.bal           # Type definitions
├── connections.bal     # Database connection
├── functions.bal       # Database operations
├── main.bal            # REST API service
└── data_mappings.bal   # Database schema documentation
```

## Payload Structure

```json
{
  "emailInfo": {
    "subject": "string",
    "from": "string",
    "to": ["string"],
    "cc": ["string"]
  },
  "leadInfo": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "jobTitle": "string",
    "company": "string",
    "country": "string",
    "state": "string",
    "industry": "string",
    "areaOfInterest": "string",
    "contactReason": "string",
    "canHelpComment": "string"
  }
}
```

## CORS Configuration

CORS is enabled for the following origins:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (React default)

Update the CORS configuration in `main.bal` if needed.

