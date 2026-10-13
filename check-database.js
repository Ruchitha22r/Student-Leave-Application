const db = require("./database");


// ========================================
// CHECK STUDENTS
// ========================================

db.all(
    "SELECT * FROM students",
    [],
    (err, rows) => {

        if (err) {

            console.error(
                "Database error:",
                err.message
            );

            return;

        }


        console.log(
            "Students in database:"
        );


        console.table(rows);


        db.close();

    }
);