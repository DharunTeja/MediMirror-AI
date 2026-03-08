const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
    private getHeaders(includeAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (includeAuth) {
            const token = localStorage.getItem('access_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || 'Something went wrong');
        }
        return response.json();
    }

    // ─── Auth ────────────────────────────────────────

    async signUp(data: { email: string; password: string; full_name: string; role: string }) {
        return this.request('/auth/signup', {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify(data),
        });
    }

    async signIn(data: { email: string; password: string }) {
        return this.request('/auth/signin', {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify(data),
        });
    }

    async getProfile() {
        return this.request('/auth/profile', {
            headers: this.getHeaders(),
        });
    }

    async updateProfile(data: Record<string, string>) {
        return this.request('/auth/profile', {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
    }

    async getProfileById(userId: string) {
        return this.request(`/auth/profile/${userId}`, {
            headers: this.getHeaders(false),
        });
    }

    // ─── Prescriptions ──────────────────────────────

    async parsePrescription(text: string) {
        return this.request('/prescriptions/parse', {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ text }),
        });
    }

    async ocrExtract(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('access_token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE}/prescriptions/ocr`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'OCR failed' }));
            throw new Error(error.detail || 'OCR extraction failed');
        }
        return response.json();
    }

    async createPrescription(data: { raw_text: string; source: string; medications: any[] }) {
        return this.request('/prescriptions/', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
    }

    async getPrescriptions() {
        return this.request('/prescriptions/', {
            headers: this.getHeaders(),
        });
    }

    async getPrescription(id: string) {
        return this.request(`/prescriptions/${id}`, {
            headers: this.getHeaders(),
        });
    }

    async deletePrescription(id: string) {
        return this.request(`/prescriptions/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
    }

    // ─── Reminders ──────────────────────────────────

    async createReminder(data: any) {
        return this.request('/reminders/', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });
    }

    async getReminders() {
        return this.request('/reminders/', {
            headers: this.getHeaders(),
        });
    }

    async deleteReminder(id: string) {
        return this.request(`/reminders/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
    }

    async autoGenerateReminders(prescriptionId: string) {
        return this.request(`/reminders/auto-generate?prescription_id=${prescriptionId}`, {
            method: 'POST',
            headers: this.getHeaders(),
        });
    }

    // ─── QR ──────────────────────────────────────────

    async generateQR() {
        return this.request('/qr/generate', {
            method: 'POST',
            headers: this.getHeaders(),
        });
    }

    async getPatientProfile(patientId: string) {
        return this.request(`/qr/patient/${patientId}`, {
            headers: this.getHeaders(),
        });
    }

    async decodeQR(content: string) {
        return this.request('/qr/decode', {
            method: 'POST',
            headers: this.getHeaders(false),
            body: JSON.stringify({ content }),
        });
    }
}

export const api = new ApiService();
