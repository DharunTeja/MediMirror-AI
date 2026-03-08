"""
MediMirror AI - OCR Service
Handles OCR text extraction from prescription images and PDFs.
"""

import io
import tempfile
import os
from typing import Optional
from PIL import Image

try:
    import pytesseract
    from app.config import settings

    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
except Exception:
    pytesseract = None


class OCRService:
    """Service for extracting text from images and PDFs using Tesseract OCR."""

    @staticmethod
    def extract_text_from_image(image_bytes: bytes) -> str:
        """
        Extract text from an image using Tesseract OCR.

        Args:
            image_bytes: Raw bytes of the image file

        Returns:
            Extracted text string
        """
        if pytesseract is None:
            return OCRService._fallback_response()

        try:
            image = Image.open(io.BytesIO(image_bytes))
            # Preprocess: convert to grayscale for better OCR
            image = image.convert("L")
            # Run OCR
            text = pytesseract.image_to_string(image, lang="eng")
            return text.strip()
        except Exception as e:
            raise ValueError(f"OCR extraction failed: {str(e)}")

    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> str:
        """
        Extract text from a PDF file by converting pages to images.

        Args:
            pdf_bytes: Raw bytes of the PDF file

        Returns:
            Extracted text string from all pages
        """
        try:
            from pdf2image import convert_from_bytes

            images = convert_from_bytes(pdf_bytes, first_page=1, last_page=3)
            full_text = []

            for i, img in enumerate(images):
                img_gray = img.convert("L")
                if pytesseract:
                    text = pytesseract.image_to_string(img_gray, lang="eng")
                    full_text.append(text.strip())

            return "\n".join(full_text)
        except ImportError:
            raise ValueError(
                "PDF processing requires poppler. Install poppler-utils."
            )
        except Exception as e:
            raise ValueError(f"PDF OCR extraction failed: {str(e)}")

    @staticmethod
    def _fallback_response() -> str:
        """Return a message when Tesseract is not available."""
        return (
            "OCR service unavailable. Please ensure Tesseract OCR is installed. "
            "You can still enter prescription text manually or use voice input."
        )


# Singleton instance
ocr_service = OCRService()
