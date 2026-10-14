
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Temporary staff tokens expire after 8 hours.
// Tokens are cleared when the server restarts.
const staffTokens = new Map();
const TOKEN_LIFETIME = 8 * 60 * 60 * 1000;

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Verify that a request comes from an approved staff account.
function requireApprovedStaff(req, res, next) {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : "";

    const session = staffTokens.get(token);

    if (!session || session.expiresAt <= Date.now()) {
        staffTokens.delete(token);
        return res.status(401).json({
            success: false,
            message: "Please log in as staff again."
        });
    }

    db.get(
        "SELECT id, status FROM staff WHERE id = ?",
        [session.staffDbId],
        (err, staff) => {
            if (err) {
                console.error("Staff verification error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to verify staff account."
                });
            }

            if (!staff || staff.status !== "Approved") {
                staffTokens.delete(token);
                return res.status(403).json({
                    success: false,
                    message: "An approved staff account is required."
                });
            }

            req.staff = staff;
            next();
        }
    );
}

// ========================================
// STUDENT REGISTRATION
// ========================================

app.post("/api/register", (req, res) => {
    const { studentId, name, email, password, department } = req.body;

    if (!studentId || !name || !email || !password || !department) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    const sql = `
        INSERT INTO students
        (student_id, name, email, password, department, status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
    `;

    db.run(sql, [studentId, name, email, password, department],
        function (err) {
            if (err) {
                console.error("Registration error:", err.message);
                const duplicate = err.message.includes(
                    "UNIQUE constraint failed"
                );

                return res.status(duplicate ? 400 : 500).json({
                    success: false,
                    message: duplicate
                        ? "Student ID or Email already exists."
                        : "Registration failed."
                });
            }

            res.json({
                success: true,
                message: "Registration successful!",
                studentId: this.lastID
            });
        }
    );
});

// ========================================
// STUDENT LOGIN
// ========================================

app.post("/api/login", (req, res) => {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
        return res.status(400).json({
            success: false,
            message: "Student ID and Password are required."
        });
    }

    const sql = `
        SELECT id, student_id, name, email, department, status
        FROM students
        WHERE student_id = ? AND password = ?
    `;

    db.get(sql, [studentId, password], (err, student) => {
        if (err) {
            console.error("Login error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Login failed."
            });
        }

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid Student ID or Password."
            });
        }

        if (student.status !== "Approved") {
            return res.status(403).json({
                success: false,
                message: student.status === "Rejected"
                    ? "Your registration was rejected. Please contact the administrator."
                    : "Your account is awaiting admin approval."
            });
        }

        res.json({
            success: true,
            message: "Login successful!",
            student
        });
    });
});

// ========================================
// STAFF REGISTRATION
// ========================================

app.post("/api/staff/register", (req, res) => {
    const { staffId, name, email, password, department } = req.body;

    if (!staffId || !name || !email || !password || !department) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    db.run(
        `INSERT INTO staff
        (staff_id, name, email, password, department, status)
        VALUES (?, ?, ?, ?, ?, 'Pending')`,
        [staffId, name, email, password, department],
        function (err) {
            if (err) {
                console.error("Staff registration error:", err.message);
                const duplicate = err.message.includes(
                    "UNIQUE constraint failed"
                );

                return res.status(duplicate ? 400 : 500).json({
                    success: false,
                    message: duplicate
                        ? "Staff ID or email already exists."
                        : "Staff registration failed."
                });
            }

            res.json({
                success: true,
                message: "Registration submitted. Please wait for admin approval."
            });
        }
    );
});

// ========================================
// STAFF LOGIN
// ========================================

app.post("/api/staff/login", (req, res) => {
    const { staffId, password } = req.body;

    if (!staffId || !password) {
        return res.status(400).json({
            success: false,
            message: "Staff ID and password are required."
        });
    }

    db.get(
        `SELECT id, staff_id, name, email, department, status
         FROM staff WHERE staff_id = ? AND password = ?`,
        [staffId, password],
        (err, staff) => {
            if (err) {
                console.error("Staff login error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Login failed."
                });
            }

            if (!staff) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid Staff ID or password."
                });
            }

            if (staff.status !== "Approved") {
                return res.status(403).json({
                    success: false,
                    message: staff.status === "Rejected"
                        ? "Your registration was rejected. Please contact the administrator."
                        : "Your account is awaiting admin approval."
                });
            }

            const token = crypto.randomBytes(32).toString("hex");

            staffTokens.set(token, {
                staffDbId: staff.id,
                expiresAt: Date.now() + TOKEN_LIFETIME
            });

            res.json({
                success: true,
                message: "Login successful!",
                staff,
                token
            });
        }
    );
});

// ========================================
// STAFF LOGOUT
// ========================================

app.post("/api/staff/logout", requireApprovedStaff, (req, res) => {
    const token = req.headers.authorization.slice(7);
    staffTokens.delete(token);

    res.json({
        success: true,
        message: "Logged out successfully."
    });
});

// ========================================
// ADMIN - REGISTRATION QUEUE
// ========================================

