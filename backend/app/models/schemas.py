"""
MediMirror AI - Pydantic Models
Defines request/response schemas for the API.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── Enums ─────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    PATIENT = "patient"
    DOCTOR = "doctor"


class MealTiming(str, Enum):
    BEFORE_MEAL = "before_meal"
    AFTER_MEAL = "after_meal"
    WITH_MEAL = "with_meal"
    ANYTIME = "anytime"


# ─── User Schemas ──────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: Optional[str] = None
    email: str
    full_name: str
    role: UserRole = UserRole.PATIENT
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None
    created_at: Optional[str] = None


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    medical_conditions: Optional[str] = None
    emergency_contact: Optional[str] = None


# ─── Medication Schemas ────────────────────────────────────────────────

class MedicationItem(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[MealTiming] = MealTiming.ANYTIME
    duration: Optional[str] = None
    notes: Optional[str] = None


class PrescriptionCreate(BaseModel):
    raw_text: str
    source: str = "manual"  # manual | voice | ocr
    medications: List[MedicationItem] = []


class PrescriptionResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    raw_text: str
    source: str
    medications: List[MedicationItem] = []
    created_at: Optional[str] = None


class ParsePrescriptionRequest(BaseModel):
    text: str


class ParsePrescriptionResponse(BaseModel):
    medications: List[MedicationItem]
    raw_text: str


# ─── Reminder Schemas ─────────────────────────────────────────────────

class ReminderCreate(BaseModel):
    prescription_id: str
    medication_name: str
    frequency: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    times: List[str] = []  # ["08:00", "20:00"]
    is_active: bool = True


class ReminderResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    prescription_id: str
    medication_name: str
    frequency: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    times: List[str] = []
    is_active: bool = True
    created_at: Optional[str] = None


# ─── QR Schemas ────────────────────────────────────────────────────────

class QRProfileRequest(BaseModel):
    user_id: str


class QRProfileResponse(BaseModel):
    qr_base64: str
    profile_url: str


# ─── OCR Schemas ───────────────────────────────────────────────────────

class OCRResponse(BaseModel):
    extracted_text: str
    medications: List[MedicationItem] = []


# ─── Auth Schemas ──────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole = UserRole.PATIENT


class SignInRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    user: Optional[dict] = None
    message: str = "Success"
