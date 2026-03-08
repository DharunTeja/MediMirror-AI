# MediMirror AI — Frontend Documentation

## Overview

The MediMirror AI frontend is a **React (TypeScript)** single-page application built with **Vite**. It provides the user interface for prescription processing, medication management, and doctor-patient interaction through QR codes.

---

## Tech Stack
-----------------------------------------------------
|     Technology      |             Purpose         |
|---------------------|-----------------------------|
| React 19            | UI framework                |
| TypeScript          | Type safety                 |
| Vite 7              | Build tool & dev server     |
| React Router        | Client-side routing         |
| Supabase JS Client  | Authentication              |
| html5-qrcode        | QR code scanning            |
| qrcode.react        | QR code rendering           |
| Lucide React        | Icon library                |
| Web Speech API      | Voice recognition (browser) |
| SpeechSynthesis API | Text-to-speech (browser)    |
-----------------------------------------------------

---

## Project Structure

```
frontend/src/
├── components/              # Reusable components
│   ├── Navbar.tsx           # Navigation bar with role-based links
│   ├── MedicationTable.tsx  # Parsed medications display table
│   └── ProtectedRoute.tsx   # Auth guard for protected pages
│
├── pages/                   # Route-level page components
│   ├── LandingPage.tsx      # Public landing page with features
│   ├── LoginPage.tsx        # User authentication (sign in)
│   ├── SignupPage.tsx       # User registration with role selection
│   ├── DashboardPage.tsx    # Main dashboard with stats & actions
│   ├── PrescriptionsPage.tsx# Voice/OCR/manual prescription input
│   ├── RemindersPage.tsx    # Medication reminder management
│   ├── QRProfilePage.tsx    # QR code generation for patients
│   ├── ProfilePage.tsx      # User profile management
│   └── DoctorScanPage.tsx   # QR scanning for doctors
│
├── context/
│   └── AuthContext.tsx      # Authentication state management
│
├── hooks/
│   └── useSpeech.ts         # Speech recognition & TTS hooks
│
├── services/
│   ├── api.ts               # REST API service layer
│   └── supabaseClient.ts    # Supabase client initialization
│
├── types/
│   └── index.ts             # All TypeScript interfaces/types
│
├── index.css                # Global CSS design system
├── App.tsx                  # Root component with router
└── main.tsx                 # Application entry point
```

---

## Design System

The frontend uses a **premium dark theme** with a custom CSS design system defined in `index.css`:

### Color Palette
- **Primary**: Blue gradient (#0090e7 → #14b8a6 → #8b5cf6)
- **Background**: Deep navy dark mode (#0a0e1a, #111827, #1a1f36)
- **Accents**: Teal (#14b8a6), Purple (#8b5cf6), Orange (#f59e0b)
- **Semantic**: Success (#10b981), Warning (#f59e0b), Danger (#ef4444)

### Typography
- **Primary font**: Inter (Google Fonts)
- **Display font**: Space Grotesk (headings)

### Key CSS Classes
- `.card`, `.card-glass`, `.card-glow` — Card containers with glassmorphism
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger` — Button variants
- `.form-input`, `.form-textarea`, `.form-select` — Form elements
- `.badge-*` — Status badges
- `.alert-*` — Alert/notification boxes
- `.gradient-text` — Gradient text effect

### Animations
- `fadeInUp` — Page entrance animation
- `floatLogo` — Logo hover animation
- `pulse` — Voice recording pulse
- `spin` — Loading spinner

---

## Key Components

### Navbar (`components/Navbar.tsx`)
- Responsive navigation with mobile hamburger menu
- Role-based links: Patient sees prescriptions, reminders, QR; Doctor sees scan QR
- User avatar with initials and gradient background
- Brand logo with gradient text

### MedicationTable (`components/MedicationTable.tsx`)
- Displays parsed medication data in a structured table
- Columns: Medicine name, Dosage, Frequency, Timing, Duration
- Text-to-speech button per medication (reads aloud)
- Timing shown with emoji indicators

### ProtectedRoute (`components/ProtectedRoute.tsx`)
- Wraps authenticated-only routes
- Shows loading spinner during auth check
- Redirects to `/login` if unauthenticated

---

## Pages

### LandingPage
- Hero section with animated logo & gradient title
- Features grid with 6 feature cards
- CTA section for signup
- Responsive design

### PrescriptionsPage (Core Feature)
Three-tab interface:
1. **Voice Input** — Uses Web Speech API to capture spoken prescriptions
2. **OCR Upload** — File upload for images/PDFs processed via backend OCR
3. **Manual Entry** — Text input for typing prescriptions

All tabs lead to the same parsing → medication table → save flow.

### RemindersPage
- Lists active medication reminders
- Browser notification permission request
- Client-side notification scheduling (checks every 60 seconds)
- Delete individual reminders

### QRProfilePage
- Generates a QR code containing the user's medical profile
- Download QR code as PNG
- Regenerate capability

### ProfilePage
- Two-column form for personal & medical info
- Fields: name, phone, DOB, blood group, allergies, conditions, emergency contact
- Avatar with gradient background

### DoctorScanPage
- Camera-based QR scanner using html5-qrcode
- Manual patient ID search fallback
- Patient profile display with prescription history

---

## Authentication Flow

```
User → Login/Signup Form
  ↓
Frontend → POST /api/auth/signin or /api/auth/signup
  ↓
Backend → Supabase Auth → Returns JWT tokens
  ↓
Frontend → Stores access_token in localStorage
         → Stores user_data in localStorage
         → AuthContext state updated
  ↓
Protected routes → Authorization header includes Bearer token
```

### AuthContext (`context/AuthContext.tsx`)
- React Context providing auth state globally
- Methods: `signUp`, `signIn`, `signOut`, `updateProfile`, `refreshProfile`
- Persists session to localStorage
- Auto-restores session on mount

---

## Custom Hooks

### `useSpeechRecognition()` (hooks/useSpeech.ts)
- Wraps the Web Speech API (`SpeechRecognition`)
- Returns: `isListening`, `transcript`, `error`, `startListening`, `stopListening`, `resetTranscript`
- Supports language selection (default: en-US)
- Continuous recognition with interim results

### `useTextToSpeech()` (hooks/useSpeech.ts)
- Wraps the `SpeechSynthesis` API
- Returns: `isSpeaking`, `speak(text, lang)`, `stop()`
- Adjustable rate and pitch

---

## API Service (`services/api.ts`)

Centralized API client with methods for all backend endpoints:
- **Auth**: `signUp`, `signIn`, `getProfile`, `updateProfile`
- **Prescriptions**: `parsePrescription`, `ocrExtract`, `createPrescription`, `getPrescriptions`
- **Reminders**: `createReminder`, `getReminders`, `deleteReminder`, `autoGenerateReminders`
- **QR**: `generateQR`, `getPatientProfile`, `decodeQR`

Automatic auth token injection from localStorage.

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:8000/api
```

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Type check
npx tsc --noEmit

# Production build
npm run build

# Preview production build
npm run preview
```

---

## Build Output

The production build generates optimized static files in `dist/`:
- JavaScript bundle (minified, tree-shaken)
- CSS bundle (minified)
- Static assets (logo, fonts)

Deploy to any static hosting: Vercel, Netlify, Firebase Hosting, or Supabase Hosting.
