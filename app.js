document.addEventListener("DOMContentLoaded", function () {


    // ========================================
    // STUDENT LOGIN
    // ========================================

    const studentLoginForm =
        document.getElementById("loginForm");


    if (studentLoginForm) {

        studentLoginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const studentId =
                    document.getElementById("studentId").value.trim();

                const password =
                    document.getElementById("password").value.trim();


                if (!studentId || !password) {

                    alert(
                        "Please enter Student ID and Password."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch("/api/login", {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                studentId:
                                    studentId,

                                password:
                                    password

                            })

                        });


                    const data =
                        await response.json();


                    if (data.success) {

                        localStorage.setItem(
                            "student",
                            JSON.stringify(data.student)
                        );


                        alert(
                            "Login successful!"
                        );


                        window.location.href =
                            "/dashboard.html";

                    } else {

                        alert(
                            data.message
                        );

                    }

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to connect to server."
                    );

                }

            }
        );

    }


    // ========================================
    // STUDENT REGISTRATION
    // ========================================

    const registerForm =
        document.getElementById("registerForm");


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const studentId =
                    document.getElementById("studentId").value.trim();

                const name =
                    document.getElementById("name").value.trim();

                const email =
                    document.getElementById("email").value.trim();

                const department =
                    document.getElementById("department").value.trim();

                const password =
                    document.getElementById("password").value.trim();


                if (
                    !studentId ||
                    !name ||
                    !email ||
                    !department ||
                    !password
                ) {

                    alert(
                        "Please fill in all fields."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch("/api/register", {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                studentId:
                                    studentId,

                                name:
                                    name,

                                email:
                                    email,

                                department:
                                    department,

                                password:
                                    password

                            })

                        });


                    const data =
                        await response.json();


                    if (data.success) {

                        alert(
                            "Registration submitted. Please wait for admin approval before logging in."
                        );


                        window.location.href =
                            "/student-login.html";

                    } else {

                        alert(
                            data.message
                        );

                    }

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to connect to server."
                    );

                }

            }
        );

    }


    // ========================================
    // STUDENT DASHBOARD
    // ========================================

    const studentName =
        document.getElementById("studentName");


    const studentDepartment =
        document.getElementById("studentDepartment");


    const savedStudent =
        localStorage.getItem("student");


    if (
        savedStudent &&
        (studentName || studentDepartment)
    ) {

        const student =
            JSON.parse(savedStudent);


        if (studentName) {

            studentName.textContent =
                student.name;

        }


        if (studentDepartment) {

            studentDepartment.textContent =
                student.department;

        }

    }


    // ========================================
    // APPLY LEAVE BUTTON
    // ========================================

    const applyLeaveButton =
        document.getElementById("applyLeaveButton");


    if (applyLeaveButton) {

        applyLeaveButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/apply-leave.html";

            }
        );

    }


    // ========================================
    // LEAVE HISTORY BUTTON
    // ========================================

    const leaveHistoryButton =
        document.getElementById(
            "leaveHistoryButton"
        );


    if (leaveHistoryButton) {

        leaveHistoryButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/leave-history.html";

            }
        );

    }


    // ========================================
    // STUDENT LOGOUT
    // ========================================

    const logoutButton =
        document.getElementById("logoutButton");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "student"
                );


                window.location.href =
                    "/student-login.html";

            }
        );

    }


    // ========================================
    // APPLY LEAVE FORM
    // ========================================

    const leaveForm =
        document.getElementById("leaveForm");


    if (leaveForm) {

        leaveForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const student =
                    JSON.parse(
                        localStorage.getItem("student")
                    );


                if (!student) {

                    alert(
                        "Please login first."
                    );

                    window.location.href =
                        "/student-login.html";

                    return;

                }


                const leaveType =
                    document.getElementById(
                        "leaveType"
                    ).value;


                const startDate =
                    document.getElementById(
                        "startDate"
                    ).value;


                const endDate =
                    document.getElementById(
                        "endDate"
                    ).value;


                const reason =
                    document.getElementById(
                        "reason"
                    ).value.trim();


                if (
                    !leaveType ||
                    !startDate ||
                    !endDate ||
                    !reason
                ) {

                    alert(
                        "Please fill in all leave fields."
                    );

                    return;

                }


                if (endDate < startDate) {

                    alert(
                        "End date cannot be before start date."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch("/api/leave", {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                studentId:
                                    student.student_id,

                                leaveType:
                                    leaveType,

                                startDate:
                                    startDate,

                                endDate:
                                    endDate,

                                reason:
                                    reason

                            })

                        });


                    const data =
                        await response.json();


                    if (data.success) {

                        alert(
                            "Leave application submitted successfully!"
                        );


                        window.location.href =
                            "/leave-history.html";

                    } else {

                        alert(
                            data.message
                        );

                    }

                } catch (error) {

                    console.error(error);

                    alert(
                        "Unable to submit leave application."
                    );

                }

            }
        );

    }


    // ========================================
    // LEAVE HISTORY PAGE
    // ========================================

    const leaveHistory =
        document.getElementById("leaveHistory");


    if (leaveHistory) {

        const student =
            JSON.parse(
                localStorage.getItem("student")
            );


        if (!student) {

            alert(
                "Please login first."
            );


            window.location.href =
                "/student-login.html";

            return;

        }


        if (studentName) {

            studentName.textContent =
                student.name;

        }


        loadLeaveHistory(
            student.student_id
        );

    }


    // ========================================
    // BACK TO DASHBOARD BUTTON
    // ========================================

    const backDashboardButton =
        document.getElementById(
            "backDashboardButton"
        );


    if (backDashboardButton) {

        backDashboardButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "/dashboard.html";

            }
        );

    }


    // ========================================
    // ADMIN LOGIN
    // ========================================

    const adminLoginForm =
        document.getElementById(
            "adminLoginForm"
        );


    if (adminLoginForm) {

        adminLoginForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const username =
                    document.getElementById(
                        "adminUsername"
                    ).value.trim();


                const password =
                    document.getElementById(
                        "adminPassword"
                    ).value.trim();


                if (
                    username === "" ||
                    password === ""
                ) {

                    alert(
                        "Please enter Admin Username and Password."
                    );

                    return;

                }


                if (
                    username === "admin" &&
                    password === "admin123"
                ) {

                    localStorage.setItem(
                        "admin",
                        "true"
                    );


                    alert(
                        "Admin login successful!"
                    );


                    window.location.href =
                        "/admin-dashboard.html";

                } else {

                    alert(
                        "Invalid Admin Username or Password."
                    );

                }

            }
        );

    }


    // ========================================
    // ADMIN DASHBOARD
    // ========================================

    const adminApplications =
        document.getElementById(
            "adminApplications"
        );


    const viewApplicationsButton =
        document.getElementById(
            "viewApplicationsButton"
        );


    const adminLogoutButton =
        document.getElementById(
            "adminLogoutButton"
        );


    // ========================================
    // ADMIN SEARCH AND FILTER
    // ========================================

    const studentSearch =
        document.getElementById(
            "studentSearch"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const adminFilters =
        document.getElementById(
            "adminFilters"
        );


    if (
        adminApplications &&
        viewApplicationsButton
    ) {

        const adminLoggedIn =
            localStorage.getItem("admin");


        if (adminLoggedIn !== "true") {

            window.location.href =
                "/admin-login.html";

            return;

        }


        viewApplicationsButton.addEventListener(
            "click",
            function () {

                if (adminFilters) {

                    adminFilters.style.display =
                        "block";

                }


                loadAdminApplications();

            }
        );

    }


    // ========================================
    // STUDENT ID SEARCH
    // ========================================

    if (studentSearch) {

        studentSearch.addEventListener(
            "input",
            function () {

                loadAdminApplications();

            }
        );

    }


    // ========================================
    // STATUS FILTER
    // ========================================

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                loadAdminApplications();

            }
        );

    }


    // ========================================
    // ADMIN LOGOUT
    // ========================================

    if (adminLogoutButton) {

        adminLogoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "admin"
                );


                window.location.href =
                    "/admin-login.html";

            }
        );

    }


    // ========================================
    // VIEW REGISTERED STUDENTS
    // ========================================

    const viewStudentsButton =
        document.getElementById(
            "viewStudentsButton"
        );


    const registeredStudentSearch =
        document.getElementById(
            "registeredStudentSearch"
        );


    const studentSearchContainer =
        document.getElementById(
            "studentSearchContainer"
        );


    if (viewStudentsButton) {

        viewStudentsButton.addEventListener(
            "click",
            function () {

                if (studentSearchContainer) {

                    studentSearchContainer.style.display =
                        "block";

                }


                loadAdminStudents();

            }
        );

    }


    // ========================================
    // REGISTERED STUDENT SEARCH
    // ========================================

    if (registeredStudentSearch) {

        registeredStudentSearch.addEventListener(
            "input",
            function () {

                loadAdminStudents();

            }
        );

    }

});


