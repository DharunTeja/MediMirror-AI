# MediMirror AI

<p align="center">
  <img src="assets/logo.png" alt="MediMirror AI Logo" width="120" />
</p>

<p align="center">
  <strong>AI-Powered Prescription Assistant for Better Healthcare Accessibility</strong>
</p>

---

## 🏥 Overview

**MediMirror AI** is an intelligent prescription assistant that helps patients understand and follow medical prescriptions effectively. It combines Artificial Intelligence, Optical Character Recognition (OCR), Voice Processing, and QR-based medical record sharing to create a comprehensive healthcare support platform.

### Problem Statement

Many patients struggle to understand handwritten prescriptions or complex medication instructions. This leads to:
- ❌ Incorrect medication intake
- ❌ Missed doses
- ❌ Medication misuse
- ❌ Poor treatment adherence

This problem is especially severe for **elderly patients**, **illiterate individuals**, **rural populations**, and **non-native language speakers**.

### Solution

MediMirror AI provides an interactive prescription interpretation system that:
- 🗣️ Converts spoken prescriptions into structured medication instructions
- 📷 Extracts prescription text from images/PDFs using OCR
- 🔊 Reads medication instructions aloud (multilingual)
- ⏰ Generates automatic medication reminders
- 📱 Allows doctors to access patient data through QR code scanning

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React (TypeScript) + Vite | User interface & interactions |
| **Backend** | Python (FastAPI) | REST API & business logic |
| **Database** | Supabase (PostgreSQL) | Data storage & authentication |
| **OCR Engine** | Tesseract (pytesseract) | Text extraction from images |
| **Voice** | Web Speech API | Speech recognition |
| **TTS** | SpeechSynthesis API | Text-to-speech output |
| **QR Codes** | qrcode (Python) + html5-qrcode | QR generation & scanning |

---

## 📁 Project Structure

```
MEDIMIRROR-GCET 2025/
├── frontend/                    # React TypeScript application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.tsx
│   │   │   ├── MedicationTable.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/               # Application pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── PrescriptionsPage.tsx
│   │   │   ├── RemindersPage.tsx
│   │   │   ├── QRProfilePage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── DoctorScanPage.tsx
│   │   ├── context/             # React context providers
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   │   └── useSpeech.ts
│   │   ├── services/            # API & Supabase clients
│   │   │   ├── api.ts
│   │   │   └── supabaseClient.ts
│   │   ├── types/               # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── index.css            # Global design system
│   │   ├── App.tsx              # Root component with routing
│   │   └── main.tsx             # Entry point
│   ├── .env.example             # Environment variables template
│   └── package.json
│
├── backend/                     # Python FastAPI application
│   ├── app/
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── prescriptions.py
│   │   │   ├── reminders.py
│   │   │   └── qr.py
│   │   ├── models/              # Pydantic schemas
│   │   │   └── schemas.py
│   │   ├── services/            # Business logic services
│   │   │   ├── supabase_service.py
│   │   │   ├── prescription_parser.py
│   │   │   ├── ocr_service.py
│   │   │   ├── qr_service.py
│   │   │   └── reminder_service.py
│   │   └── config.py            # Configuration management
│   ├── main.py                  # FastAPI application entry
│   ├── schema.sql               # Supabase DB schema
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment variables template
│
├── docs/                        # Documentation
│   ├── PROJECT.md               # This file
│   ├── FRONTEND.md              # Frontend documentation
│   └── BACKEND.md               # Backend documentation
│
└── assets/
    └── logo.png                 # Application logo
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18+) and npm
- **Python** (v3.10+) and pip
- **Supabase** account ([supabase.com](https://supabase.com))
- **Tesseract OCR** ([install guide](https://github.com/tesseract-ocr/tesseract))

### 1. Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the schema from `backend/schema.sql`
3. Copy your project URL and API keys from **Settings → API**

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your Supabase credentials

# Start the server
python main.py
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env
# Edit .env with your Supabase & API URLs

# Start development server
npm run dev
# App runs at http://localhost:5173
```

---

## ✨ Key Features

### 1. Voice Prescription Assistant 🗣️
Speak your prescription instructions and the AI converts them into structured medication details with medicine name, dosage, frequency, timing, and duration.

### 2. OCR Prescription Reader 📷
Upload prescription images (JPG, PNG) or PDF files. The Tesseract OCR engine extracts text, which is then parsed into structured medication data.

### 3. Multilingual Voice Output 🔊
Medications can be read aloud using the browser's SpeechSynthesis API, supporting multiple languages.

### 4. Smart Medication Reminders ⏰
Automatic reminders are calculated based on medication frequency. Browser notifications alert users when it's time for their dose.

### 5. QR Medical Profile 📱
Patients generate a QR code containing their medical profile. Doctors scan it to instantly access patient information and prescription history.

### 6. Role-Based Authentication 🔒
Separate flows for patients and doctors with Supabase Auth. Doctors can view patient profiles via QR scan; patients manage their own data.

---

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Frontend    │
│   (TypeScript)      │
├─────────────────────┤
│  Web Speech API     │  ← Voice Recognition
│  SpeechSynthesis    │  ← Text-to-Speech
│  html5-qrcode      │  ← QR Scanning
│  Supabase Auth      │  ← Client-side auth
└────────┬────────────┘
         │ REST API
         ▼
┌─────────────────────┐
│   FastAPI Backend   │
│   (Python)          │
├─────────────────────┤
│  Prescription Parser│  ← Regex pattern matching
│  OCR Service        │  ← Tesseract
│  QR Service         │  ← qrcode library
│  Reminder Service   │  ← Interval calculation
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Supabase          │
│   PostgreSQL        │
├─────────────────────┤
│  profiles           │
│  prescriptions      │
│  medications        │
│  reminders          │
└─────────────────────┘
```

---

## 📊 Data Flow

1. **Input** → User speaks, uploads image, or types prescription
2. **Processing** → Text extracted (OCR/Voice) → Parsed into medications
3. **Storage** → Prescription & medications saved to Supabase
4. **Reminders** → Frequency-based reminder schedules calculated
5. **Sharing** → QR code generated → Doctor scans for patient access

---

## 🔒 Security

- **Supabase Row Level Security (RLS)** — Users can only access their own data
- **Role-based access** — Doctor/Patient separation at both frontend and backend
- **JWT authentication** — Secure token-based API authorization
- **CORS protection** — Only whitelisted origins can access the API

---

## 👥 Target Users

| User Type | Features |
|-----------|----------|
| **Patients** | Voice input, OCR, reminders, QR profile |
| **Doctors** | QR scanning, patient profile access |
| **Elderly** | Voice interaction, text-to-speech |
| **Rural populations** | Simple UI, voice-first experience |

---

## 📄 License

This project was built for the **GCET 2025 Hackathon**.

---

<p align="center">
  <strong>MediMirror AI — Making healthcare accessible through technology.</strong>
</p>
