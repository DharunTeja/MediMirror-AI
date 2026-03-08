// ─── User Types ─────────────────────────────────────

export type UserRole = 'patient' | 'doctor';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone?: string;
    date_of_birth?: string;
    blood_group?: string;
    allergies?: string;
    medical_conditions?: string;
    emergency_contact?: string;
    created_at?: string;
}

export interface UserProfileUpdate {
    full_name?: string;
    phone?: string;
    date_of_birth?: string;
    blood_group?: string;
    allergies?: string;
    medical_conditions?: string;
    emergency_contact?: string;
}

// ─── Auth Types ──────────────────────────────────────

export interface SignUpData {
    email: string;
    password: string;
    full_name: string;
    role: UserRole;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    user?: {
        id: string;
        email: string;
        role: string;
        full_name?: string;
    };
    message: string;
}

// ─── Medication Types ────────────────────────────────

export type MealTiming = 'before_meal' | 'after_meal' | 'with_meal' | 'anytime';

export interface MedicationItem {
    medicine_name: string;
    dosage?: string;
    frequency?: string;
    timing?: MealTiming;
    duration?: string;
    notes?: string;
}

// ─── Prescription Types ──────────────────────────────

export type PrescriptionSource = 'manual' | 'voice' | 'ocr';

export interface Prescription {
    id?: string;
    user_id?: string;
    raw_text: string;
    source: PrescriptionSource;
    medications: MedicationItem[];
    created_at?: string;
}

export interface ParseResponse {
    medications: MedicationItem[];
    raw_text: string;
}

export interface OCRResponse {
    extracted_text: string;
    medications: MedicationItem[];
}

// ─── Reminder Types ──────────────────────────────────

export interface Reminder {
    id?: string;
    user_id?: string;
    prescription_id: string;
    medication_name: string;
    frequency: string;
    start_date?: string;
    end_date?: string;
    times: string[];
    is_active: boolean;
    created_at?: string;
}

// ─── QR Types ────────────────────────────────────────

export interface QRProfileResponse {
    qr_base64: string;
    profile_url: string;
}
