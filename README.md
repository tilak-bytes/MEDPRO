# 🏥 MEDPRO: Healthcare & Doctor Appointment Management System

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v20-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Secure_Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **MEDPRO** is a production-ready, full-stack healthcare platform engineered to streamline clinical appointments, medical operations, and doctor-patient interactions. Built on the modern **MERN Stack** (MongoDB, Express.js v5, React 19, Node.js) with Tailwind CSS v4, it provides dedicated portals with granular Role-Based Access Control (RBAC), multi-factor OTP verification, and conflict-free scheduling.

---

## 📌 Project Overview

MEDPRO bridges the operational gap between patients, healthcare providers, and clinical administration across three specialized modules:

1. **Patient Portal (`patient-portal`):** A responsive web application enabling patients to browse specialists, schedule conflict-free appointments, verify credentials via OTP, and manage consultations.
2. **Staff Portal (`staff-portal`):** A dual-role dashboard dynamically rendering isolated administrative controls for **Platform Administrators** and practice analytics for **Medical Doctors**.
3. **RESTful API Backend (`backend`):** A scalable Node.js & Express v5 server managing stateful workflows, data integrity, secure authentication pipelines, and media uploads.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Clients["Frontend Clients (React 19 + Tailwind CSS v4)"]
        PP["Patient Portal<br/>(Port: 5173)"]
        SP["Staff Portal (Admin & Doctor)<br/>(Port: 5174)"]
    end

    subgraph Gateway["API Layer & Middleware (Express.js v5)"]
        API["Express REST API (Port: 8000)"]
        CORS["CORS & Body Parser"]
        AuthGuards{"JWT Auth Guards"}
        UGuard["authUser"]
        DGuard["authDoctor"]
        AGuard["authAdmin"]
    end

    subgraph Services["Core Business Services"]
        ApptService["Appointment Engine<br/>(Conflict Prevention)"]
        OtpService["OTP Verification Engine<br/>(TTL Indexed)"]
        EmailService["Nodemailer & Twilio SMS<br/>(11 HTML Templates)"]
        MediaService["Cloudinary SDK<br/>(Image Management)"]
    end

    subgraph Storage["Database & Cloud Services"]
        MongoDB[("MongoDB Database<br/>(Users, Doctors, Appointments, OTPs)")]
        Cloudinary[("Cloudinary CDN")]
    end

    PP -->|HTTP / Axios| API
    SP -->|HTTP / Axios| API
    API --> CORS --> AuthGuards
    AuthGuards --> UGuard & DGuard & AGuard
    UGuard & DGuard & AGuard --> ApptService & OtpService & EmailService & MediaService
    ApptService & OtpService --> MongoDB
    MediaService --> Cloudinary
```

---

## 🔐 Role-Based Access Control (RBAC) Flow

```mermaid
flowchart LR
    Request["Incoming Client Request"] --> AuthCheck{"Has Bearer Token?"}
    AuthCheck -- No --> Reject["401 Unauthorized"]
    AuthCheck -- Yes --> Verify["Verify JWT Signature"]
    
    Verify --> RoleCheck{"Check Token Role Claims"}
    
    RoleCheck -- "Patient Token" --> PatientRoutes["/api/user/*<br/>(Bookings, Profile, History)"]
    RoleCheck -- "Doctor Token" --> DoctorRoutes["/api/doctor/*<br/>(Schedule, Status, Earnings)"]
    RoleCheck -- "Admin Token" --> AdminRoutes["/api/admin/*<br/>(Doctor Onboarding, Approvals)"]
```

---

## 📅 Conflict-Free Appointment Booking Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Patient
    participant Portal as Patient Portal
    participant API as Backend API
    participant DB as MongoDB

    Patient->>Portal: Selects Doctor, Date & Time Slot
    Portal->>API: POST /api/user/book-appointment
    API->>DB: Query Doctor's slots_booked for slotDate
    alt Slot is Already Booked
        DB-->>API: Slot conflict found
        API-->>Portal: 400 Error: "Slot already booked"
        Portal-->>Patient: Display conflict alert
    else Slot is Available
        API->>DB: Atomically append slotTime to doctor.slots_booked
        API->>DB: Insert new Appointment record
        API->>DB: Update Doctor practice metrics
        API-->>Portal: 200 Success: Appointment Confirmed
        Portal-->>Patient: Booking Confirmation & Update History
    end
```

