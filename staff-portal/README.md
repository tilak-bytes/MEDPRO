# MEDPRO - Staff Portal (Admin & Doctor)

The dual-role operational portal for **MEDPRO** medical professionals and platform administrators. Built on React 19 and Tailwind CSS v4 with role-based dashboard rendering.

## 🛠️ Technology Stack

- **Framework:** React 19 (via Vite)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM v7
- **Authentication:** JWT Role-Based State Guards
- **HTTP Client:** Axios

## 🌟 Portals & Capabilities

### 🩺 Doctor Dashboard
- **Consultation Schedule:** Real-time visibility into daily patient appointments.
- **Appointment Execution:** Mark appointments as Completed or Cancelled with automated patient notifications.
- **Analytics:** Track patient counts and practice earnings.
- **Profile Self-Service:** Instant availability toggle; credentials/fee changes route to the administrative moderation queue.

### 🛡️ Admin Dashboard
- **Doctor Onboarding:** Directly add medical professionals with credentials, experience, and Cloudinary image uploads.
- **Platform Roster Management:** Toggle doctor platform availability and manage system-wide appointments.
- **Profile Moderation Queue:** Review, approve, or decline doctor profile modification requests.
- **System Overview:** Aggregate platform statistics and health metrics.

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Set VITE_BACKEND_URL=http://localhost:8000

# 3. Run development server
npm run dev

# 4. Build for production
npm run build
```
