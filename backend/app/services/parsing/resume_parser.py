import io

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
    content: bytes,
) -> str:
    pages = []

    with fitz.open(
        stream=content,
        filetype="pdf",
    ) as document:
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
    content: bytes,
) -> str:
    reader = PdfReader(
        io.BytesIO(content)
    )

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return clean_extracted_text(
        "\n".join(pages)
    )


def extract_pdf_text(
    content: bytes,
) -> str:
    text = extract_pdf_text_pymupdf(
        content
    )

    if text:
        return text

    return extract_pdf_text_pypdf(
        content
    )


def extract_docx_text(
    content: bytes,
) -> str:
    document = Document(
        io.BytesIO(content)
    )

    paragraphs = []

    for paragraph in document.paragraphs:
        text = paragraph.text.strip()

        if text:
            paragraphs.append(text)

    return clean_extracted_text(
        "\n".join(paragraphs)
    )


def extract_resume_text(
    content: bytes,
    file_type: str,
) -> str:
    if file_type == ".pdf":
        return extract_pdf_text(content)

    if file_type == ".docx":
        return extract_docx_text(content)

    raise ValueError(
        f"Unsupported resume file type: {file_type}"
    )