---

## 🔑 OTP Verification & Registration Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Portal as Registration UI
    participant API as Backend API
    participant OTPStore as MongoDB (TTL 300s)
    participant Comms as SMS / Email Service

    User->>Portal: Enters Name, Email/Phone, Password
    Portal->>API: POST /api/user/send-signup-otp
    API->>OTPStore: Save generated 6-digit OTP (expires in 5m)
    API->>Comms: Dispatch OTP (Email/SMS or Console in Dev)
    API-->>Portal: OTP Dispatched
    User->>Portal: Enters received OTP code
    Portal->>API: POST /api/user/register (Payload + OTP)
    API->>OTPStore: Verify OTP match & check TTL
    alt OTP Valid
        API->>OTPStore: Delete consumed OTP
        API->>DB: Create User Record (bcrypt hashed password)
        API-->>Portal: 200 OK + JWT Authentication Token
        Portal-->>User: Auto-login to Patient Dashboard
    else Invalid / Expired
        API-->>Portal: 400 Error: "Invalid or expired OTP"
    end
```

---

## ✨ Key Features by Role

### 🧑‍💼 Patient Experience
- **Specialty Doctor Discovery:** Browse certified doctors dynamically classified across 6 medical specialties (General Physician, Gynecologist, Dermatologist, Pediatrician, Neurologist, Gastroenterologist).
- **Conflict-Free Booking:** Live transactional slot reservation preventing overlapping appointments.
- **Two-Step OTP Registration:** Enforces email and phone number authenticity before database creation.
- **Self-Service Profile:** Secure avatar uploads via Cloudinary and OTP-guarded phone/email modification.
- **Appointment Tracking:** Review upcoming and completed consultations, with instant payment status tracking.

### 🩺 Doctor Dashboard
- **Practice Analytics:** Private analytics tracking completed consultations, registered patients, and earnings.
- **Appointment Execution:** Real-time completion or cancellation triggers that synchronize availability system-wide.
- **Dual-Control Profile Moderation:** Instant availability toggling for emergencies, with sensitive credential/fee changes routed to the administrative approval queue.
- **OTP Password Recovery:** Multi-factor password reset pipeline.

### 🛡️ Admin Dashboard
- **Doctor Onboarding:** Direct onboarding of licensed medical practitioners with credentials, bio, and image assets.
- **Platform Availability Control:** Instant toggle of doctor visibility across the patient booking platform.
- **Profile Moderation Queue:** Strict quality control review allowing administrators to approve or decline doctor profile revisions with automated notifications.
- **System Metrics:** High-level platform overview displaying global revenue, appointments, and active doctor rosters.

---

## 🌐 Core API Endpoints

### Patient Routes (`/api/user`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/send-signup-otp` | Dispatch verification OTP for registration | No |
| `POST` | `/register` | Validate OTP and initialize patient account | No |
| `POST` | `/login` | Authenticate via email or mobile number | No |
| `GET` | `/get-profile` | Fetch authenticated patient profile | `authUser` |
| `POST` | `/update-profile` | Update demographics and avatar image | `authUser` |
| `POST` | `/book-appointment` | Reserve conflict-free consultation slot | `authUser` |
| `GET` | `/appointments` | Retrieve patient booking history | `authUser` |
| `POST` | `/cancel-appointment` | Cancel an upcoming consultation | `authUser` |
| `POST` | `/send-reset-otp` | Request password reset OTP | No |
| `POST` | `/verify-reset-otp` | Validate reset OTP and issue reset token | No |
| `POST` | `/reset-password` | Set new password with verified token | No |

