# MEDPRO - Patient Portal

The patient-facing web application for **MEDPRO** — providing an intuitive, accessible experience for discovering doctors, booking appointments without double-booking conflicts, and managing healthcare appointments.

## 🛠️ Technology Stack

- **Framework:** React 19 (via Vite)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Notifications:** React Toastify

## 🌟 Key Features

1. **Doctor Discovery & Filtering:** Browse verified medical practitioners categorized dynamically by specialty (General Physician, Gynecologist, Dermatologist, Pediatrician, Neurologist, Gastroenterologist).
2. **Conflict-Free Appointment Scheduling:** Slot availability engine preventing conflicting or duplicate appointment bookings.
3. **Secure Authentication:** 2-step registration with email and mobile OTP verification.
4. **Account & Profile Management:** View past appointment history, update contact details, and upload profile pictures.

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Ensure VITE_BACKEND_URL points to your running backend (default: http://localhost:8000)

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```
