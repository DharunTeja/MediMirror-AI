"""
MediMirror AI - QR Code Router
Handles QR code generation and patient profile access for doctors.
"""

from fastapi import APIRouter, HTTPException, Header
from app.models.schemas import QRProfileRequest, QRProfileResponse
from app.services.supabase_service import supabase_service
from app.services.qr_service import qr_service

router = APIRouter(prefix="/qr", tags=["QR Code"])


def _get_user_id(authorization: str) -> str:
    """Extract user ID from authorization token."""
    token = authorization.replace("Bearer ", "")
    user_response = supabase_service.get_user(token)
    return user_response.user.id


@router.post("/generate", response_model=QRProfileResponse)
async def generate_qr(authorization: str = Header(...)):
    """Generate a QR code for the current user's medical profile."""
    try:
        user_id = _get_user_id(authorization)
        profile = supabase_service.get_profile(user_id)

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        result = qr_service.generate_profile_qr(profile)
        return QRProfileResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/patient/{patient_id}")
async def get_patient_profile(patient_id: str, authorization: str = Header(...)):
    """
    Get patient profile data (for doctor access after QR scan).
    Requires doctor role authentication.
    """
    try:
        user_id = _get_user_id(authorization)

        # Verify the requesting user is a doctor
        doctor_profile = supabase_service.get_profile(user_id)
        if not doctor_profile or doctor_profile.get("role") != "doctor":
            raise HTTPException(
                status_code=403, detail="Only doctors can access patient profiles"
            )

        # Get patient profile
        patient_profile = supabase_service.get_profile(patient_id)
        if not patient_profile:
            raise HTTPException(status_code=404, detail="Patient not found")

        # Get patient's prescriptions with medications
        prescriptions = supabase_service.get_prescriptions(patient_id)
        prescription_data = []
        for rx in prescriptions:
            meds = supabase_service.get_medications(rx["id"])
            prescription_data.append({**rx, "medications": meds})

        return {
            "profile": patient_profile,
            "prescriptions": prescription_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/decode")
async def decode_qr(data: dict):
    """Decode QR code content."""
    try:
        content = data.get("content", "")
        decoded = qr_service.decode_qr_data(content)

        if not decoded:
            raise HTTPException(
                status_code=400, detail="Invalid QR code content"
            )

        return decoded
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
