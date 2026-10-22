# Student Leave Management System

A web-based Student Leave Management System with student registration, admin approval of student/staff accounts, student leave requests, leave history, and staff-only leave approval/rejection. Admins can view leave applications but cannot decide them.

## Run locally

Requirements: Node.js 22.x and npm.

1. Open a terminal in this folder.
2. Run `npm install`. This creates a fresh `package-lock.json` for the pinned dependencies.
3. Run `npm start`.
4. Open `http://localhost:3000`.

The SQLite database is created automatically under `database/leave_management.db`.

## Deploy to Render

Create a **Web Service** connected to your GitHub repository and set:

- **Runtime:** Node
- **Build Command:** `npm install --no-audit --no-fund`
- **Start Command:** `npm start`
- **Health Check Path:** `/health` (if the setting is available)

Use Node 22.x. The project pins `sqlite3` to `5.1.7` to avoid the incompatible native binary from `sqlite3` 6.x that caused the `GLIBC_2.38 not found` crash. The stale lockfile is intentionally not included; `npm install` should create a new lockfile from `package.json`. Commit the newly generated `package-lock.json` after a successful local install if you want reproducible installs. Do not commit `node_modules/`.

### Database persistence on Render

The app runs without extra database configuration, but files on a typical Render service filesystem can be lost on redeploy/restart. For persistent SQLite data, attach a persistent disk and set `DB_PATH` to a file on its mount, for example `/var/data/leave_management.db` when the disk is mounted at `/var/data`. Otherwise, use an external managed database for production.

## Important workflow

- Student and staff accounts start as `Pending`.
- An admin must approve registrations before the account can log in.
- Approved staff log in through Staff Login and make leave decisions from Staff Dashboard.
- Admins can view leave applications but cannot approve or reject them.
