const db = require("./database");


// ========================================
// CHECK LEAVE APPLICATIONS
// ========================================

db.all(
    "SELECT * FROM leave_applications",
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
            "Leave applications in database:"
        );


        console.table(rows);


        db.close();

    }
);