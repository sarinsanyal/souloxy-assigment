# Souloxy Assignment (Therapist-User Messaging System)

A real-time messaging system between patients and therapists. Built as part of an assignment, it features registration, authentication, therapist-patient assignment, and a live chat system.

---

## YouTube Video Demo
The [YouTube link](https://www.youtube.com/watch?v=tjzmpjVUGMU) with a walkthrough has been given. 

## Tech Stack

### Frontend

* **React.js** – UI Framework
* **Next.js (App Router)** – SSR & Routing
* **Tailwind CSS** – Styling
* **Socket.IO-client** – Real-time communication
* **Sonner** – Toast notifications

### Backend

* **Node.js** & **Express.js** – REST API
* **Prisma ORM** – Database access layer
* **PostgreSQL** – Relational database
* **Socket.IO** – Real-time messaging
* **JWT** – Authentication
* **bcrypt** – Password hashing
* **Supertest** + **Node Test Runner** – Testing

---

## Local Setup Instructions

### Prerequisites

* Node.js ≥ 18
* PostgreSQL installed locally or on a cloud provider (e.g. Supabase or Render)
* `npm` or `pnpm` installed

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/souloxy-assignment.git
cd souloxy-assignment
```

---

### 2. Environment Variables

Create the following `.env` files:

#### `backend/.env`

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE 
JWT_SECRET=your_jwt_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### `frontend/.env.local`

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

---

### 3. Install Dependencies

#### Backend

```bash
cd backend
npm install
npx prisma db push
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

### 4. Run the App

#### Backend Server

```bash
cd backend
npm start
```

#### Prisma DB GUI (Prisma Studio)

```bash
npx prisma studio
```

#### Frontend Server

```bash
cd ../frontend
npm run dev
```


Frontend: [http://localhost:3000](http://localhost:3000) \
Backend: [http://localhost:5000](http://localhost:5000) \
Database: [http://localhost:5555](http://localhost:5555)

---

## API Overview

### Auth Routes

| Method | Endpoint        | Description         |
| ------ | --------------- | ------------------- |
| POST   | `/api/register` | Register a new user |
| POST   | `/api/login`    | Login and get JWT   |

### Message Routes

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| POST   | `/api/messages`         | Send a message             |
| GET    | `/api/messages/:userId` | Get conversation with user |
| POST   | `/api/messages/read`    | Mark messages as read      |

### User Routes

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| GET    | `/api/users/chat-list` | Get chat contacts for a user |

---

## Running Tests

Only the backend has tests (for now).

```bash
cd backend
npm test
```

This will:

* Register a therapist and patient
* Log them in
* Assign a therapist to the patient
* Send and fetch messages

---

## Assumptions

* Patients must be assigned to a therapist manually or programmatically after registration.
* Only registered and authenticated users can send or receive messages.
* Message types currently include text and file URLs.
* All messages are stored permanently; no auto-delete or soft-delete implemented.

---

## Known Limitations

* No admin dashboard to assign therapists to patients visually.
* No support for group messaging.
* No rate limiting or spam protection.
* File uploads (e.g. image/docs) are assumed to be already hosted and passed via `fileUrl`.

---

## Folder Structure

```
souloxy-assignment/
├── backend/         # Node.js + Express + Prisma(Postgres) backend
│   └── routes/
│   └── middleware/
│   └── tests/
├── frontend/        # Next.js(React) frontend
│   └── components/
│   └── app/
└── README.md
```

---

## Author

Made with ❤️ by [Sarin Sanyal](https://github.com/sarinsanyal)

---
