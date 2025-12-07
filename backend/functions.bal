import ballerina/sql;
import ballerina/lang.'value;

// Insert a new payload into the database
function insertPayload(Payload payload) returns int|error {
    EmailInfo emailInfo = payload.emailInfo;
    LeadInfo leadInfo = payload.leadInfo;
    
    // Convert arrays to JSON strings for MySQL
    json toEmailsJson = emailInfo.to;
    json ccEmailsJson = emailInfo.cc;
    string toEmailsStr = value:toJsonString(toEmailsJson);
    string ccEmailsStr = value:toJsonString(ccEmailsJson);
    
    sql:ParameterizedQuery query = `INSERT INTO payloads (
            subject, from_email, to_emails, cc_emails,
            first_name, last_name, email, phone,
            job_title, company, country, state,
            industry, area_of_interest, contact_reason, can_help_comment
        ) VALUES (
            ${emailInfo.subject}, ${emailInfo.'from}, ${toEmailsStr}, ${ccEmailsStr},
            ${leadInfo.firstName}, ${leadInfo.lastName}, ${leadInfo.email}, ${leadInfo.phone},
            ${leadInfo.jobTitle}, ${leadInfo.company}, ${leadInfo.country}, ${leadInfo.state},
            ${leadInfo.industry}, ${leadInfo.areaOfInterest}, ${leadInfo.contactReason}, ${leadInfo.canHelpComment}
        )`;
    
    sql:ExecutionResult result = check dbClient->execute(query);
    int payloadId = <int>result.lastInsertId;
    return payloadId;
}

// Get all payloads
function getAllPayloads() returns PayloadRecord[]|error {
    sql:ParameterizedQuery query = `SELECT 
            id, 
            subject, 
            from_email, 
            to_emails, 
            cc_emails,
            first_name, 
            last_name, 
            email, 
            phone,
            job_title, 
            company, 
            country, 
            state,
            industry, 
            area_of_interest, 
            contact_reason, 
            can_help_comment,
            created_at
        FROM payloads
        ORDER BY id DESC`;
    
    stream<record {}, error?> payloadStream = dbClient->query(query);
    PayloadRecord[] payloads = [];
    
    error? e = payloadStream.forEach(function(record {} row) {
        string[] toEmails = [];
        string[] ccEmails = [];
        json|error toParsed = value:fromJsonString(<string>row["to_emails"]);
        json|error ccParsed = value:fromJsonString(<string>row["cc_emails"]);
        if toParsed is json[] {
            foreach json item in toParsed {
                toEmails.push(<string>item);
            }
        }
        if ccParsed is json[] {
            foreach json item in ccParsed {
                ccEmails.push(<string>item);
            }
        }
        PayloadRecord payload = {
            id: <int>row["id"],
            subject: <string>row["subject"],
            'from: <string>row["from_email"],
            to: toEmails,
            cc: ccEmails,
            firstName: <string>row["first_name"],
            lastName: <string>row["last_name"],
            email: <string>row["email"],
            phone: <string>row["phone"],
            jobTitle: <string>row["job_title"],
            company: <string>row["company"],
            country: <string>row["country"],
            state: <string>row["state"],
            industry: <string>row["industry"],
            areaOfInterest: <string>row["area_of_interest"],
            contactReason: <string>row["contact_reason"],
            canHelpComment: <string>row["can_help_comment"],
            createdAt: row["created_at"] is string ? <string>row["created_at"] : ()
        };
        payloads.push(payload);
    });
    check e;
    check payloadStream.close();
    
    return payloads;
}

