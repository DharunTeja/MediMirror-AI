"""
MediMirror AI - Reminder Service
Handles medication reminder scheduling and interval calculations.
"""

from typing import List, Dict, Optional
from datetime import datetime, timedelta


class ReminderService:
    """Service for calculating and managing medication reminders."""

    # Frequency to interval mapping (in hours)
    FREQUENCY_INTERVALS = {
        "once daily": 24,
        "twice daily": 12,
        "three times daily": 8,
        "four times daily": 6,
        "every 4 hours": 4,
        "every 6 hours": 6,
        "every 8 hours": 8,
        "every 12 hours": 12,
        "at bedtime": 24,
        "weekly": 168,
        "as needed": 0,
    }

    @staticmethod
    def calculate_reminder_times(
        frequency: str, start_hour: int = 8
    ) -> List[str]:
        """
        Calculate reminder times based on medication frequency.

        Args:
            frequency: Medication frequency string (e.g., "twice daily")
            start_hour: Starting hour for the first dose (24h format)

        Returns:
            List of time strings in HH:MM format
        """
        frequency_lower = frequency.lower().strip()

        # Direct mapping
        intervals = {
            "once daily": [f"{start_hour:02d}:00"],
            "twice daily": [f"{start_hour:02d}:00", f"{(start_hour + 12) % 24:02d}:00"],
            "three times daily": [
                f"{start_hour:02d}:00",
                f"{(start_hour + 8) % 24:02d}:00",
                f"{(start_hour + 16) % 24:02d}:00",
            ],
            "four times daily": [
                f"{start_hour:02d}:00",
                f"{(start_hour + 6) % 24:02d}:00",
                f"{(start_hour + 12) % 24:02d}:00",
                f"{(start_hour + 18) % 24:02d}:00",
            ],
            "at bedtime": ["22:00"],
            "as needed": [],
        }

        if frequency_lower in intervals:
            return intervals[frequency_lower]

        # Handle "every X hours" pattern
        import re
        match = re.search(r"every\s+(\d+)\s+hours?", frequency_lower)
        if match:
            interval = int(match.group(1))
            times = []
            hour = start_hour
            for _ in range(24 // interval):
                times.append(f"{hour:02d}:00")
                hour = (hour + interval) % 24
            return times

        # Default to once daily
        return [f"{start_hour:02d}:00"]

    @staticmethod
    def calculate_end_date(
        start_date: str, duration: str
    ) -> Optional[str]:
        """
        Calculate end date from start date and duration.

        Args:
            start_date: Start date in ISO format
            duration: Duration string like "7 days" or "2 weeks"

        Returns:
            End date in ISO format
        """
        import re

        try:
            start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            start = datetime.now()

        match = re.search(r"(\d+)\s*(day|week|month)", duration.lower())
        if not match:
            return None

        number = int(match.group(1))
        unit = match.group(2)

        if unit == "day":
            end = start + timedelta(days=number)
        elif unit == "week":
            end = start + timedelta(weeks=number)
        elif unit == "month":
            end = start + timedelta(days=number * 30)
        else:
            return None

        return end.isoformat()

    @staticmethod
    def build_reminder_data(
        user_id: str,
        prescription_id: str,
        medication_name: str,
        frequency: str,
        duration: Optional[str] = None,
    ) -> dict:
        """
        Build a complete reminder data object.

        Args:
            user_id: User ID
            prescription_id: Associated prescription ID
            medication_name: Name of the medication
            frequency: Medication frequency
            duration: Optional duration string

        Returns:
            Dictionary ready for database insertion
        """
        now = datetime.now().isoformat()
        times = ReminderService.calculate_reminder_times(frequency)

        end_date = None
        if duration:
            end_date = ReminderService.calculate_end_date(now, duration)

        return {
            "user_id": user_id,
            "prescription_id": prescription_id,
            "medication_name": medication_name,
            "frequency": frequency,
            "start_date": now,
            "end_date": end_date,
            "times": times,
            "is_active": True,
        }


# Singleton instance
reminder_service = ReminderService()
