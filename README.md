# iWashSlot - Hostel Laundry Booking System

A full-stack web application for hostel students to book laundry machine time slots, report issues, and track eco-friendly usage. Built with a **Python/Flask** REST API backend and a **React/TypeScript/Vite** frontend.

---

## 1. Project Folder Structure

```
/
├── frontend/                  # React + TypeScript + Vite client application
│   ├── components/            # UI components (Landing, Login, AdminDashboard, StudentDashboard, Layout, EcoScoreCard)
│   ├── services/              # Axios API service layer
│   ├── App.tsx                # Root component with view/navigation manager
│   ├── store.ts               # Zustand state store (synced with REST API every 15s)
│   ├── constants.ts           # Allowed students, machines, time-slot generation, eco-slot logic
│   ├── types.ts               # Shared TypeScript types (User, Machine, Booking, IssueReport)
│   ├── index.css              # Global styles
│   ├── index.html             # HTML entry point
│   ├── vite.config.ts         # Vite bundler config (proxies /api → backend)
│   └── package.json           # Frontend dependencies
├── backend-python/            # Python + Flask REST API server
│   ├── routes/
│   │   ├── auth.py            # Authentication endpoints (student/admin login)
│   │   ├── machines.py        # Machine listing and status update endpoints
│   │   ├── bookings.py        # Booking creation, check-in, and cancellation endpoints
│   │   └── issues.py          # Issue reporting, approval, resolution, and deletion endpoints
│   ├── app.py                 # Flask app factory, blueprint registration, DB seeding
│   ├── models.py              # SQLAlchemy ORM models (User, Machine, Booking, IssueReport)
│   ├── database.py            # SQLAlchemy db instance
│   ├── decorators.py          # JWT auth, admin guard, and IP-based rate limiter decorators
│   └── laundry.db             # SQLite database (auto-created on first run)
├── docker-compose.yml         # Docker Compose orchestrator
└── README.md                  # Project documentation (this file)
```

---

## 2. Tech Stack

| Layer      | Technology                                          |
|------------|-----------------------------------------------------|
| Frontend   | React 18, TypeScript, Vite, Zustand, Axios          |
| Backend    | Python 3, Flask, Flask-CORS                         |
| Database   | SQLite (via SQLAlchemy ORM)                         |
| Auth       | JWT (PyJWT) — 24-hour tokens, Bearer scheme         |
| Styling    | Vanilla CSS (custom design system)                  |
| Deployment | Docker / Docker Compose                             |

---

## 3. API Endpoints Documentation

All endpoints are versioned under `/api/v1`. Requests with a body must send `Content-Type: application/json`. Protected endpoints require an `Authorization: Bearer <token>` header.

### Health

#### `GET /api/v1/health`
- **Description:** Simple health check for the Flask backend.
- **Response:**
  ```json
  { "status": "success", "message": "Python backend is healthy!" }
  ```

---

### Authentication Endpoints

#### `POST /api/v1/auth/student/login`
- **Description:** Authenticates a student by USN and password. Returns a 24-hour JWT token.
- **Payload:**
  ```json
  {
    "usn": "1JS25IS139",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Login successful.",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "usn": "1JS25IS139",
        "name": "Alok",
        "role": "STUDENT",
        "phone": "+917741820976"
      }
    }
  }
  ```

#### `POST /api/v1/auth/admin/login`
- **Description:** Authenticates an admin user by USN and password. Returns a 24-hour JWT token.
- **Payload:**
  ```json
  {
    "id": "admin",
    "password": "password"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Admin login successful.",
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "usn": "admin",
        "name": "Super Admin",
        "role": "ADMIN"
      }
    }
  }
  ```

---

### Machine Endpoints

