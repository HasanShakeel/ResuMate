// =============================================================================
// Education Form Component
// =============================================================================

const EducationComponent = (() => {
    function render(container) {
        const items = ResumeStore.get('education') || [];
        container.innerHTML = `
            <h2 class="form-section-title">Education</h2>
            <p class="form-section-subtitle">Add your educational background.</p>
            <div id="education-list">${items.map((item, i) => renderCard(item, i)).join('')}</div>
            <button class="add-entry-btn" id="add-education">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add Education
            </button>
        `;
        bindEvents(container);
        initDragDrop(container.querySelector('#education-list'), reorder);
    }

    function renderCard(item, index) {
        const title = item.degree || item.institution || `Education ${index + 1}`;
        return `
        <div class="entry-card" draggable="true" data-id="${index}" data-index="${index}">
            <div class="entry-card-header">
                <span class="entry-card-title"><span class="drag-handle">⠿</span> ${sanitizeHTML(title)}</span>
                <div class="entry-card-actions">
                    <button class="btn btn-icon btn-ghost btn-sm remove-entry" data-index="${index}" title="Remove">✕</button>
                </div>
            </div>
            <div class="entry-card-body">
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Degree</label>
                        <input class="form-input edu-field" data-index="${index}" data-field="degree" value="${escapeAttr(item.degree || '')}" placeholder="Bachelor of Science">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Field of Study</label>
                        <input class="form-input edu-field" data-index="${index}" data-field="field_of_study" value="${escapeAttr(item.field_of_study || '')}" placeholder="Computer Science">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Institution</label>
                        <input class="form-input edu-field" data-index="${index}" data-field="institution" value="${escapeAttr(item.institution || '')}" placeholder="MIT">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input class="form-input edu-field" data-index="${index}" data-field="location" value="${escapeAttr(item.location || '')}" placeholder="Cambridge, MA">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input class="form-input edu-field" data-index="${index}" data-field="start_date" value="${escapeAttr(item.start_date || '')}" placeholder="Sep 2016">
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input class="form-input edu-field" data-index="${index}" data-field="end_date" value="${escapeAttr(item.end_date || '')}" placeholder="Jun 2020" ${item.is_current ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Grade / GPA</label>
                        <input class="form-input edu-field" data-index="${index}" data-field="grade" value="${escapeAttr(item.grade || '')}" placeholder="3.8/4.0">
                    </div>
                    <div class="form-group">
                        <div class="checkbox-row" style="margin-top: 28px;">
                            <input type="checkbox" id="edu_current_${index}" class="edu-current" data-index="${index}" ${item.is_current ? 'checked' : ''}>
                            <label for="edu_current_${index}">Currently studying</label>
                        </div>
                    </div>
                    <div class="form-group full-width">
                        <label class="form-label">Description (Optional)</label>
                        <textarea class="form-textarea edu-field" data-index="${index}" data-field="description" rows="2" placeholder="Relevant coursework, thesis, honors...">${sanitizeHTML(item.description || '')}</textarea>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function bindEvents(container) {
        container.querySelector('#add-education')?.addEventListener('click', () => {
            const items = ResumeStore.get('education') || [];
            items.push({ degree: '', field_of_study: '', institution: '', location: '', start_date: '', end_date: '', is_current: false, grade: '', description: '', sort_order: items.length });
            ResumeStore.set('education', items);
            render(container);
        });

        container.addEventListener('input', (e) => {
            if (e.target.classList.contains('edu-field')) {
                const idx = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                const items = ResumeStore.get('education');
                items[idx][field] = e.target.value;
                ResumeStore.set('education', items);
            }
        });

        container.addEventListener('change', (e) => {
            if (e.target.classList.contains('edu-current')) {
                const idx = parseInt(e.target.dataset.index);
                const items = ResumeStore.get('education');
                items[idx].is_current = e.target.checked;
                if (e.target.checked) items[idx].end_date = '';
                ResumeStore.set('education', items);
                render(container);
            }
        });

        container.addEventListener('click', (e) => {
            if (e.target.closest('.remove-entry')) {
                const idx = parseInt(e.target.closest('.remove-entry').dataset.index);
                const items = ResumeStore.get('education');
                const entryName = items[idx]?.degree || items[idx]?.institution || `Education ${idx + 1}`;
                if (!confirm(`Remove "${entryName}"? This cannot be undone.`)) return;
                items.splice(idx, 1);
                ResumeStore.set('education', items);
                render(container);
            }
        });
    }

    function reorder(order) {
        const items = ResumeStore.get('education');
        const reordered = order.map(id => items[parseInt(id)]);
        ResumeStore.set('education', reordered);
    }

    return { render };
})();
