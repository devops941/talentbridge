import fitz  # PyMuPDF
from typing import Tuple, Dict
from app.ml.preprocessing import clean_resume_text

def extract_text_from_pdf(pdf_path: str) -> Tuple[str, Dict]:
    """
    Extracts text page-by-page from a PDF document using PyMuPDF.
    Returns the concatenated cleaned text and metadata (page count, quality check, status).
    """
    doc = None
    try:
        doc = fitz.open(pdf_path)
        page_count = len(doc)
        full_text = []

        for page_num in range(page_count):
            page = doc.load_page(page_num)
            text = page.get_text("text")
            full_text.append(text)

        raw_text = "\n".join(full_text)
        cleaned = clean_resume_text(raw_text)

        # Quality Check: At least 50 characters of readable text
        if len(cleaned.strip()) < 50:
            status = "PARTIAL"
            warning = "Extracted text is very short or document is image-scanned."
        else:
            status = "COMPLETED"
            warning = None

        metadata = {
            "page_count": page_count,
            "character_count": len(cleaned),
            "status": status,
            "warning": warning
        }
        return cleaned, metadata

    except Exception as e:
        return "", {
            "page_count": 0,
            "character_count": 0,
            "status": "FAILED",
            "warning": str(e)
        }
    finally:
        if doc:
            doc.close()

