"""
MediMirror AI - Supabase Database Service
Handles all database operations through Supabase client.
"""

from supabase import create_client, Client
from app.config import settings
from typing import Optional, List, Dict, Any


class SupabaseService:
    """Service for handling Supabase database operations."""

    def __init__(self):
        self._client: Optional[Client] = None

    @property
    def client(self) -> Client:
        if self._client is None:
            if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
                raise ValueError(
                    "Supabase URL and Key must be set in environment variables."
                )
            self._client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        return self._client

    # ─── Auth Operations ───────────────────────────────────────────

    def sign_up(self, email: str, password: str, metadata: dict = None) -> dict:
        """Register a new user with Supabase Auth."""
        options = {}
        if metadata:
            options["data"] = metadata
        response = self.client.auth.sign_up(
            {"email": email, "password": password, "options": options}
        )
        return response

    def sign_in(self, email: str, password: str) -> dict:
        """Sign in a user with email and password."""
        response = self.client.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        return response

    def sign_out(self, access_token: str) -> None:
        """Sign out the current user."""
        self.client.auth.sign_out()

    def get_user(self, access_token: str) -> dict:
        """Get user details from access token."""
        response = self.client.auth.get_user(access_token)
        return response

    # ─── Profile Operations ────────────────────────────────────────

    def create_profile(self, profile_data: dict) -> dict:
        """Create a new user profile in the profiles table."""
        response = (
            self.client.table("profiles").insert(profile_data).execute()
        )
        return response.data[0] if response.data else {}

    def get_profile(self, user_id: str) -> Optional[dict]:
        """Get a user profile by user ID."""
        response = (
            self.client.table("profiles")
            .select("*")
            .eq("id", user_id)
            .execute()
        )
        return response.data[0] if response.data else None

    def update_profile(self, user_id: str, update_data: dict) -> dict:
        """Update a user profile."""
        response = (
            self.client.table("profiles")
            .update(update_data)
            .eq("id", user_id)
            .execute()
        )
        return response.data[0] if response.data else {}

    def get_profile_by_email(self, email: str) -> Optional[dict]:
        """Get a user profile by email."""
        response = (
            self.client.table("profiles")
            .select("*")
            .eq("email", email)
            .execute()
        )
        return response.data[0] if response.data else None

    # ─── Prescription Operations ───────────────────────────────────

    def create_prescription(self, prescription_data: dict) -> dict:
        """Create a new prescription record."""
        response = (
            self.client.table("prescriptions")
            .insert(prescription_data)
            .execute()
        )
        return response.data[0] if response.data else {}

    def get_prescriptions(self, user_id: str) -> List[dict]:
        """Get all prescriptions for a user."""
        response = (
            self.client.table("prescriptions")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []

    def get_prescription(self, prescription_id: str) -> Optional[dict]:
        """Get a single prescription by ID."""
        response = (
            self.client.table("prescriptions")
            .select("*")
            .eq("id", prescription_id)
            .execute()
        )
        return response.data[0] if response.data else None

    def delete_prescription(self, prescription_id: str, user_id: str) -> bool:
        """Delete a prescription."""
        response = (
            self.client.table("prescriptions")
            .delete()
            .eq("id", prescription_id)
            .eq("user_id", user_id)
            .execute()
        )
        return True

    # ─── Medication Operations ─────────────────────────────────────

    def create_medications(
        self, prescription_id: str, medications: List[dict]
    ) -> List[dict]:
        """Create medication entries for a prescription."""
        for med in medications:
            med["prescription_id"] = prescription_id
        response = (
            self.client.table("medications").insert(medications).execute()
        )
        return response.data or []

    def get_medications(self, prescription_id: str) -> List[dict]:
        """Get all medications for a prescription."""
        response = (
            self.client.table("medications")
            .select("*")
            .eq("prescription_id", prescription_id)
            .execute()
        )
        return response.data or []

    def get_all_user_medications(self, user_id: str) -> List[dict]:
        """Get all medications for a user across all prescriptions."""
        response = (
            self.client.table("medications")
            .select("*, prescriptions!inner(user_id)")
            .eq("prescriptions.user_id", user_id)
            .execute()
        )
        return response.data or []

    # ─── Reminder Operations ───────────────────────────────────────

    def create_reminder(self, reminder_data: dict) -> dict:
        """Create a medication reminder."""
        response = (
            self.client.table("reminders").insert(reminder_data).execute()
        )
        return response.data[0] if response.data else {}

    def get_reminders(self, user_id: str) -> List[dict]:
        """Get all active reminders for a user."""
        response = (
            self.client.table("reminders")
            .select("*")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .execute()
        )
        return response.data or []

    def update_reminder(self, reminder_id: str, update_data: dict) -> dict:
        """Update a reminder."""
        response = (
            self.client.table("reminders")
            .update(update_data)
            .eq("id", reminder_id)
            .execute()
        )
        return response.data[0] if response.data else {}

    def delete_reminder(self, reminder_id: str, user_id: str) -> bool:
        """Delete a reminder."""
        self.client.table("reminders").delete().eq("id", reminder_id).eq(
            "user_id", user_id
        ).execute()
        return True


# Singleton instance
supabase_service = SupabaseService()
