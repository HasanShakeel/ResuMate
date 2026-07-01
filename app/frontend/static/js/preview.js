// =============================================================================
// Live Preview Renderer
// =============================================================================

const PreviewManager = (() => {
    let iframe = null;
    let zoomSelect = null;
    let updatePreview = null;
    let updatePageCount = null;

    function init() {
        iframe = document.getElementById('preview-iframe');
        zoomSelect = document.getElementById('preview-zoom');
        if (!iframe) return;

        updatePageCount = debounce(async (data) => {
            try {
                // Use the backend to accurately count PDF pages 
                // so it matches the downloaded PDF exactly
                const res = await API.getPageCount(data);
                const pages = res.pages || 1;
                
                const indicator = document.getElementById('preview-page-indicator');
                if (indicator) {
                    indicator.style.display = 'inline-block';
                    indicator.textContent = pages + (pages > 1 ? ' Pages' : ' Page');
                    if (pages > 1) {
                        indicator.style.background = 'var(--color-danger)';
                        indicator.title = "Your resume exceeds 1 page. Consider shortening descriptions or adjusting spacing.";
                    } else {
                        indicator.style.background = 'var(--color-accent)';
                        indicator.title = "Your resume fits perfectly on 1 page.";
                    }
                }
            } catch (e) {
                console.warn('Page count update failed:', e);
            }
        }, 1500); // Debounce heavily to avoid spamming the backend

        updatePreview = debounce(async () => {
            try {
                const data = ResumeStore.getResumeData();
                const html = await API.getPreview(data);
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                doc.open();
                doc.write(html);
                doc.close();
                
                // Trigger the page count update
                updatePageCount(data);

            } catch (e) {
                console.warn('Preview update failed:', e);
            }
        }, 400);

        // Subscribe to store changes
        ResumeStore.subscribe(() => updatePreview());

        // Zoom control
        const applyZoom = () => {
            if (!zoomSelect || !iframe) return;
            const wrapper = document.getElementById('preview-iframe-wrapper');
            let scale = 1;
            
            if (zoomSelect.value === 'auto') {
                const container = document.getElementById('preview-container');
                const cw = container.clientWidth;
                // Add some padding (40px)
                scale = Math.min(1.2, Math.max(0.3, (cw - 40) / 794));
            } else {
                scale = parseFloat(zoomSelect.value);
            }
            
            iframe.style.transform = `scale(${scale})`;
            if (wrapper) {
                // Wrapper reserves exactly the scaled dimensions so the scrollbars work natively!
                wrapper.style.width = `calc(210mm * ${scale})`;
                wrapper.style.minHeight = `calc(297mm * ${scale})`;
            }
        };

        if (zoomSelect) {
            zoomSelect.addEventListener('change', applyZoom);
            // Also re-apply zoom when window resizes for auto-fit
            window.addEventListener('resize', debounce(applyZoom, 100));
        }

        // Initial preview
        updatePreview();
        // Wait a tick for layout to settle then apply zoom
        setTimeout(applyZoom, 50);
    }

    function refresh() { if (updatePreview) updatePreview(); }

    return { init, refresh };
})();
