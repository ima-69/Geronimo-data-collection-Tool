// Record types for the Geronimo data collection tool

// Email information structure
type EmailInfo record {|
    string subject;
    string 'from;
    string[] to;
    string[] cc;
|};

// Lead information structure
type LeadInfo record {|
    string firstName;
    string lastName;
    string email;
    string phone;
    string jobTitle;
    string company;
    string country;
    string state;
    string industry;
    string areaOfInterest;
    string contactReason;
    string canHelpComment;
|};

// Complete payload structure
type Payload record {|
    EmailInfo emailInfo;
    LeadInfo leadInfo;
|};

// Payload with ID (from database)
type PayloadRecord record {|
    int id;
    string subject;
    string 'from;
    string[] to;
    string[] cc;
    string firstName;
    string lastName;
    string email;
    string phone;
    string jobTitle;
    string company;
    string country;
    string state;
    string industry;
    string areaOfInterest;
    string contactReason;
    string canHelpComment;
    string createdAt?;
|};

// Document link structure
type Document record {|
    string documentLink;
|};

// Document with ID (from database)
type DocumentRecord record {|
    int id;
    int payloadId;
    string documentLink;
    string createdAt?;
|};

// Response structure for payload with documents
type PayloadWithDocuments record {|
    int id;
    EmailInfo emailInfo;
    LeadInfo leadInfo;
    DocumentRecord[] documents;
    string createdAt?;
|};

// Request to add document
type AddDocumentRequest record {|
    int payloadId;
    string documentLink;
|};

// Generic response
type Response record {|
    boolean success;
    string message;
    anydata data?;
|};