// ========================================
// LOAD STUDENT LEAVE HISTORY
// ========================================

async function loadLeaveHistory(studentId) {

    const leaveHistory =
        document.getElementById(
            "leaveHistory"
        );


    try {

        const response =
            await fetch(
                `/api/leave-history/${studentId}`
            );


        const data =
            await response.json();


        if (!data.success) {

            leaveHistory.innerHTML =
                `<p>${data.message}</p>`;

            return;

        }


        if (
            !data.applications ||
            data.applications.length === 0
        ) {

            leaveHistory.innerHTML =
                "<p>No leave applications found.</p>";

            return;

        }


        leaveHistory.innerHTML = "";


        data.applications.forEach(
            function (application) {

                const card =
                    document.createElement("div");


                card.style.border =
                    "1px solid #ccc";


                card.style.padding =
                    "15px";


                card.style.marginBottom =
                    "15px";


                card.style.borderRadius =
                    "8px";


                card.style.backgroundColor =
                    "#ffffff";


                let statusText =
                    application.status;


                let statusBackground =
                    "#fef3c7";


                let statusColor =
                    "#92400e";


                if (
                    application.status ===
                    "Approved"
                ) {

                    statusText =
                        "🟢 Approved";


                    statusBackground =
                        "#dcfce7";


                    statusColor =
                        "#166534";

                }


                if (
                    application.status ===
                    "Rejected"
                ) {

                    statusText =
                        "🔴 Rejected";


                    statusBackground =
                        "#fee2e2";


                    statusColor =
                        "#991b1b";

                }


                if (
                    application.status ===
                    "Pending"
                ) {

                    statusText =
                        "🟡 Pending";

                }


                card.innerHTML = `

                    <p>
                        <strong>Leave Type:</strong>
                        ${application.leave_type}
                    </p>

                    <p>
                        <strong>Start Date:</strong>
                        ${application.start_date}
                    </p>

                    <p>
                        <strong>End Date:</strong>
                        ${application.end_date}
                    </p>

                    <p>
                        <strong>Reason:</strong>
                        ${application.reason}
                    </p>

                    <p>
                        <strong>Status:</strong>

                        <span
                            style="
                                display: inline-block;
                                padding: 6px 12px;
                                border-radius: 20px;
                                background-color: ${statusBackground};
                                color: ${statusColor};
                                font-weight: bold;
                            "
                        >
                            ${statusText}
                        </span>

                    </p>

                    <p>
                        <strong>Applied On:</strong>
                        ${application.created_at}
                    </p>

                `;


                leaveHistory.appendChild(
                    card
                );

            }
        );

    } catch (error) {

        console.error(error);


        leaveHistory.innerHTML =
            "<p>Unable to load leave history.</p>";

    }

}