#### `GET /api/v1/machines`
- **Description:** Fetch all laundry machines and their current statuses. Requires Bearer Token.
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "machines": [
        { "id": "m1", "name": "A1", "status": "FREE" },
        { "id": "m4", "name": "B1", "status": "IN_USE" }
      ]
    }
  }
  ```

#### `PATCH /api/v1/machines/<id>/status`
- **Description:** Override the status of a laundry machine. **Requires Admin privileges.**
- **Payload:**
  ```json
  { "status": "OUT_OF_SERVICE" }
  ```
- Valid statuses: `FREE`, `IN_USE`, `OUT_OF_SERVICE`

---

### Booking Endpoints

#### `GET /api/v1/bookings`
- **Description:** Fetch all bookings (with student names). Requires Bearer Token.

#### `POST /api/v1/bookings`
- **Description:** Create a booking for today's date on a specific machine and time slot. Requires Bearer Token.
  - Only bookings for **today's date** are allowed.
  - Prevents slot collision (same machine + date + slot).
  - Prevents duplicate booking (same user + date + slot).
- **Payload:**
  ```json
  {
    "machineId": "m1",
    "date": "2026-07-26",
    "slot": "08:00 AM - 08:30 AM"
  }
  ```
- **Response:** `201 Created` with the created booking object.

#### `POST /api/v1/bookings/<id>/check-in`
- **Description:** Check in to a booking, changing machine status to `IN_USE`. Only the booking owner can check in.

#### `DELETE /api/v1/bookings/<id>/cancel`
- **Description:** Cancel a `PENDING` booking, or complete a `CHECKED_IN` booking and free the machine. Only the booking owner can cancel.

---

### Issue Endpoints

#### `GET /api/v1/issues`
- **Description:** List all reported issues (with student names). Requires Bearer Token.

#### `POST /api/v1/issues`
- **Description:** Report a new machine issue. Requires Bearer Token.
- **Payload:**
  ```json
  {
    "machineId": "m1",
    "description": "Drum is making loud clanking noise during spin cycle.",
    "type": "MECHANICAL"
  }
  ```
- Valid types: `POWER`, `WATER`, `MECHANICAL`, `OTHER`

#### `POST /api/v1/issues/<id>/approve`
- **Description:** Approve an issue report, marking it `APPROVED` and setting the machine to `OUT_OF_SERVICE`. **Requires Admin privileges.**

#### `POST /api/v1/issues/<id>/resolve`
- **Description:** Mark an issue as `RESOLVED` and restore the machine to `FREE` if it was `OUT_OF_SERVICE`. **Requires Admin privileges.**

#### `DELETE /api/v1/issues/<id>`
- **Description:** Delete an issue report. Only the owner or an Admin can delete.

---

## 4. Environment Variables

### Backend (`backend-python/`)

Set these as environment variables or in a `.env` file:

| Variable           | Description                                       | Default                                            |
|--------------------|---------------------------------------------------|----------------------------------------------------|
| `PORT`             | Flask server port                                 | `5000`                                             |
| `FLASK_SECRET_KEY` | Secret key for Flask sessions                     | `supersecret_fallback_key_123` *(override in prod)*|
| `JWT_SECRET`       | High-entropy key used to sign JWT tokens          | `supersecret_for_dev` *(override in production)*   |
| `FLASK_DEBUG`      | Enable debug mode (`True` / `False`)              | `True`                                             |

---

## 5. Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup

```bash
cd backend-python
pip install flask flask-cors flask-sqlalchemy pyjwt werkzeug
python app.py
```

The Flask API starts at `http://localhost:5000`. The SQLite database (`laundry.db`) and seed data (machines + students) are created automatically on first launch.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173` and proxies all `/api` requests to the Flask backend.

---

## 6. Deploy with Docker & Docker Compose

> **Note:** Update the `context` in `docker-compose.yml` from `./backend` to `./backend-python` to match the actual folder name.

Build the frontend for production first:

```bash
cd frontend
npm run build
```

Then launch the full stack:

```bash
docker-compose up --build -d
```

The Flask backend (which also serves the built React app as static files) will be available at `http://localhost:5000/`.

---

## 7. Default Seed Data

On first run, the following data is automatically seeded into the SQLite database:

### Machines (6 total)
| ID  | Name |
|-----|------|
| m1  | A1   |
| m2  | A2   |
| m3  | A3   |
| m4  | B1   |
| m5  | B2   |
| m6  | B3   |

### Pre-registered Students
| Name              | USN          |
|-------------------|--------------|
| Alok              | 1JS25IS139   |
| Shreyansh Raj     | 1JS25IS119   |
| Srujan Rao R      | 1JS25IS124   |
| Tanmay Anand      | 1JS25IS130   |
| Uday E            | 1JS25IS133   |

> Additional students (Utkarsh Singh Samant, Vishveshwargouda Patil, Vishrutha GM, Yamunaprathap P, Uttam Thapa) are on the frontend allowlist in `constants.ts` but must be added to the backend DB seed to log in.

**Default password for all users (student & admin):** `password`  
**Admin USN / ID:** `admin`

---

## 8. Security Checklist

- [x] **JWT Authentication:** All protected routes require a valid Bearer token signed with `JWT_SECRET`.
- [x] **Role-Based Access Control:** Admin-only endpoints are guarded by the `@admin_required` decorator.
- [x] **IP-Based Rate Limiting:** Login endpoints are rate-limited to 5 requests per 60-second window per IP.
- [x] **Password Hashing:** All passwords stored using `werkzeug`'s `generate_password_hash` (PBKDF2-SHA256).
- [x] **CORS:** Flask-CORS enabled with credentials support.
- [x] **Input Validation:** Required fields are validated before any DB interaction.
- [x] **Booking Collision Prevention:** Duplicate slot and user bookings are rejected at the DB query level.
- [x] **Secret Isolation:** JWT and Flask secrets are loaded from environment variables, not hardcoded.
