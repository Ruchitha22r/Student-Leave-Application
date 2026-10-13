const sqlite3 = require("sqlite3").verbose();
const path = require("path");


// ========================================
// DATABASE PATH
// ========================================
const fs = require("fs");

const dbFolder = path.join(__dirname, "database");

fs.mkdirSync(dbFolder, { recursive: true });

const dbPath = path.join(
    dbFolder,
    "leave_management.db"
);


// ========================================
// CONNECT TO DATABASE
// ========================================

const db = new sqlite3.Database(
    dbPath,
    (err) => {

        if (err) {

            console.error(
                "Database connection failed:",
                err.message
            );

        } else {

            console.log(
                "SQLite database connected successfully!"
            );

        }

    }
);


// ========================================
// CREATE STUDENTS TABLE
// ========================================

db.run(`
    CREATE TABLE IF NOT EXISTS students (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        student_id TEXT UNIQUE NOT NULL,

        name TEXT NOT NULL,

        email TEXT UNIQUE NOT NULL,

        password TEXT NOT NULL,

        department TEXT,

        status TEXT NOT NULL DEFAULT 'Pending',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    )
`, (err) => {

    if (err) {

        console.error(
            "Error creating students table:",
            err.message
        );

    } else {

        console.log(
            "Students table is ready!"
        );

    }

});




// STAFF ACCOUNTS: staff must also be approved before login.
db.run(`CREATE TABLE IF NOT EXISTS staff (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Migrate existing databases created before approval was added.
db.run("ALTER TABLE students ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
        console.error('Student status migration:', err.message);
    }
});


// ========================================
// CREATE LEAVE APPLICATIONS TABLE
// ========================================

db.run(`
    CREATE TABLE IF NOT EXISTS leave_applications (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        student_id TEXT NOT NULL,

        leave_type TEXT NOT NULL,

        start_date TEXT NOT NULL,

        end_date TEXT NOT NULL,

        reason TEXT NOT NULL,

        status TEXT DEFAULT 'Pending',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    )
`, (err) => {

    if (err) {

        console.error(
            "Error creating leave applications table:",
            err.message
        );

    } else {

        console.log(
            "Leave applications table is ready!"
        );

    }

});


// ========================================
// EXPORT DATABASE
// ========================================

module.exports = db;
