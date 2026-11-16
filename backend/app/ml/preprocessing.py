import re

def clean_resume_text(text: str) -> str:
    """
    Cleans raw resume text while preserving technical symbols like C++, C#, .NET, Node.js.
    Normalizes whitespace and Unicode characters.
    """
    if not text:
        return ""

    # Normalize carriage returns and tabs
    text = text.replace('\r\n', '\n').replace('\r', '\n').replace('\t', ' ')

    # Remove non-printable / control characters except newline
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', ' ', text)

    # Collapse multiple consecutive horizontal spaces
    text = re.sub(r'[ ]{2,}', ' ', text)

    # Collapse excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()

def normalize_text_for_search(text: str) -> str:
    """
    Lowercases text while keeping punctuation intact for technical token matching.
    """
    return text.lower().strip()

