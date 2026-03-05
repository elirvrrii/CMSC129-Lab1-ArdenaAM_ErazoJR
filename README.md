# inJOURNALize 📖

This is your own personal web diary! inJOURNALize serves as both a journal and mood tracker guaranteed to work right beneath your fingertips. This was built using Node.js, Express, and React.js, with MongoDB Atlas as its database. Made to provide the best user experience.

---
## TABLE OF CONTENTS 📋
- [Features] (#features)
- [Tech Stack] (#techstack)
- [Prerequisites] (#prerequisites)
- [Installation] (#installation)
- [Environment Variables] (#env-var)
- [How to Run the Server] (#run-server)
- [API Endpoints] (#endpoints)

---

## FEATURES 🛠️

- User Authentication
- CRUD Implementation for Journal Entries
- Soft and Hard Delete Implementations
- A backup database

---

## TECH STACK 💻

# Frontend
- **React.js
- **Vite

# Backend
- **Node.js
- **Express.js
- **MongoDB Atlas (Mongoose)
- **JSON Web Tokens
- **bcrypt
- **dotenv

---

## PREREQUISITES 🎯

- [Node.js](https://nodejs.org/) 
- [MongoDB](https://www.mongodb.com/) 
* npm

---

## INSTALLATION 📥

1. First, clone the repository through Git or Git Bash.
2. Install backend and frontend dependencies by using npm install.
3. Set up environment variables through an .env file (PORT, MONGO_URI, MONGO_URI_BACKUP, JWT_SECRET)
4. Start backend and frontend through npm run dev
5. Open http://localhost in your browser

---

## API ENDPOINTS 🔥

1. Health Check

| Method | Endpoint | Description    | Response                               |
| ------ | -------- | -------------- | -------------------------------------- |
| GET    | /        | API is running | { "status": "Journal API is running" } |

2. Journal Routes

| Method | Endpoint                   | Description                                 |
| ------ | -------------------------- | ------------------------------------------- |
| POST   | /api/journal               | Create a new journal entry                  |
| GET    | /api/journal               | Get all journal entries                     |
| GET    | /api/journal/:id           | Get a single journal entry                  |
| PATCH  | /api/journal/:id           | Update one or more fields of existing entry |
| DELETE | /api/journal/:id           | Soft delete entry                           |
| PATCH  | /api/journal/:id/restore   | Restore soft-deleted entry                  |
| DELETE | /api/journal/:id/permanent | Hard delete entry                           |