// ========================================
// LOAD ADMIN LEAVE APPLICATIONS
// ========================================

async function loadAdminApplications() {

    const adminApplications =
        document.getElementById(
            "adminApplications"
        );


    const studentSearch =
        document.getElementById(
            "studentSearch"
        );


    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const searchText =
        studentSearch
            ? studentSearch.value.trim().toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "All";


    adminApplications.innerHTML =
        "<p>Loading applications...</p>";


    try {

        const response =
            await fetch(
                "/api/admin/leave-applications"
            );


        const data =
            await response.json();


        if (!data.success) {

            adminApplications.innerHTML =
                `<p>${data.message}</p>`;

            return;

        }


        if (
            !data.applications ||
            data.applications.length === 0
        ) {

            adminApplications.innerHTML =
                "<p>No leave applications found.</p>";

            return;

        }


        const filteredApplications =
            data.applications.filter(
                function (application) {

                    const matchesStudent =
                        application.student_id
                            .toLowerCase()
                            .includes(searchText);


                    const matchesStatus =
                        selectedStatus === "All" ||
                        application.status ===
                            selectedStatus;


                    return (
                        matchesStudent &&
                        matchesStatus
                    );

                }
            );


        if (
            filteredApplications.length === 0
        ) {

            adminApplications.innerHTML =
                "<p>No applications match your search or filter.</p>";

            return;

        }


        const tableContainer =
            document.createElement("div");


        tableContainer.className =
            "table-container";


        const table =
            document.createElement("table");


        table.className =
            "applications-table";


        const tableHeader =
            document.createElement("thead");


        tableHeader.innerHTML = `

            <tr>

                <th>Application ID</th>

                <th>Student ID</th>

                <th>Leave Type</th>

                <th>Start Date</th>

                <th>End Date</th>

                <th>Reason</th>

                <th>Status</th>

                <th>Applied On</th>

                <th>Actions</th>

            </tr>

        `;


        table.appendChild(
            tableHeader
        );


        const tableBody =
            document.createElement("tbody");


        filteredApplications.forEach(
            function (application) {

                const row =
                    document.createElement("tr");


                const idCell =
                    document.createElement("td");


                idCell.textContent =
                    application.id;


                const studentCell =
                    document.createElement("td");


                studentCell.textContent =
                    application.student_id;


                const typeCell =
                    document.createElement("td");


                typeCell.textContent =
                    application.leave_type;


                const startCell =
                    document.createElement("td");


                startCell.textContent =
                    application.start_date;


                const endCell =
                    document.createElement("td");


                endCell.textContent =
                    application.end_date;


                const reasonCell =
                    document.createElement("td");


                reasonCell.textContent =
                    application.reason;


                const statusCell =
                    document.createElement("td");


                statusCell.textContent =
                    application.status;


                const createdCell =
                    document.createElement("td");


                createdCell.textContent =
                    application.created_at;


                const actionCell =
                    document.createElement("td");


                if (
                    application.status ===
                    "Pending"
                ) {

                    const approveButton =
                        document.createElement(
                            "button"
                        );


                    approveButton.textContent =
                        "✅ Approve";


                    approveButton.className =
                        "action-button";


                    approveButton.addEventListener(
                        "click",
                        function () {

                            updateLeaveStatus(
                                application.id,
                                "Approved"
                            );

                        }
                    );


                    const rejectButton =
                        document.createElement(
                            "button"
                        );


                    rejectButton.textContent =
                        "❌ Reject";


                    rejectButton.className =
                        "action-button";


                    rejectButton.addEventListener(
                        "click",
                        function () {

                            updateLeaveStatus(
                                application.id,
                                "Rejected"
                            );

                        }
                    );


                    actionCell.appendChild(
                        approveButton
                    );


                    actionCell.appendChild(
                        rejectButton
                    );

                } else {

                    actionCell.textContent =
                        "No action required.";

                }


                row.appendChild(idCell);

                row.appendChild(studentCell);

                row.appendChild(typeCell);

                row.appendChild(startCell);

                row.appendChild(endCell);

                row.appendChild(reasonCell);

                row.appendChild(statusCell);

                row.appendChild(createdCell);

                row.appendChild(actionCell);


                tableBody.appendChild(
                    row
                );

            }
        );


        table.appendChild(
            tableBody
        );


        tableContainer.appendChild(
            table
        );


        adminApplications.innerHTML = "";


        adminApplications.appendChild(
            tableContainer
        );

    } catch (error) {

        console.error(error);


        adminApplications.innerHTML =
            "<p>Unable to load applications.</p>";

    }

}