app.get("/api/admin/registrations", (req, res) => {
    const sql = `
        SELECT id, student_id AS user_id, name, email, department,
               status, created_at, 'student' AS role
        FROM students
        UNION ALL
        SELECT id, staff_id AS user_id, name, email, department,
               status, created_at, 'staff' AS role
        FROM staff
        ORDER BY created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Registration queue error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Unable to load registrations."
            });
        }

        res.json({ success: true, registrations: rows });
    });
});

app.patch("/api/admin/registrations/:role/:id", (req, res) => {
    const { role, id } = req.params;
    const { status } = req.body;

    if (
        !["student", "staff"].includes(role) ||
        !["Approved", "Rejected", "Pending"].includes(status)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid role or status."
        });
    }

    const table = role === "student" ? "students" : "staff";

    db.run(
        `UPDATE ${table} SET status = ? WHERE id = ?`,
        [status, id],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to update registration."
                });
            }

            if (!this.changes) {
                return res.status(404).json({
                    success: false,
                    message: "Registration not found."
                });
            }

            // Invalidate existing tokens if a staff account is changed.
            if (role === "staff" && status !== "Approved") {
                for (const [token, session] of staffTokens) {
                    if (String(session.staffDbId) === String(id)) {
                        staffTokens.delete(token);
                    }
                }
            }

            res.json({
                success: true,
                message: `Registration ${status.toLowerCase()}.`
            });
        }
    );
});

// ========================================
// APPLY FOR LEAVE
// ========================================

app.post("/api/leave", (req, res) => {
    const { studentId, leaveType, startDate, endDate, reason } = req.body;

    if (!studentId || !leaveType || !startDate || !endDate || !reason) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all leave fields."
        });
    }

    const sql = `
        INSERT INTO leave_applications
        (student_id, leave_type, start_date, end_date, reason)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [studentId, leaveType, startDate, endDate, reason],
        function (err) {
            if (err) {
                console.error("Leave application error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Unable to submit leave application."
                });
            }

            res.json({
                success: true,
                message: "Leave application submitted successfully!",
                applicationId: this.lastID
            });
        }
    );
});

// ========================================
// STUDENT LEAVE HISTORY
// ========================================

app.get("/api/leave-history/:studentId", (req, res) => {
    const sql = `
        SELECT id, student_id, leave_type, start_date, end_date,
               reason, status, created_at
        FROM leave_applications
        WHERE student_id = ?
        ORDER BY created_at DESC
    `;

    db.all(sql, [req.params.studentId], (err, rows) => {
        if (err) {
            console.error("Leave history error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Unable to load leave history."
            });
        }

        res.json({ success: true, applications: rows });
    });
});

// ========================================
// ADMIN - GET ALL LEAVE APPLICATIONS
// ========================================

app.get("/api/admin/leave-applications", (req, res) => {
    const sql = `
        SELECT id, student_id, leave_type, start_date, end_date,
               reason, status, created_at
        FROM leave_applications
        ORDER BY created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Admin applications error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Unable to load leave applications."
            });
        }

        res.json({ success: true, applications: rows });
    });
});

// ========================================
// STAFF - GET LEAVE APPLICATIONS
// ========================================

app.get(
    "/api/staff/leave-applications",
    requireApprovedStaff,
    (req, res) => {
        const sql = `
            SELECT id, student_id, leave_type, start_date, end_date,
                   reason, status, created_at
            FROM leave_applications
            ORDER BY created_at DESC
        `;

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Staff applications error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Unable to load leave applications."
                });
            }

            res.json({ success: true, applications: rows });
        });
    }
);

// ========================================
// STAFF - APPROVE OR REJECT LEAVE
// ========================================

app.put(
    "/api/staff/leave-applications/:id/status",
    requireApprovedStaff,
    (req, res) => {
        const applicationId = Number(req.params.id);
        const { status } = req.body;

        if (!Number.isInteger(applicationId) || applicationId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid application ID."
            });
        }

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be Approved or Rejected."
            });
        }

        db.run(
            `UPDATE leave_applications SET status = ? WHERE id = ?`,
            [status, applicationId],
            function (err) {
                if (err) {
                    console.error("Staff status update error:", err.message);
                    return res.status(500).json({
                        success: false,
                        message: "Unable to update leave status."
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Leave application not found."
                    });
                }

                res.json({
                    success: true,
                    message: `Leave application ${status.toLowerCase()} successfully.`
                });
            }
        );
    }
);

// ========================================
// ADMIN - UPDATE LEAVE STATUS
// ========================================

app.put("/api/admin/leave-applications/:id/status", (req, res) => {
    const applicationId = Number(req.params.id);
    const { status } = req.body;

    if (
        !Number.isInteger(applicationId) ||
        applicationId <= 0 ||
        !["Approved", "Rejected"].includes(status)
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid application ID or status."
        });
    }

    db.run(
        "UPDATE leave_applications SET status = ? WHERE id = ?",
        [status, applicationId],
        function (err) {
            if (err) {
                console.error("Admin status update error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Unable to update leave status."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Leave application not found."
                });
            }

            res.json({
                success: true,
                message: `Leave application ${status.toLowerCase()} successfully.`
            });
        }
    );
});

// ========================================
// ADMIN - GET ALL REGISTERED STUDENTS
// ========================================

app.get("/api/admin/students", (req, res) => {
    const sql = `
        SELECT id, student_id, name, email, department, status, created_at
        FROM students
        ORDER BY created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error fetching students:", err.message);
            return res.status(500).json({
                success: false,
                message: "Unable to load students."
            });
        }

        res.json({ success: true, students: rows });
    });
});

// ========================================
// HOME PAGE
// ========================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
