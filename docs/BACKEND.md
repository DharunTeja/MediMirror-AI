# MediMirror AI — Backend Documentation

## Overview

The MediMirror AI backend is a **Python FastAPI** application that provides REST API endpoints for prescription processing, OCR extraction, medication parsing, reminder scheduling, and QR-based patient profile management.

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| FastAPI | Web framework |
| Uvicorn | ASGI server |
| Supabase | Database & auth (PostgreSQL) |
| pytesseract | OCR text extraction |
| Pillow (PIL) | Image processing |
| pdf2image | PDF to image conversion |
| qrcode | QR code generation |
| Pydantic | Data validation & schemas |
| python-dotenv | Environment configuration |

---

## Project Structure

```
backend/
├── main.py                      # FastAPI application entry point
├── requirements.txt             # Python dependencies
├── schema.sql                   # Supabase database schema
├── .env.example                 # Environment variables template
│
└── app/
    ├── __init__.py
    ├── config.py                # Settings & env variable management
    │
    ├── models/
    │   ├── __init__.py
    │   └── schemas.py           # Pydantic request/response models
    │
    ├── routers/                 # API route handlers
    │   ├── __init__.py
    │   ├── auth.py              # /api/auth/* endpoints
    │   ├── prescriptions.py     # /api/prescriptions/* endpoints
    │   ├── reminders.py         # /api/reminders/* endpoints
    │   └── qr.py                # /api/qr/* endpoints
    │
    ├── services/                # Business logic layer
    │   ├── __init__.py
    │   ├── supabase_service.py  # Database operations
    │   ├── prescription_parser.py # Regex-based text parsing
    │   ├── ocr_service.py       # Tesseract OCR processing
    │   ├── qr_service.py        # QR code generation/decoding
    │   └── reminder_service.py  # Reminder scheduling logic
    │
    └── utils/
        └── __init__.py
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/signin` | Sign in existing user | ❌ |
| GET | `/api/auth/profile` | Get current user's profile | ✅ |
| PUT | `/api/auth/profile` | Update current user's profile | ✅ |
| GET | `/api/auth/profile/{user_id}` | Get profile by ID (doctor access) | ❌ |

### Prescriptions (`/api/prescriptions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/api/prescriptions/parse` | Parse text → medications | ❌ |
| POST | `/api/prescriptions/ocr` | Upload image/PDF → OCR extract | ❌ |
| POST | `/api/prescriptions/` | Save a prescription | ✅ |
| GET | `/api/prescriptions/` | Get all user prescriptions | ✅ |
| GET | `/api/prescriptions/{id}` | Get specific prescription | ✅ |
| DELETE | `/api/prescriptions/{id}` | Delete prescription | ✅ |

### Reminders (`/api/reminders`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/api/reminders/` | Create a reminder | ✅ |
| GET | `/api/reminders/` | Get active reminders | ✅ |
| PUT | `/api/reminders/{id}` | Update a reminder | ✅ |
| DELETE | `/api/reminders/{id}` | Delete a reminder | ✅ |
| POST | `/api/reminders/auto-generate` | Auto-create reminders from prescription | ✅ |

### QR Code (`/api/qr`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:---:|
| POST | `/api/qr/generate` | Generate patient QR code | ✅ |
| GET | `/api/qr/patient/{patient_id}` | Get patient data (doctor only) | ✅ |
| POST | `/api/qr/decode` | Decode QR content | ❌ |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API info & status |
| GET | `/api/health` | Health check |

---

## Core Services

### Prescription Parser (`services/prescription_parser.py`)

The parser uses **regex pattern matching** to extract structured medication data from raw text.

#### Extracted Attributes
| Attribute | Examples |
|-----------|---------|
| **Medicine Name** | Tab. Paracetamol, Cap. Amoxicillin |
| **Dosage** | 500mg, 250ml, 10mcg |
| **Frequency** | once daily, twice daily, TID, every 8 hours |
| **Timing** | before meal, after meal, with meal |
| **Duration** | for 5 days, 2 weeks, 1 month |

#### Key Patterns

```python
# Dosage detection
r"(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|IU|tablets?|capsules?))"

# Frequency detection
r"\btwice\s+(?:a\s+)?daily\b"  → "twice daily"
r"\b[tT][iI][dD]\b"            → "three times daily"
r"\bevery\s+(\d+)\s+hours?\b"  → "every {N} hours"

# Timing detection
r"\bbefore\s+(?:food|meals?)\b" → "before_meal"
r"\bafter\s+(?:food|meals?)\b"  → "after_meal"

# Duration detection
r"(?:for|x)\s+(\d+)\s*(days?|weeks?|months?)"
```

