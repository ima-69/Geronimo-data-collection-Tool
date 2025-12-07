import ballerinax/mysql;

// MySQL database client
final mysql:Client dbClient = check new (
    host = dbHost,
    port = dbPort,
    database = dbName,
    user = dbUser,
    password = dbPassword
);

