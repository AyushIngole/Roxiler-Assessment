# Store Rating Platform

Full-stack web app where users rate stores (1-5). Single login with role-based access for System Administrator, Normal User, and Store Owner.

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

## Setup

### 1. Database
Create a PostgreSQL database:
```sql
CREATE DATABASE roxiler_ratings;
```

### 2. Backend
```bash
cd backend
cp .env.example .env   # edit DB credentials, JWT secret, bootstrap admin
npm install
npm run dev             # starts on http://localhost:5000
```
On first start, the server auto-creates tables (`sequelize.sync()`) and seeds one bootstrap Admin user from the `ADMIN_*` values in `.env`.

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # starts on http://localhost:5173, proxies /api to backend
```

Log in with the bootstrap admin credentials from `backend/.env`, then use the Admin dashboard to create additional users, store owners, and stores.

## Roles & Functionality
- **System Administrator**: dashboard stats (users/stores/ratings), add users (any role), add stores, filterable+sortable user/store listings, view user detail (with rating if Store Owner).
- **Normal User**: signup, browse/search stores by name & address, submit/update rating (1-5), update password.
- **Store Owner**: dashboard showing average rating and list of users who rated their store, update password.

## Validations
- Name: 20-60 characters
- Address: up to 400 characters
- Password: 8-16 characters, at least one uppercase letter and one special character
- Email: standard email format
