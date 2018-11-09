const mysql = require('mysql');

let db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
  
db.connect(function (err) {
    if (err) throw err;
    else {
        console.log('Connected to MySql');
    }
});

global.db = db;
