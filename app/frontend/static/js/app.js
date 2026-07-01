// =============================================================================
// Main Application Entry Point
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Load saved state from localStorage
    ResumeStore.load();

    // Initialize stepper
    const stepperNav = document.getElementById('stepper-nav');
    StepperComponent.render(stepperNav);
    StepperComponent.goToStep(0);

    // Initialize live preview
    PreviewManager.init();

    // --- Navigation Buttons ---
    document.getElementById('btn-prev-step')?.addEventListener('click', () => StepperComponent.prev());
    document.getElementById('btn-next-step')?.addEventListener('click', () => StepperComponent.next());

    // --- Profiles Management moved to profiles-modal.js ---

    // --- Header Download Button ---
    document.getElementById('btn-download-pdf')?.addEventListener('click', async () => {
        const btn = document.getElementById('btn-download-pdf');
        btn.disabled = true;
        btn.innerHTML = '⏳ Generating...';
        try {
            const data = ResumeStore.getResumeData();
            const blob = await API.downloadPDF(data);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${data.first_name || 'resume'}_resume.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('PDF downloaded!', 'success');
        } catch (e) {
            showToast('PDF generation failed. ' + (e.message || ''), 'error');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF';
        }
    });

    // --- Preview Toggle (Mobile) ---
    document.getElementById('btn-toggle-preview')?.addEventListener('click', () => {
        const panel = document.getElementById('preview-panel');
        panel.classList.toggle('mobile-visible');
    });

    // --- Resizable Divider ---
    const divider = document.getElementById('builder-divider');
    const formPanel = document.getElementById('form-panel');
    if (divider && formPanel) {
        let isResizing = false;
        divider.addEventListener('mousedown', (e) => {
            isResizing = true;
            divider.classList.add('active');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const containerWidth = document.getElementById('builder-main').offsetWidth;
            const newWidth = Math.max(360, Math.min(e.clientX, containerWidth - 300));
            formPanel.style.width = `${newWidth}px`;
        });
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                divider.classList.remove('active');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    }

    console.log('🚀 Resume Builder initialized');
});
