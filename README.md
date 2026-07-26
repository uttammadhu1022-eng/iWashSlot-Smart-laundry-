# iWashSlot - Production Ready Full-Stack Architecture

This repository contains the production-grade, secure, full-stack implementation of the **iWashSlot Hostel Laundry Booking System**.

---

## 1. Project Folder Structure

```
/
├── frontend/             # React/Vite client application
│   ├── components/       # Dashboards, login flow, layouts
│   ├── services/         # Axios API connection, token headers
│   ├── App.tsx           # Router and view manager
│   ├── store.ts          # Zustand state store synced with REST API
│   ├── package.json      # Client package manager
│   └── ...
├── backend/              # Node.js + Express API Server
│   ├── prisma/           # Database schema and seeder
│   │   ├── schema.prisma # SQLite/PostgreSQL schema
│   │   └── seed.ts       # Database seeder (Alok, machines)
│   ├── src/
│   │   ├── config/       # Env config, Twilio configs
│   │   ├── controllers/  # Route controller logic
│   │   ├── middleware/   # JWT verification, CORS, Helmet, limits, Joi validation
│   │   ├── routes/       # V1 REST API routes
│   │   ├── services/     # OTP management, SMS dispatches, DB client
│   │   ├── utils/        # Winston logs
│   │   ├── app.ts        # Express app
│   │   └── index.ts      # Main server entry
│   ├── tests/            # Automated integration tests (Jest + Supertest)
│   ├── Dockerfile        # Docker setup
│   ├── package.json      # Server dependencies
│   └── ...
├── docker-compose.yml    # Docker services orchestrator
└── README.md             # Project documentation (this file)
```

---

## 2. API Endpoints Documentation

All endpoints are versioned under `/api/v1`. Requests require JSON content headers.

### Authentication Endpoints

#### `POST /api/v1/auth/send-otp`
- **Description:** Formats a phone number to E.164 and dispatches a 6-digit numeric OTP.
- **Payload:**
  ```json
  {
    "phone": "7741820976"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "OTP verification code sent successfully."
  }
  ```

#### `POST /api/v1/auth/verify-otp`
- **Description:** Verifies an OTP code. Automatically registers unregistered students on-the-fly and generates a 24-hour JWT token.
- **Payload:**
  ```json
  {
    "phone": "7741820976",
    "code": "123456"
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
- **Description:** Authenticates admin credentials using environment secrets.
- **Payload:**
  ```json
  {
    "id": "js200004",
    "password": "admin"
  }
  ```

#### `GET /api/v1/auth/me`
- **Description:** Fetch user details of the active session. Requires Bearer Token.

---

### Machine Endpoints

#### `GET /api/v1/machines`
- **Description:** Fetch all laundry machines. Requires Bearer Token.

#### `PATCH /api/v1/machines/:id/status`
- **Description:** Override status of a laundry unit (FREE, IN_USE, OUT_OF_SERVICE). **Requires Admin privileges**.
- **Payload:**
  ```json
  {
    "status": "OUT_OF_SERVICE"
  }
  ```

---

### Booking Endpoints

#### `GET /api/v1/bookings`
- **Description:** Fetch all bookings. Requires Bearer Token.

#### `POST /api/v1/bookings`
- **Description:** Reserve a time slot on a washing unit. Implements collision prevention and checks for active reservations.
- **Payload:**
  ```json
  {
    "machineId": "m1",
    "date": "2026-06-05",
    "slot": "08:00-08:30"
  }
  ```

#### `POST /api/v1/bookings/:id/check-in`
- **Description:** Check in to start a laundry session. Changes machine status to `IN_USE`.

---

### Issue Endpoints

#### `GET /api/v1/issues`
- **Description:** List reported issues.

#### `POST /api/v1/issues`
- **Description:** File a new unit malfunction report. Serious issues (POWER, WATER, MECHANICAL) auto-disable the machine.
- **Payload:**
  ```json
  {
    "machineId": "m1",
    "description": "Drum is making loud clanking noise during spin cycle.",
    "type": "MECHANICAL"
  }
  ```

#### `POST /api/v1/issues/:id/resolve`
- **Description:** Mark issue report as resolved. **Requires Admin privileges**.

---

## 3. Environment Variables Config

### Backend Configuration (`backend/.env`)
- `PORT`: Server port (default: `5000`).
- `NODE_ENV`: Runtime stage (`development` | `production`).
- `JWT_SECRET`: High-entropy key used to sign session cookies/tokens.
- `TWILIO_ACCOUNT_SID`: Your Twilio Account SID (`AC...`).
- `TWILIO_API_KEY`: Your Twilio API Key SID (`SK...`).
- `TWILIO_API_SECRET`: Your Twilio API Secret.
- `TWILIO_PHONE_NUMBER`: Purchased Twilio phone number (`+1...`).
- `ADMIN_ID`: Admin username (default: `js200004`).
- `ADMIN_PASSWORD`: Admin password (default: `admin`).

---

## 4. Production Deployment & Launch Guide

### Local Development Boot

1. **Backend Database Setup:**
   ```bash
   cd backend
   npm run prisma:migrate
   npx prisma db seed
   ```

2. **Start Backend Server:**
   ```bash
   npm run dev
   ```

3. **Start Frontend Client:**
   ```bash
   cd ../frontend
   npm run dev
   ```

---

### Deploy with Docker & Docker Compose

Launch the entire full-stack app inside persistent Docker containers:

```bash
docker-compose up --build -d
```
The Express backend service will be exposed at `http://localhost:5000/`.

---

## 5. Security Checklist

- [x] **Secure Sessions:** Implemented cryptographically secure JWT verification.
- [x] **Secure Headers:** Helmet integration adding Content-Security-Policy, X-XSS-Protection, HSTS, etc.
- [x] **Strict CORS:** Express CORS config restricted to verified origin inputs.
- [x] **Payload validation:** Validates incoming REST request parameters via Joi schemas before executing handlers.
- [x] **Brute-Force Lockout:** OTP attempts are tracked; locked for 30 minutes after 5 failures.
- [x] **Rate Limiting:** Protects API endpoints using IP limit windows.
- [x] **ORM Injection Prevention:** Queries utilize Prisma parameterized queries to prevent SQL injections.
- [x] **Secret Isolation:** API keys, passwords, and tokens are stored inside `.env` configurations.
