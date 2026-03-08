"""
MediMirror AI - Prescription Router
Handles prescription CRUD, parsing, and OCR operations.
"""

from fastapi import APIRouter, HTTPException, Header, UploadFile, File
from typing import List
from app.models.schemas import (
    PrescriptionCreate,
    PrescriptionResponse,
    ParsePrescriptionRequest,
    ParsePrescriptionResponse,
    OCRResponse,
    MedicationItem,
)
from app.services.supabase_service import supabase_service
from app.services.prescription_parser import prescription_parser
from app.services.ocr_service import ocr_service

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


def _get_user_id(authorization: str) -> str:
    """Extract user ID from authorization token."""
    token = authorization.replace("Bearer ", "")
    user_response = supabase_service.get_user(token)
    return user_response.user.id


@router.post("/parse", response_model=ParsePrescriptionResponse)
async def parse_prescription(request: ParsePrescriptionRequest):
    """Parse raw prescription text into structured medication data."""
    try:
        medications = prescription_parser.parse(request.text)
        med_items = [MedicationItem(**med) for med in medications]
        return ParsePrescriptionResponse(medications=med_items, raw_text=request.text)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ocr", response_model=OCRResponse)
async def ocr_extract(file: UploadFile = File(...)):
    """Extract text from an uploaded prescription image or PDF."""
    try:
        contents = await file.read()
        content_type = file.content_type or ""

        if "pdf" in content_type.lower():
            extracted_text = ocr_service.extract_text_from_pdf(contents)
        elif any(
            img_type in content_type.lower()
            for img_type in ["image", "png", "jpg", "jpeg"]
        ):
            extracted_text = ocr_service.extract_text_from_image(contents)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload an image or PDF.",
            )

        # Parse the extracted text
        medications = prescription_parser.parse(extracted_text)
        med_items = [MedicationItem(**med) for med in medications]

        return OCRResponse(extracted_text=extracted_text, medications=med_items)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=PrescriptionResponse)
async def create_prescription(
    prescription: PrescriptionCreate, authorization: str = Header(...)
):
    """Create a new prescription record."""
    try:
        user_id = _get_user_id(authorization)

        # Store prescription
        prescription_data = {
            "user_id": user_id,
            "raw_text": prescription.raw_text,
            "source": prescription.source,
        }
        created = supabase_service.create_prescription(prescription_data)

        # Store medications
        if prescription.medications:
            med_list = [med.model_dump() for med in prescription.medications]
            supabase_service.create_medications(created["id"], med_list)

        return PrescriptionResponse(
            id=created.get("id"),
            user_id=user_id,
            raw_text=prescription.raw_text,
            source=prescription.source,
            medications=prescription.medications,
            created_at=created.get("created_at"),
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[PrescriptionResponse])
async def get_prescriptions(authorization: str = Header(...)):
    """Get all prescriptions for the current user."""
    try:
        user_id = _get_user_id(authorization)
        prescriptions = supabase_service.get_prescriptions(user_id)

        results = []
        for rx in prescriptions:
            meds = supabase_service.get_medications(rx["id"])
            med_items = [MedicationItem(**med) for med in meds]
            results.append(
                PrescriptionResponse(
                    id=rx.get("id"),
                    user_id=user_id,
                    raw_text=rx.get("raw_text", ""),
                    source=rx.get("source", "manual"),
                    medications=med_items,
                    created_at=rx.get("created_at"),
                )
            )

        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
async def get_prescription(prescription_id: str, authorization: str = Header(...)):
    """Get a single prescription by ID."""
    try:
        user_id = _get_user_id(authorization)
        rx = supabase_service.get_prescription(prescription_id)

        if not rx:
            raise HTTPException(status_code=404, detail="Prescription not found")

        meds = supabase_service.get_medications(prescription_id)
        med_items = [MedicationItem(**med) for med in meds]

        return PrescriptionResponse(
            id=rx.get("id"),
            user_id=user_id,
            raw_text=rx.get("raw_text", ""),
            source=rx.get("source", "manual"),
            medications=med_items,
            created_at=rx.get("created_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{prescription_id}")
async def delete_prescription(prescription_id: str, authorization: str = Header(...)):
    """Delete a prescription."""
    try:
        user_id = _get_user_id(authorization)
        supabase_service.delete_prescription(prescription_id, user_id)
        return {"message": "Prescription deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
