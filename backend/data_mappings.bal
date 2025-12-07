// Database schema initialization SQL
// Run these SQL commands in your MySQL database before starting the application

// Create database (if not exists)
// CREATE DATABASE IF NOT EXISTS datacollection;
// USE datacollection;

// Create payloads table
// CREATE TABLE IF NOT EXISTS payloads (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     subject VARCHAR(500) NOT NULL,
//     from_email VARCHAR(255) NOT NULL,
//     to_emails JSON NOT NULL,
//     cc_emails JSON NOT NULL,
//     first_name VARCHAR(255) NOT NULL DEFAULT '',
//     last_name VARCHAR(255) NOT NULL DEFAULT '',
//     email VARCHAR(255) NOT NULL DEFAULT '',
//     phone VARCHAR(50) NOT NULL DEFAULT '',
//     job_title VARCHAR(255) NOT NULL DEFAULT '',
//     company VARCHAR(255) NOT NULL DEFAULT '',
//     country VARCHAR(100) NOT NULL DEFAULT '',
//     state VARCHAR(100) NOT NULL DEFAULT '',
//     industry VARCHAR(255) NOT NULL DEFAULT '',
//     area_of_interest VARCHAR(255) NOT NULL DEFAULT '',
//     contact_reason VARCHAR(255) NOT NULL DEFAULT '',
//     can_help_comment TEXT NOT NULL DEFAULT '',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// Create documents table
// CREATE TABLE IF NOT EXISTS documents (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     payload_id INT NOT NULL,
//     document_link TEXT NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     FOREIGN KEY (payload_id) REFERENCES payloads(id) ON DELETE CASCADE,
//     INDEX idx_payload_id (payload_id)
// );

