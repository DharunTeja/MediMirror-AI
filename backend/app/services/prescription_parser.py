"""
MediMirror AI - Prescription Parser Service
Parses raw prescription text into structured medication data using regex patterns.
"""

import re
from typing import List, Dict, Optional


class PrescriptionParser:
    """
    Intelligent prescription parser that extracts medication details
    from raw text using regex pattern matching.
    """

    # Common medication name patterns
    MEDICINE_PATTERNS = [
        r"(?:Tab(?:let)?\.?|Cap(?:sule)?\.?|Syp?\.?|Inj\.?|Oint\.?|Susp\.?|Drop(?:s)?\.?)\s+([A-Za-z][A-Za-z0-9\-\s]+?)(?=\s+\d|\s*[-–—]\s|\s*$)",
        r"([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(\d+\s*(?:mg|ml|mcg|g|IU))",
    ]

    # Dosage patterns
    DOSAGE_PATTERNS = [
        r"(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|IU|tablet[s]?|cap(?:sule)?[s]?|drop[s]?|spoon(?:ful)?[s]?))",
        r"(\d+/\d+\s*(?:mg|ml))",
        r"(\d+-\d+\s*(?:mg|ml))",
    ]

    # Frequency patterns
    FREQUENCY_MAP = {
        r"\bonce\s+(?:a\s+)?dai?ly\b": "once daily",
        r"\bonce\s+a\s+day\b": "once daily",
        r"\b[oO][dD]\b": "once daily",
        r"\btwice\s+(?:a\s+)?dai?ly\b": "twice daily",
        r"\btwice\s+a\s+day\b": "twice daily",
        r"\b[bB][iI]?[dD]\b": "twice daily",
        r"\bthr(?:ice|ee\s+times)\s+(?:a\s+)?dai?ly?\b": "three times daily",
        r"\b[tT][iI][dD]\b": "three times daily",
        r"\bfour\s+times\s+(?:a\s+)?dai?ly?\b": "four times daily",
        r"\b[qQ][iI][dD]\b": "four times daily",
        r"\bevery\s+(\d+)\s+hours?\b": "every {0} hours",
        r"\bSOS\b": "as needed",
        r"\bas\s+(?:and\s+when\s+)?(?:needed|required)\b": "as needed",
        r"\bat\s+bedtime\b": "at bedtime",
        r"\b[hH][sS]\b": "at bedtime",
        r"\bweekly\b": "weekly",
        r"\bmonthly\b": "monthly",
    }

    # Timing patterns (before/after meals)
    TIMING_MAP = {
        r"\bbefore\s+(?:food|meal[s]?|eating|breakfast|lunch|dinner)\b": "before_meal",
        r"\bafter\s+(?:food|meal[s]?|eating|breakfast|lunch|dinner)\b": "after_meal",
        r"\bwith\s+(?:food|meal[s]?)\b": "with_meal",
        r"\bon\s+(?:an\s+)?empty\s+stomach\b": "before_meal",
        r"\bAC\b": "before_meal",
        r"\bPC\b": "after_meal",
    }

    # Duration patterns
    DURATION_PATTERNS = [
        r"(?:for|x)\s+(\d+)\s*(day[s]?|week[s]?|month[s]?)",
        r"(\d+)\s*(?:[-/])\s*(day[s]?|week[s]?|month[s]?)",
        r"(\d+)\s*[dD](?:ay)?[s]?",
    ]

    def parse(self, text: str) -> List[Dict]:
        """
        Parse raw prescription text and extract medication details.

        Args:
            text: Raw prescription text from voice or OCR

        Returns:
            List of medication dictionaries with name, dosage, frequency, timing, duration
        """
        if not text or not text.strip():
            return []

        # Split text into potential medication lines
        lines = self._split_into_medication_lines(text)
        medications = []

        for line in lines:
            med = self._parse_single_medication(line)
            if med and med.get("medicine_name"):
                medications.append(med)

        # If no structured meds found, try to parse the whole text as one
        if not medications and len(text.strip()) > 3:
            med = self._parse_single_medication(text)
            if med and med.get("medicine_name"):
                medications.append(med)

        return medications

    def _split_into_medication_lines(self, text: str) -> List[str]:
        """Split text into individual medication entries."""
        # Split by newlines, numbered items, semicolons, or bullet points
        lines = re.split(r"\n+|(?:\d+[.)]\s)|;\s*|•\s*|▪\s*|[-–—]\s+", text)
        # Filter empty lines
        return [line.strip() for line in lines if line.strip() and len(line.strip()) > 2]

    def _parse_single_medication(self, line: str) -> Dict:
        """Parse a single line/segment into medication details."""
        medication = {
            "medicine_name": "",
            "dosage": None,
            "frequency": None,
            "timing": "anytime",
            "duration": None,
            "notes": None,
        }

        # Extract medicine name
        medication["medicine_name"] = self._extract_medicine_name(line)

        # Extract dosage
        medication["dosage"] = self._extract_dosage(line)

        # Extract frequency
        medication["frequency"] = self._extract_frequency(line)

        # Extract timing
        medication["timing"] = self._extract_timing(line)

        # Extract duration
        medication["duration"] = self._extract_duration(line)

        return medication

    def _extract_medicine_name(self, text: str) -> str:
        """Extract medication name from text."""
        # Try structured patterns first (Tab., Cap., etc.)
        for pattern in self.MEDICINE_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                name = match.group(1).strip()
                # Clean up the name
                name = re.sub(r"\s+", " ", name)
                return name.title()

        # Fallback: take the first 1-3 capitalized words
        words = text.split()
        name_words = []
        for word in words:
            cleaned = re.sub(r"[^\w]", "", word)
            if cleaned and not re.match(
                r"^\d+$|^(?:mg|ml|mcg|daily|twice|once|after|before|for|days|weeks|tab|tablet|capsule)$",
                cleaned,
                re.IGNORECASE,
            ):
                name_words.append(cleaned)
                if len(name_words) >= 3:
                    break
            elif name_words:
                break

        return " ".join(name_words).title() if name_words else ""

    def _extract_dosage(self, text: str) -> Optional[str]:
        """Extract dosage information."""
        for pattern in self.DOSAGE_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return None

    def _extract_frequency(self, text: str) -> Optional[str]:
        """Extract medication frequency."""
        for pattern, freq_text in self.FREQUENCY_MAP.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                if "{0}" in freq_text:
                    return freq_text.format(match.group(1))
                return freq_text
        return None

    def _extract_timing(self, text: str) -> str:
        """Extract meal timing information."""
        for pattern, timing in self.TIMING_MAP.items():
            if re.search(pattern, text, re.IGNORECASE):
                return timing
        return "anytime"

    def _extract_duration(self, text: str) -> Optional[str]:
        """Extract treatment duration."""
        for pattern in self.DURATION_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                number = match.group(1)
                unit = match.group(2) if match.lastindex >= 2 else "days"
                return f"{number} {unit}"
        return None


# Singleton instance
prescription_parser = PrescriptionParser()