### Doctor Routes (`/api/doctor`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `GET` | `/list` | Public listing of all active doctors | No |
| `POST` | `/login` | Doctor authentication | No |
| `GET` | `/appointments` | Fetch assigned consultations | `authDoctor` |
| `POST` | `/complete-appointment`| Mark consultation as completed | `authDoctor` |
| `POST` | `/cancel-appointment` | Cancel assigned consultation | `authDoctor` |
| `GET` | `/dashboard` | Practice analytics, patient totals & earnings | `authDoctor` |
| `GET` | `/profile` | Fetch doctor profile details | `authDoctor` |
| `POST` | `/update-profile` | Toggle availability or submit credential updates | `authDoctor` |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/login` | Administrative authentication | No |
| `POST` | `/add-doctor` | Onboard medical practitioner (multipart) | `authAdmin` |
| `GET` | `/all-doctors` | View global doctor roster | `authAdmin` |
| `POST` | `/change-availability`| Toggle practitioner availability status | `authAdmin` |
| `GET` | `/appointments` | View all system consultations | `authAdmin` |
| `POST` | `/cancel-appointment` | System administrator cancellation | `authAdmin` |
| `GET` | `/dashboard` | System-wide statistics and earnings | `authAdmin` |
| `GET` | `/update-requests` | View pending doctor credential updates | `authAdmin` |
| `POST` | `/approve-update` | Approve profile modification | `authAdmin` |
| `POST` | `/reject-update` | Decline profile modification | `authAdmin` |

### System & Health Routes
| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/` | API service root information |
| `GET` | `/api/health` | Uptime check and service health probe |

---

## 🔧 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or local MongoDB instance
- [Cloudinary](https://cloudinary.com/) account for avatar image storage

### 1. Clone the Repository
```bash
git clone https://github.com/tilak-bytes/MEDPRO.git
cd MEDPRO
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` (or copy from `.env.example`):
```env
PORT=8000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net"
JWT_SECRET="your_secure_jwt_secret"

CLOUDINARY_NAME="your_cloudinary_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
CLOUDINARY_FOLDER="MEDPRO_Uploads"

ADMIN_EMAIL="admin@medpro.health"
ADMIN_PASSWORD="your_admin_password"
ADMIN_PHONE_NUMBER="+1234567890"

# Set to false for dev mode (OTPs will print directly to the backend terminal)
EMAIL_ENABLED=false
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_gmail_app_password"

SMS_ENABLED=false
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_NUMBER="your_twilio_number"
```
Start the backend server:
```bash
npm run dev
```

### 3. Patient Portal Setup
Open a new terminal window:
```bash
cd patient-portal
npm install
```
Create `.env` inside `patient-portal/`:
```env
VITE_BACKEND_URL=http://localhost:8000
```
Start the development server:
```bash
npm run dev
```

### 4. Staff Portal Setup
Open another terminal window:
```bash
cd staff-portal
npm install
```
Create `.env` inside `staff-portal/`:
```env
VITE_BACKEND_URL=http://localhost:8000
```
Start the staff dashboard:
```bash
npm run dev
```

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)
Both `patient-portal` and `staff-portal` include pre-configured `vercel.json` routing configurations to support React Router single-page navigation:
1. Import the repository into [Vercel](https://vercel.com).
2. Set Root Directory to `patient-portal` (for patient app) or `staff-portal` (for staff app).
3. Set Environment Variable: `VITE_BACKEND_URL` = `https://your-backend-api.onrender.com`.
4. Deploy!

### Backend Deployment (Render / Railway)
1. Create a Web Service pointing to the repository.
2. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Populate environment variables from `backend/.env.example`.
6. Health Check Path: `/api/health`.

---

## 👤 Author

**Tilak**  
- **GitHub:** [@tilak-bytes](https://github.com/tilak-bytes)  
- **Email:** [engineer.tilak2027@gmail.com](mailto:engineer.tilak2027@gmail.com)  

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use and adapt it for learning and portfolio purposes.
