from pathlib import Path

import fitz
from docx import Document
from pypdf import PdfReader


def clean_extracted_text(text: str) -> str:
    lines = []

    for line in text.splitlines():
        cleaned = " ".join(line.split())

        if cleaned:
            lines.append(cleaned)

    return "\n".join(lines).strip()


def extract_pdf_text_pymupdf(
    file_path: str,
) -> str:
    pages = []

    with fitz.open(file_path) as document:
        for page in document:
            text = page.get_text(
                "text",
                sort=True,
            )

            if text:
                pages.append(text)

    return clean_extracted_text(
        "\n".join(pages)
    )


def extract_pdf_text_pypdf(
    file_path: str,
) -> str:
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return clean_extracted_text(
        "\n".join(pages)
    )


def extract_pdf_text(
    file_path: str,
) -> str:
    text = extract_pdf_text_pymupdf(
        file_path
    )

    if text:
        return text

    return extract_pdf_text_pypdf(
        file_path
    )


def extract_docx_text(
    file_path: str,
) -> str:
    document = Document(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    return clean_extracted_text(
        "\n".join(paragraphs)
    )


def extract_resume_text(
    file_path: str,
    file_type: str,
) -> str:
    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return extract_pdf_text(file_path)

    if extension == ".docx":
        return extract_docx_text(file_path)

    raise ValueError(
        f"Unsupported resume file type: {file_type}"
    )