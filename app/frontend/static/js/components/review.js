// =============================================================================
// Review Component
// =============================================================================

const ReviewComponent = (() => {
    function render(container) {
        const s = ResumeStore.get();
        const sections = [];

        // Personal
        sections.push(reviewSection('Personal Information', [
            ['Name', `${s.first_name || ''} ${s.last_name || ''}`.trim() || '—'],
            ['Title', s.professional_title || '—'],
            ['Email', s.email || '—'],
            ['Phone', s.phone || '—'],
            ['Address', s.address || '—'],
        ]));

        if (s.summary) sections.push(reviewSection('Summary', [['', s.summary.substring(0, 150) + (s.summary.length > 150 ? '...' : '')]]));

        if (s.experience.length) sections.push(reviewSection('Experience', s.experience.map(e => [e.position || 'Untitled', `${e.company || ''} ${e.start_date ? '· ' + e.start_date : ''}`])));
        if (s.education.length) sections.push(reviewSection('Education', s.education.map(e => [e.degree || 'Untitled', `${e.institution || ''}`])));
        if (s.projects.length) sections.push(reviewSection('Projects', s.projects.map(p => [p.title || 'Untitled', (p.technologies || []).join(', ')])));
        if (s.skills.length) sections.push(reviewSection('Skills', [[`${s.skills.length} skills`, s.skills.map(sk => sk.name).join(', ')]]));
        if (s.languages.length) sections.push(reviewSection('Languages', s.languages.map(l => [l.name, l.fluency || ''])));
        if (s.certifications.length) sections.push(reviewSection('Certifications', s.certifications.map(c => [c.name, c.issuer || ''])));

        container.innerHTML = `
            <h2 class="form-section-title">Review Your Resume</h2>
            <p class="form-section-subtitle">Review all sections before downloading. Click any section in the stepper to edit.</p>
            ${sections.join('')}
            <div style="text-align: center; margin-top: var(--space-8);">
                <p style="color: var(--color-success); font-weight: 600; font-size: var(--text-lg);">✅ Your resume is ready!</p>
                <p class="form-section-subtitle">Click "Next" to proceed to download, or go back to make changes.</p>
            </div>
        `;
    }

    function reviewSection(title, items) {
        return `
        <div class="review-section">
            <div class="review-section-header">
                <h3 class="review-section-title">${title}</h3>
            </div>
            ${items.map(([label, value]) => `
                <div class="review-item">
                    ${label ? `<span class="review-item-label">${sanitizeHTML(label)}</span>` : ''}
                    <span class="review-item-value">${sanitizeHTML(value || '—')}</span>
                </div>
            `).join('')}
        </div>`;
    }

    return { render };
})();
