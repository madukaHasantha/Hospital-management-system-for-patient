
const mysql = require('mysql');

//database connection
const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"exeve_assignment",
    connectionLimit:10
});


module.exports = db;