# MEDPRO - Backend REST API

This repository houses the core backend API service for **MEDPRO** — an enterprise-grade Doctor Appointment & Healthcare Management System. Built using Node.js, Express.js v5, and MongoDB, it manages role-based authentication, appointment scheduling, and communication pipelines.

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Database:** MongoDB (via Mongoose ODM)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt hashing
- **File Storage:** Cloudinary (via Multer)
- **Communications:** Nodemailer (HTML transactional emails) & Twilio (SMS OTP)

## 🔑 Key Features

### 1. Role-Based Access Control (RBAC)
- Three dedicated middleware guards (`authAdmin`, `authDoctor`, `authUser`) enforcing strict privilege isolation for Administrators, Doctors, and Patients.
- Salted and hashed passwords using `bcrypt`.
- Dual login identifier support: authenticate via email or mobile number.

### 2. OTP-Verified Registration & Account Security
- **OTP Registration:** Prevents fake accounts by requiring email/SMS OTP verification prior to record creation.
- **Unified Password Recovery:** Standardized 3-step reset cycle (`send OTP → verify OTP → reset password`) for both patients and doctors.
- **Identifier Update Pipeline:** Sensitive contact updates (changing email/phone) require OTP validation on the new identifier.
- **Developer Fallback:** With `EMAIL_ENABLED=false` or `SMS_ENABLED=false`, OTPs print directly to the console for zero-cost local testing.

### 3. Appointment Scheduling Engine
- Conflict-free slot booking with real-time slot locking to eliminate double-bookings.
- Centralized cancel workflow via `appointmentService` synchronizing slot release and automated cancellation notifications.
- Payment tracking with instant receipt dispatches.

### 4. Dual-Control Doctor Moderation
- Instant availability toggling for emergency operational shifts.
- Sensitive credential and fee modifications are held in an administrative moderation queue (`doctorUpdateModel`) awaiting review before going live.

### 5. Health Monitoring
- Dedicated `/api/health` endpoint providing uptime and system diagnostics for deployment probes (Render, Railway, AWS).

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env` in the `backend/` folder and populate your credentials:

```bash
cp .env.example .env
```

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start in development mode (with nodemon)
npm run dev

# Start in production mode
npm start
```