### OCR Service (`services/ocr_service.py`)

Uses **Tesseract OCR** (via pytesseract) to extract text from:
- **Images** (JPG, PNG) — converted to grayscale for better accuracy
- **PDFs** — first 3 pages converted to images via pdf2image, then OCR'd

#### Processing Flow
```
Image Upload → Grayscale Conversion → Tesseract OCR → Raw Text
           ↓
PDF Upload → Page-to-Image Conversion → Grayscale → Tesseract OCR → Raw Text
```

### QR Service (`services/qr_service.py`)

- **Generation**: Encodes patient profile as JSON → generates QR code image → returns base64 PNG
- **Decoding**: Validates QR content contains `medimirror_profile` type marker

QR data format:
```json
{
  "type": "medimirror_profile",
  "id": "user-uuid",
  "name": "Patient Name",
  "email": "patient@email.com",
  "blood": "B+",
  "allergies": "Penicillin",
  "conditions": "Diabetes",
  "emergency": "Contact Name — Phone",
  "dob": "1990-01-01",
  "phone": "+91..."
}
```

### Reminder Service (`services/reminder_service.py`)

Calculates reminder times based on medication frequency:

| Frequency | Reminder Times |
|-----------|---------------|
| Once daily | 08:00 |
| Twice daily | 08:00, 20:00 |
| Three times daily | 08:00, 16:00, 00:00 |
| Four times daily | 08:00, 14:00, 20:00, 02:00 |
| At bedtime | 22:00 |
| Every N hours | Calculated from start hour |

Also calculates end dates from duration strings (e.g., "7 days" → start_date + 7 days).

### Supabase Service (`services/supabase_service.py`)

Database operations layer providing CRUD for:
- **Profiles** — create, get, update, get by email
- **Prescriptions** — create, get all, get by ID, delete
- **Medications** — create batch, get by prescription, get all for user
- **Reminders** — create, get active, update, delete

---

## Database Schema

### Tables

#### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users |
| email | TEXT | User email |
| full_name | TEXT | Display name |
| role | TEXT | 'patient' or 'doctor' |
| phone | TEXT | Phone number |
| date_of_birth | TEXT | Date of birth |
| blood_group | TEXT | Blood type |
| allergies | TEXT | Known allergies |
| medical_conditions | TEXT | Medical conditions |
| emergency_contact | TEXT | Emergency contact info |

#### `prescriptions`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References profiles |
| raw_text | TEXT | Original prescription text |
| source | TEXT | 'manual', 'voice', or 'ocr' |

#### `medications`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| prescription_id | UUID (FK) | References prescriptions |
| medicine_name | TEXT | Name of medication |
| dosage | TEXT | Dosage info |
| frequency | TEXT | How often |
| timing | TEXT | Meal timing |
| duration | TEXT | Treatment duration |
| notes | TEXT | Additional notes |

#### `reminders`
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References profiles |
| prescription_id | UUID (FK) | References prescriptions |
| medication_name | TEXT | Medication name |
| frequency | TEXT | Dosing frequency |
| times | TEXT[] | Array of HH:MM strings |
| is_active | BOOLEAN | Whether reminder is active |

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only SELECT/UPDATE/DELETE their own records
- INSERT policies verify ownership
- Medications are accessible if user owns the parent prescription

### Auto-Profile Trigger

A PostgreSQL trigger automatically creates a profile row when a new user signs up via Supabase Auth, using metadata from `raw_user_meta_data`.

---

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
```

---

## Running the Server

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your credentials

# Start server
python main.py
# or
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API server runs at `http://localhost:8000` with:
- **Swagger docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## CORS Configuration

The backend allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative)
- `http://127.0.0.1:5173`

Add additional origins in `app/config.py`.

---

## Error Handling

All endpoints return standard HTTP error responses:
- `400` — Bad request / validation error
- `401` — Invalid or expired authentication
- `403` — Forbidden (e.g., non-doctor accessing patient data)
- `404` — Resource not found
- `500` — Internal server error

Error response format:
```json
{
  "detail": "Error description message"
}
```