// ========================================
// UPDATE LEAVE STATUS
// ========================================

async function updateLeaveStatus(
    applicationId,
    status
) {

    try {

        const response =
            await fetch(
                `/api/admin/leave-applications/${applicationId}/status`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        status:
                            status

                    })

                }
            );


        const data =
            await response.json();


        if (data.success) {

            alert(
                data.message
            );


            loadAdminApplications();

        } else {

            alert(
                data.message
            );

        }

    } catch (error) {

        console.error(error);


        alert(
            "Unable to update leave status."
        );

    }

}


// ========================================
// LOAD REGISTERED STUDENTS - ADMIN
// ========================================

async function loadAdminStudents() {

    const adminStudents =
        document.getElementById(
            "adminStudents"
        );


    const registeredStudentSearch =
        document.getElementById(
            "registeredStudentSearch"
        );


    if (!adminStudents) {

        return;

    }


    const searchText =
        registeredStudentSearch
            ? registeredStudentSearch.value.trim().toLowerCase()
            : "";


    adminStudents.innerHTML =
        "<p>Loading registered students...</p>";


    try {

        const response =
            await fetch(
                "/api/admin/students"
            );


        const data =
            await response.json();


        if (!data.success) {

            adminStudents.innerHTML =
                `<p>${data.message}</p>`;

            return;

        }


        if (
            !data.students ||
            data.students.length === 0
        ) {

            adminStudents.innerHTML =
                "<p>No registered students found.</p>";

            return;

        }


        // ========================================
        // FILTER STUDENTS
        // ========================================

        const filteredStudents =
            data.students.filter(
                function (student) {

                    const studentId =
                        String(
                            student.student_id || ""
                        ).toLowerCase();


                    const name =
                        String(
                            student.name || ""
                        ).toLowerCase();


                    const email =
                        String(
                            student.email || ""
                        ).toLowerCase();


                    const department =
                        String(
                            student.department || ""
                        ).toLowerCase();


                    return (
                        studentId.includes(searchText) ||
                        name.includes(searchText) ||
                        email.includes(searchText) ||
                        department.includes(searchText)
                    );

                }
            );


        if (
            filteredStudents.length === 0
        ) {

            adminStudents.innerHTML =
                "<p>No students match your search.</p>";

            return;

        }


        // ========================================
        // CREATE STUDENT TABLE
        // ========================================

        const tableContainer =
            document.createElement("div");


        tableContainer.className =
            "table-container";


        const table =
            document.createElement("table");


        table.className =
            "students-table";


        // ========================================
        // TABLE HEADER
        // ========================================

        const tableHeader =
            document.createElement("thead");


        tableHeader.innerHTML = `

            <tr>

                <th>
                    Student ID
                </th>

                <th>
                    Name
                </th>

                <th>
                    Email
                </th>

                <th>
                    Department
                </th>

                <th>
                    Registered On
                </th>

            </tr>

        `;


        table.appendChild(
            tableHeader
        );


        // ========================================
        // TABLE BODY
        // ========================================

        const tableBody =
            document.createElement("tbody");


        filteredStudents.forEach(
            function (student) {

                const row =
                    document.createElement("tr");


                const studentIdCell =
                    document.createElement("td");


                studentIdCell.textContent =
                    student.student_id;


                const nameCell =
                    document.createElement("td");


                nameCell.textContent =
                    student.name;


                const emailCell =
                    document.createElement("td");


                emailCell.textContent =
                    student.email;


                const departmentCell =
                    document.createElement("td");


                departmentCell.textContent =
                    student.department;


                const createdCell =
                    document.createElement("td");


                createdCell.textContent =
                    student.created_at;


                row.appendChild(
                    studentIdCell
                );


                row.appendChild(
                    nameCell
                );


                row.appendChild(
                    emailCell
                );


                row.appendChild(
                    departmentCell
                );


                row.appendChild(
                    createdCell
                );


                tableBody.appendChild(
                    row
                );

            }
        );


        table.appendChild(
            tableBody
        );


        tableContainer.appendChild(
            table
        );


        adminStudents.innerHTML = "";


        adminStudents.appendChild(
            tableContainer
        );

    } catch (error) {

        console.error(error);


        adminStudents.innerHTML =
            "<p>Unable to load registered students.</p>";

    }

}

