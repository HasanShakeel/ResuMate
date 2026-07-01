# =============================================================================
# Professional Resume Builder — REST API Routes
# =============================================================================
"""
REST API endpoints for resume CRUD, preview rendering, and PDF generation.

All routes are prefixed with /api/ and return JSON responses
(except preview and PDF download which return HTML/binary).
"""

from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import HTMLResponse, StreamingResponse

from app.api.deps import get_pdf_service, get_resume_service, get_template_service
from app.schemas.resume import (
    ResumeCreate,
    ResumeData,
    ResumeResponse,
    ResumeUpdate,
    TemplateInfo,
)
from app.services.pdf_service import PDFService
from app.services.resume_service import ResumeService
from app.services.template_service import TemplateService

import io

router = APIRouter(prefix="/api", tags=["api"])


# =============================================================================
# Health Check
# =============================================================================

@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring and Docker healthcheck."""
    return {"status": "healthy", "version": "1.0.0"}


# =============================================================================
# Resume CRUD
# =============================================================================

@router.post("/resumes", response_model=ResumeResponse, status_code=201)
async def create_resume(
    data: ResumeCreate,
    service: ResumeService = Depends(get_resume_service),
):
    """Create a new resume."""
    return await service.create_resume(data)


@router.get("/resumes/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    service: ResumeService = Depends(get_resume_service),
):
    """Fetch a resume by ID."""
    resume = await service.get_resume(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.get("/resumes/session/{session_id}", response_model=ResumeResponse)
async def get_resume_by_session(
    session_id: str,
    service: ResumeService = Depends(get_resume_service),
):
    """Fetch the latest resume for an anonymous session."""
    resume = await service.get_resume_by_session(session_id)
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found for this session")
    return resume


@router.put("/resumes/{resume_id}", response_model=ResumeResponse)
async def update_resume(
    resume_id: str,
    data: ResumeUpdate,
    service: ResumeService = Depends(get_resume_service),
):
    """Update an existing resume (full or partial)."""
    resume = await service.update_resume(resume_id, data)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    service: ResumeService = Depends(get_resume_service),
):
    """Delete a resume and all its sections."""
    deleted = await service.delete_resume(resume_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"detail": "Resume deleted successfully"}


# =============================================================================
# Preview — Render resume HTML from raw data (no DB required)
# =============================================================================

@router.post("/preview", response_class=HTMLResponse)
async def render_preview(
    data: ResumeData,
    template_svc: TemplateService = Depends(get_template_service),
):
    """
    Render a live preview of the resume.

    Accepts the full resume data and returns rendered HTML.
    This endpoint is called by the frontend on every form change
    (debounced) to update the live preview.
    """
    html = template_svc.render_resume(data)
    return HTMLResponse(content=html)


# =============================================================================
# PDF Download
# =============================================================================

@router.post("/download/pdf")
async def download_pdf(
    data: ResumeData,
    pdf_svc: PDFService = Depends(get_pdf_service),
):
    """
    Generate and download a PDF resume.

    Accepts the full resume data, renders it via the template engine,
    then generates a PDF using Playwright or WeasyPrint.
    """
    pdf_bytes = await pdf_svc.generate_pdf(data)

    # Build filename from name
    name_parts = [data.first_name, data.last_name]
    name = "_".join(p for p in name_parts if p) or "resume"
    filename = f"{name}_resume.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )


@router.post("/page-count")
async def get_page_count(
    data: ResumeData,
    pdf_svc: PDFService = Depends(get_pdf_service),
):
    """
    Count the number of pages in the generated PDF.

    Uses the same PDF engine as /download/pdf so the page count
    is guaranteed to match the actual downloaded file.
    """
    import re

    pdf_bytes = await pdf_svc.generate_pdf(data)
    # Parse PDF byte stream for page count.
    # The Pages dictionary contains /Count N which is the total page count.
    text = pdf_bytes.decode("latin-1")
    match = re.search(r"/Type\s*/Pages.*?/Count\s+(\d+)", text, re.DOTALL)
    if match:
        pages = int(match.group(1))
    else:
        # Fallback: count /Type /Page entries (not /Pages)
        pages = len(re.findall(r"/Type\s*/Page\b(?!s)", text))
    return {"pages": max(1, pages)}


# =============================================================================
# Templates
# =============================================================================

@router.get("/templates", response_model=list[TemplateInfo])
async def list_templates(
    template_svc: TemplateService = Depends(get_template_service),
):
    """List all available resume templates."""
    return template_svc.get_available_templates()


@router.get("/templates/{template_id}", response_model=TemplateInfo)
async def get_template(
    template_id: str,
    template_svc: TemplateService = Depends(get_template_service),
):
    """Get information about a specific template."""
    info = template_svc.get_template_info(template_id)
    if not info:
        raise HTTPException(status_code=404, detail="Template not found")
    return info
