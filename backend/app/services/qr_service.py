"""
MediMirror AI - QR Code Service
Generates and processes QR codes for patient medical profiles.
"""

import io
import base64
import json
import qrcode
from typing import Optional


class QRCodeService:
    """Service for generating QR codes containing patient medical profiles."""

    @staticmethod
    def generate_profile_qr(profile_data: dict, base_url: str = "") -> dict:
        """
        Generate a QR code containing patient profile data.

        Args:
            profile_data: Patient profile information
            base_url: Base URL of the frontend application

        Returns:
            Dictionary with QR code as base64 string and profile URL
        """
        # Build a compact profile for QR encoding
        qr_data = {
            "type": "medimirror_profile",
            "id": profile_data.get("id", ""),
            "name": profile_data.get("full_name", ""),
            "email": profile_data.get("email", ""),
            "blood": profile_data.get("blood_group", ""),
            "allergies": profile_data.get("allergies", ""),
            "conditions": profile_data.get("medical_conditions", ""),
            "emergency": profile_data.get("emergency_contact", ""),
            "dob": profile_data.get("date_of_birth", ""),
            "phone": profile_data.get("phone", ""),
        }

        # Generate profile URL
        profile_url = f"{base_url}/doctor/scan?patient_id={qr_data['id']}"

        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=4,
        )
        qr.add_data(json.dumps(qr_data))
        qr.make(fit=True)

        img = qr.make_image(fill_color="#1a1a2e", back_color="white")

        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return {
            "qr_base64": f"data:image/png;base64,{qr_base64}",
            "profile_url": profile_url,
        }

    @staticmethod
    def decode_qr_data(qr_content: str) -> Optional[dict]:
        """
        Decode QR content string into profile data.

        Args:
            qr_content: JSON string from QR code

        Returns:
            Decoded profile data or None
        """
        try:
            data = json.loads(qr_content)
            if data.get("type") == "medimirror_profile":
                return data
            return None
        except (json.JSONDecodeError, TypeError):
            return None


# Singleton instance
qr_service = QRCodeService()