// Student/staff registration and staff login, plus admin approval queue.
document.addEventListener("DOMContentLoaded", () => {
    const studentForm = document.getElementById("registerForm");
    if (studentForm) {
        // The existing registration handler remains responsible for submission.
    }

    const staffRegisterForm = document.getElementById("staffRegisterForm");
    if (staffRegisterForm) {
        staffRegisterForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const payload = {
                staffId: document.getElementById("staffId").value.trim(),
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                department: document.getElementById("department").value.trim(),
                password: document.getElementById("password").value
            };
            try {
                const response = await fetch("/api/staff/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
                const data = await response.json();
                alert(data.message);
                if (data.success) { staffRegisterForm.reset(); window.location.href = "/staff-login.html"; }
            } catch (error) { console.error(error); alert("Unable to connect to server."); }
        });
    }

    const staffLoginForm = document.getElementById("staffLoginForm");
    if (staffLoginForm) {
        staffLoginForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            try {
                const response = await fetch("/api/staff/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ staffId: document.getElementById("staffId").value.trim(), password: document.getElementById("password").value }) });
                const data = await response.json();
                if (!data.success) { alert(data.message); return; }
                localStorage.setItem("staff", JSON.stringify(data.staff));
                alert("Login successful!");
                // A dedicated staff portal can be added to the existing leave workflow next.
                window.location.href = "/dashboard.html";
            } catch (error) { console.error(error); alert("Unable to connect to server."); }
        });
    }

    const loadButton = document.getElementById("loadRegistrationsButton");
    const approvals = document.getElementById("registrationApprovals");
    if (loadButton && approvals) {
        const loadRegistrations = async () => {
            approvals.textContent = "Loading registrations...";
            try {
                const response = await fetch("/api/admin/registrations");
                const data = await response.json();
                if (!data.success) throw new Error(data.message || "Unable to load registrations.");
                const pending = data.registrations.filter(item => item.status === "Pending");
                approvals.replaceChildren();
                if (!pending.length) { approvals.textContent = "No pending registrations."; return; }
                pending.forEach(item => {
                    const card = document.createElement("div");
                    card.style.cssText = "background:#fff;border:1px solid #ddd;border-radius:8px;padding:14px;margin:12px 0;";
                    const details = document.createElement("p");
                    details.textContent = `${item.role.toUpperCase()} | ${item.user_id} | ${item.name} | ${item.email} | ${item.department} | Status: ${item.status}`;
                    const approve = document.createElement("button");
                    approve.type = "button"; approve.textContent = "Approve"; approve.style.marginBottom = "8px";
                    approve.addEventListener("click", () => updateRegistration(item, "Approved"));
                    const reject = document.createElement("button");
                    reject.type = "button"; reject.textContent = "Reject"; reject.style.backgroundColor = "#b91c1c";
                    reject.addEventListener("click", () => updateRegistration(item, "Rejected"));
                    card.append(details, approve, reject); approvals.appendChild(card);
                });
            } catch (error) { approvals.textContent = error.message || "Unable to load registrations."; }
        };
        const updateRegistration = async (item, status) => {
            try {
                const response = await fetch(`/api/admin/registrations/${item.role}/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
                const data = await response.json();
                alert(data.message);
                if (data.success) loadRegistrations();
            } catch (error) { console.error(error); alert("Unable to update registration."); }
        };
        loadButton.addEventListener("click", loadRegistrations);
    }
});
