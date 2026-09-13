"""
Extracts plain text from an uploaded resume PDF so it can be sent to
the AI model for analysis.
"""
import io
import pdfplumber
from fastapi import HTTPException


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Returns the concatenated text of every page in the PDF.
    Raises HTTPException(400) if no extractable text is found
    (e.g. a scanned image PDF with no OCR layer).
    """
    text_chunks = []
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(page_text)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read PDF: {exc}")

    full_text = "\n".join(text_chunks).strip()
    if not full_text:
        raise HTTPException(
            status_code=400,
            detail="No selectable text found in this PDF. If it's a scanned "
            "image, please upload a text-based PDF instead.",
        )
    return full_text
