import ballerina/http;

// HTTP listener for the service with CORS enabled
listener http:Listener httpListener = check new (servicePort);

// CORS configuration
http:CorsConfig corsConfig = {
    allowOrigins: frontendUrls,
    allowCredentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"]
};

// REST API service for Geronimo data collection tool
@http:ServiceConfig {
    cors: corsConfig
}
service /api on httpListener {

    // Add a new payload
    resource function post payloads(@http:Payload Payload payload) returns Response|http:InternalServerError {
        int|error result = insertPayload(payload);
        
        if result is error {
            return <http:InternalServerError>{
                body: {
                    success: false,
                    message: "Failed to insert payload",
                    data: result.message()
                }
            };
        }
        
        return {
            success: true,
            message: "Payload added successfully",
            data: {id: result}
        };
    }

    // Get all payloads
    resource function get payloads() returns Response|http:InternalServerError {
        PayloadRecord[]|error payloads = getAllPayloads();
        
        if payloads is error {
            return <http:InternalServerError>{
                body: {
                    success: false,
                    message: "Failed to retrieve payloads",
                    data: payloads.message()
                }
            };
        }
        
        return {
            success: true,
            message: "Payloads retrieved successfully",
            data: payloads
        };
    }

    // Get a specific payload by ID
    resource function get payloads/[int payloadId]() returns Response|http:NotFound|http:InternalServerError {
        PayloadRecord|error payload = getPayloadById(payloadId);
        
        if payload is error {
            string errorMessage = payload.message();
            if errorMessage.includes("not found") {
                return <http:NotFound>{
                    body: {
                        success: false,
                        message: "Payload not found"
                    }
                };
            }
            
            return <http:InternalServerError>{
                body: {
                    success: false,
                    message: "Failed to retrieve payload",
                    data: errorMessage
                }
            };
        }
        
        return {
            success: true,
            message: "Payload retrieved successfully",
            data: payload
        };
    }

    // Get payload with all documents
    resource function get payloads/[int payloadId]/documents() returns Response|http:NotFound|http:InternalServerError {
        PayloadWithDocuments|error result = getPayloadWithDocuments(payloadId);
        
        if result is error {
            string errorMessage = result.message();
            if errorMessage.includes("not found") {
                return <http:NotFound>{
                    body: {
                        success: false,
                        message: "Payload not found"
                    }
                };
            }
            
            return <http:InternalServerError>{
                body: {
                    success: false,
                    message: "Failed to retrieve payload with documents",
                    data: errorMessage
                }
            };
        }
        
        return {
            success: true,
            message: "Payload with documents retrieved successfully",
            data: result
        };
    }

    // Get all payloads with documents
    resource function get payloads/all/documents() returns Response|http:InternalServerError {
        PayloadWithDocuments[]|error results = getAllPayloadsWithDocuments();
        
        if results is error {
            return <http:InternalServerError>{
                body: {
                    success: false,
                    message: "Failed to retrieve payloads with documents",
                    data: results.message()
                }
            };
        }
        
        return {
            success: true,
            message: "All payloads with documents retrieved successfully",
            data: results
        };
    }

    // Add a document link to a payload
    resource function post documents(@http:Payload AddDocumentRequest request) returns Response|http:InternalServerError {
        int|error result = insertDocument(request.payloadId, request.documentLink);
        
        if result is error {
            return <http:InternalServerError>{
                body: {
                    success: false,
                    message: "Failed to add document",
                    data: result.message()
                }
            };
        }
        
        return {
            success: true,
            message: "Document added successfully",
            data: {id: result}
        };
    }

    // Get documents for a specific payload
    resource function get documents/payload/[int payloadId]() returns Response|http:InternalServerError {
        DocumentRecord[]|error documents = getDocumentsByPayloadId(payloadId);
        
        if documents is error {
            return <http:InternalServerError>{
                body: {
                    success: false,
                    message: "Failed to retrieve documents",
                    data: documents.message()
                }
            };
        }
        
        return {
            success: true,
            message: "Documents retrieved successfully",
            data: documents
        };
    }

    // Delete a document
    resource function delete documents/[int documentId]() returns Response|http:InternalServerError {
        error? result = deleteDocument(documentId);
        
        if result is error {
            return <http:InternalServerError>{
                body: {
                    success: false,
                    message: "Failed to delete document",
                    data: result.message()
                }
            };
        }
        
        return {
            success: true,
            message: "Document deleted successfully"
        };
    }
}

