# Store Rating Platform

A web app where users can rate stores from 1 to 5. There is one login page for everyone, and what you can do after logging in depends on your role: **System Administrator**, **Normal User**, or **Store Owner**.

## Tech Stack
- Backend: Node.js + Express, Sequelize ORM
- Database: PostgreSQL
- Frontend: React (Vite) + React Router + Axios
- Auth: JWT, bcrypt password hashing

## Project Structure
```
backend/   Express API (auth, admin, user, store-owner routes)
frontend/  React SPA
```

---

## How to Run This Project (Step by Step)

This guide assumes nothing is installed yet. Follow the steps in order.

### Requirements
Install these two things first if you don't already have them:
1. **Node.js** (version 18 or newer) — download from https://nodejs.org
2. **PostgreSQL** (version 14 or newer) — download from https://www.postgresql.org/download/
   - During PostgreSQL setup, it will ask you to set a password for the `postgres` user. Remember this password — you'll need it below.

### Step 1: Get the code
```bash
git clone https://github.com/AyushIngole/Roxiler-Assessment.git
cd Roxiler-Assessment
```

### Step 2: Create the database
Open a terminal and run:
```bash
psql -U postgres
```
It will ask for the password you set during PostgreSQL installation. Once connected, type:
```sql
CREATE DATABASE roxiler_ratings;
```
Then type `\q` and press Enter to exit.

### Step 3: Set up the backend (the server)
```bash
cd backend
```
Copy the example settings file to a real one:
- On Mac/Linux: `cp .env.example .env`
- On Windows (PowerShell): `Copy-Item .env.example .env`

Open the new `.env` file in any text editor and fill in:
- `DB_PASSWORD` → the PostgreSQL password from Step 2
- `JWT_SECRET` → replace with any random long string of letters/numbers (this is used to secure login tokens)

Everything else in `.env` can be left as-is. It already has a default admin login (`admin@example.com` / `Admin@1234`) that gets created automatically the first time the server starts.

Now install the required packages and start the server:
```bash
npm install
npm run dev
```
If it works, you'll see messages like `Database connection established` and `Server listening on port 5000`. Leave this terminal window open and running.

### Step 4: Set up the frontend (the website)
Open a **new** terminal window (keep the backend one running) and run:
```bash
cd Roxiler-Assessment/frontend
```
Copy the example settings file the same way as before:
- Mac/Linux: `cp .env.example .env`
- Windows: `Copy-Item .env.example .env`

No changes are needed in this file. Now install and start:
```bash
npm install
npm run dev
```
It will print a link, usually `http://localhost:5173`.

### Step 5: Open the app
Go to **http://localhost:5173** in your web browser.

Log in with the default admin account:
- **Email:** `admin@example.com`
- **Password:** `Admin@1234`

From the Admin dashboard you can create more users, store owners, and stores. Normal users can also create their own account from the "Sign up" link on the login page.

---

## Roles & Functionality
- **System Administrator**: dashboard stats (users/stores/ratings), add users (any role), add stores, filterable+sortable user/store listings, view user detail (with rating if Store Owner).
- **Normal User**: signup, browse/search stores by name & address, submit/update rating (1-5), update password.
- **Store Owner**: dashboard showing average rating and list of users who rated their store, update password.

## Form Validations
- Name: 20-60 characters
- Address: up to 400 characters
- Password: 8-16 characters, at least one uppercase letter and one special character
- Email: standard email format