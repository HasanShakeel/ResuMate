# =============================================================================
# Professional Resume Builder — PDF Generation Service
# =============================================================================
"""
PDF generation engine with Playwright (primary) and WeasyPrint (fallback).

The service renders resume HTML (from the template service) to a
professionally formatted PDF with proper page sizing, margins, and fonts.
"""

import asyncio
import logging
from pathlib import Path
from typing import Optional

from app.core.config import settings
from app.schemas.resume import ResumeData
from app.services.template_service import template_service

logger = logging.getLogger(__name__)

# Page dimensions in CSS units
PAGE_SIZES = {
    "A4": {"width": "210mm", "height": "297mm"},
    "Letter": {"width": "8.5in", "height": "11in"},
}


class PDFService:
    """
    Service for generating PDF resumes.

    Supports two engines:
    - **Playwright**: Uses headless Chromium for pixel-perfect rendering.
      Best quality, but requires Chromium to be installed.
    - **WeasyPrint**: Pure Python PDF rendering. Good quality, lighter weight.
      Used as a fallback if Playwright is unavailable.
    """

    def __init__(self):
        self._playwright = None
        self._browser = None

    async def generate_pdf(
        self,
        data: ResumeData,
        template_id: Optional[str] = None,
    ) -> bytes:
        """
        Generate a PDF from resume data.

        Args:
            data: Complete resume data.
            template_id: Override template (defaults to data.template_id).

        Returns:
            PDF file content as bytes.
        """
        # Render HTML from template
        html = template_service.render_resume(data, template_id)

        # Generate PDF using configured engine
        engine = settings.pdf_engine.lower()

        if engine == "playwright":
            try:
                return await self._generate_with_playwright(html, data.page_size)
            except Exception as e:
                logger.warning(
                    f"Playwright PDF generation failed: {e}. "
                    f"Falling back to WeasyPrint."
                )
                return self._generate_with_weasyprint(html, data.page_size)
        else:
            try:
                return self._generate_with_weasyprint(html, data.page_size)
            except Exception as e:
                logger.warning(
                    f"WeasyPrint PDF generation failed: {e}. "
                    f"Falling back to Playwright."
                )
                return await self._generate_with_playwright(html, data.page_size)

    async def _generate_with_playwright(
        self, html: str, page_size: str = "A4"
    ) -> bytes:
        """
        Generate PDF using Playwright (headless Chromium).

        This produces the highest quality output with perfect CSS rendering,
        font embedding, and page break handling.
        """
        from starlette.concurrency import run_in_threadpool
        
        def _sync_generate():
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(
                    headless=True,
                    args=[
                        "--disable-gpu",
                        "--no-sandbox",
                        "--disable-setuid-sandbox",
                        "--disable-dev-shm-usage",
                    ],
                )
                try:
                    page = browser.new_page()
                    
                    # Serve HTML from a dummy URL to bypass about:blank CORS restrictions on Google Fonts
                    page.route("http://resume.local/", lambda route: route.fulfill(content_type="text/html", body=html))
                    page.goto("http://resume.local/", wait_until="networkidle")
                    
                    page.evaluate("document.fonts.ready")
                    page.wait_for_timeout(1000)
                    
                    pdf_bytes = page.pdf(
                        format=page_size if page_size in ("A4", "Letter") else "A4",
                        print_background=True,
                        prefer_css_page_size=False, # Force Playwright to constrain to exact A4 bounds
                        margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
                        scale=0.92, # Aggressively scale down to ensure 1-page fit on Linux
                    )
                    return pdf_bytes
                finally:
                    browser.close()

        return await run_in_threadpool(_sync_generate)

    def _generate_with_weasyprint(
        self, html: str, page_size: str = "A4"
    ) -> bytes:
        """
        Generate PDF using WeasyPrint (fallback engine).

        Good quality, pure-Python solution. Doesn't require Chromium
        but may have minor CSS rendering differences.
        """
        try:
            from weasyprint import HTML

            pdf_bytes = HTML(string=html).write_pdf()
            return pdf_bytes
        except ImportError:
            logger.error(
                "WeasyPrint is not installed. Install it with: "
                "pip install weasyprint"
            )
            raise RuntimeError(
                "No PDF engine available. Install either Playwright or WeasyPrint."
            )

    async def save_pdf(
        self,
        data: ResumeData,
        filename: str,
        template_id: Optional[str] = None,
    ) -> Path:
        """
        Generate a PDF and save it to the exports directory.

        Args:
            data: Complete resume data.
            filename: Output filename (without path).
            template_id: Override template.

        Returns:
            Path to the saved PDF file.
        """
        pdf_bytes = await self.generate_pdf(data, template_id)

        output_path = settings.export_path / filename
        output_path.write_bytes(pdf_bytes)

        logger.info(f"PDF saved to: {output_path}")
        return output_path


# Singleton instance
pdf_service = PDFService()