// Get a single payload by ID
function getPayloadById(int payloadId) returns PayloadRecord|error {
    sql:ParameterizedQuery query = `SELECT 
            id, 
            subject, 
            from_email, 
            to_emails, 
            cc_emails,
            first_name, 
            last_name, 
            email, 
            phone,
            job_title, 
            company, 
            country, 
            state,
            industry, 
            area_of_interest, 
            contact_reason, 
            can_help_comment,
            created_at
        FROM payloads
        WHERE id = ${payloadId}`;
    
    record {}? row = check dbClient->queryRow(query);
    if row is record {} {
        string[] toEmails = [];
        string[] ccEmails = [];
        json|error toParsed = value:fromJsonString(<string>row["to_emails"]);
        json|error ccParsed = value:fromJsonString(<string>row["cc_emails"]);
        if toParsed is json[] {
            foreach json item in toParsed {
                toEmails.push(<string>item);
            }
        }
        if ccParsed is json[] {
            foreach json item in ccParsed {
                ccEmails.push(<string>item);
            }
        }
        PayloadRecord payload = {
            id: <int>row["id"],
            subject: <string>row["subject"],
            'from: <string>row["from_email"],
            to: toEmails,
            cc: ccEmails,
            firstName: <string>row["first_name"],
            lastName: <string>row["last_name"],
            email: <string>row["email"],
            phone: <string>row["phone"],
            jobTitle: <string>row["job_title"],
            company: <string>row["company"],
            country: <string>row["country"],
            state: <string>row["state"],
            industry: <string>row["industry"],
            areaOfInterest: <string>row["area_of_interest"],
            contactReason: <string>row["contact_reason"],
            canHelpComment: <string>row["can_help_comment"],
            createdAt: row["created_at"] is string ? <string>row["created_at"] : ()
        };
        return payload;
    } else {
        return error("Payload not found");
    }
}

// Get payload with all associated documents
function getPayloadWithDocuments(int payloadId) returns PayloadWithDocuments|error {
    PayloadRecord payloadRecord = check getPayloadById(payloadId);
    DocumentRecord[] documents = check getDocumentsByPayloadId(payloadId);
    
    EmailInfo emailInfo = {
        subject: payloadRecord.subject,
        'from: payloadRecord.'from,
        to: payloadRecord.to,
        cc: payloadRecord.cc
    };
    
    LeadInfo leadInfo = {
        firstName: payloadRecord.firstName,
        lastName: payloadRecord.lastName,
        email: payloadRecord.email,
        phone: payloadRecord.phone,
        jobTitle: payloadRecord.jobTitle,
        company: payloadRecord.company,
        country: payloadRecord.country,
        state: payloadRecord.state,
        industry: payloadRecord.industry,
        areaOfInterest: payloadRecord.areaOfInterest,
        contactReason: payloadRecord.contactReason,
        canHelpComment: payloadRecord.canHelpComment
    };
    
    PayloadWithDocuments result = {
        id: payloadRecord.id,
        emailInfo: emailInfo,
        leadInfo: leadInfo,
        documents: documents,
        createdAt: payloadRecord.createdAt
    };
    
    return result;
}

// Insert a document link for a payload
function insertDocument(int payloadId, string documentLink) returns int|error {
    sql:ParameterizedQuery query = `INSERT INTO documents (payload_id, document_link)
        VALUES (${payloadId}, ${documentLink})`;
    
    sql:ExecutionResult result = check dbClient->execute(query);
    int documentId = <int>result.lastInsertId;
    return documentId;
}

// Get all documents for a specific payload
function getDocumentsByPayloadId(int payloadId) returns DocumentRecord[]|error {
    sql:ParameterizedQuery query = `SELECT 
            id, 
            payload_id, 
            document_link,
            created_at
        FROM documents
        WHERE payload_id = ${payloadId}
        ORDER BY id ASC`;
    
    stream<record {}, error?> documentStream = dbClient->query(query);
    DocumentRecord[] documents = [];
    
    error? e = documentStream.forEach(function(record {} row) {
        DocumentRecord doc = {
            id: <int>row["id"],
            payloadId: <int>row["payload_id"],
            documentLink: <string>row["document_link"],
            createdAt: row["created_at"] is string ? <string>row["created_at"] : ()
        };
        documents.push(doc);
    });
    check e;
    check documentStream.close();
    
    return documents;
}

// Delete a document by ID
function deleteDocument(int documentId) returns error? {
    sql:ParameterizedQuery query = `DELETE FROM documents
        WHERE id = ${documentId}`;
    
    _ = check dbClient->execute(query);
}

// Get all payloads with their documents
function getAllPayloadsWithDocuments() returns PayloadWithDocuments[]|error {
    PayloadRecord[] payloads = check getAllPayloads();
    PayloadWithDocuments[] results = [];
    
    foreach PayloadRecord payloadRecord in payloads {
        PayloadWithDocuments payloadWithDocs = check getPayloadWithDocuments(payloadRecord.id);
        results.push(payloadWithDocs);
    }
    
    return results;
}
