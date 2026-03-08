"""
MediMirror AI - Reminders Router
Handles medication reminder CRUD and scheduling.
"""

from fastapi import APIRouter, HTTPException, Header
from typing import List
from app.models.schemas import ReminderCreate, ReminderResponse
from app.services.supabase_service import supabase_service
from app.services.reminder_service import reminder_service

router = APIRouter(prefix="/reminders", tags=["Reminders"])


def _get_user_id(authorization: str) -> str:
    """Extract user ID from authorization token."""
    token = authorization.replace("Bearer ", "")
    user_response = supabase_service.get_user(token)
    return user_response.user.id


@router.post("/", response_model=ReminderResponse)
async def create_reminder(reminder: ReminderCreate, authorization: str = Header(...)):
    """Create a new medication reminder."""
    try:
        user_id = _get_user_id(authorization)

        # Calculate reminder times if not provided
        times = reminder.times
        if not times:
            times = reminder_service.calculate_reminder_times(reminder.frequency)

        reminder_data = {
            "user_id": user_id,
            "prescription_id": reminder.prescription_id,
            "medication_name": reminder.medication_name,
            "frequency": reminder.frequency,
            "start_date": reminder.start_date,
            "end_date": reminder.end_date,
            "times": times,
            "is_active": reminder.is_active,
        }

        created = supabase_service.create_reminder(reminder_data)
        return ReminderResponse(**created)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[ReminderResponse])
async def get_reminders(authorization: str = Header(...)):
    """Get all active reminders for the current user."""
    try:
        user_id = _get_user_id(authorization)
        reminders = supabase_service.get_reminders(user_id)
        return [ReminderResponse(**r) for r in reminders]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(
    reminder_id: str, update_data: dict, authorization: str = Header(...)
):
    """Update a reminder."""
    try:
        _get_user_id(authorization)
        updated = supabase_service.update_reminder(reminder_id, update_data)
        return ReminderResponse(**updated)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{reminder_id}")
async def delete_reminder(reminder_id: str, authorization: str = Header(...)):
    """Delete a reminder."""
    try:
        user_id = _get_user_id(authorization)
        supabase_service.delete_reminder(reminder_id, user_id)
        return {"message": "Reminder deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/auto-generate")
async def auto_generate_reminders(
    prescription_id: str, authorization: str = Header(...)
):
    """Automatically generate reminders from a prescription's medications."""
    try:
        user_id = _get_user_id(authorization)

        # Get medications for the prescription
        medications = supabase_service.get_medications(prescription_id)

        created_reminders = []
        for med in medications:
            frequency = med.get("frequency", "once daily")
            duration = med.get("duration")

            if frequency and frequency != "as needed":
                reminder_data = reminder_service.build_reminder_data(
                    user_id=user_id,
                    prescription_id=prescription_id,
                    medication_name=med.get("medicine_name", "Unknown"),
                    frequency=frequency,
                    duration=duration,
                )
                created = supabase_service.create_reminder(reminder_data)
                created_reminders.append(created)

        return {
            "message": f"Created {len(created_reminders)} reminders",
            "reminders": created_reminders,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
