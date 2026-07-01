// =============================================================================
// Experience Form Component
// =============================================================================

const ExperienceComponent = (() => {
    let _container = null;

    function render(container) {
        _container = container;
        const items = ResumeStore.get('experience') || [];
        container.innerHTML = `
            <h2 class="form-section-title">Work Experience</h2>
            <p class="form-section-subtitle">Add your relevant work experience, starting with the most recent.</p>
            <div id="experience-list">${items.map((item, i) => renderCard(item, i)).join('')}</div>
            <button class="add-entry-btn" id="add-experience">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add Experience
            </button>
        `;
        bindEvents(container);
        initDragDrop(container.querySelector('#experience-list'), reorder);
    }

    function renderCard(item, index) {
        const title = item.position || item.company || `Experience ${index + 1}`;
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
                        <label class="form-label">Job Title</label>
                        <input class="form-input exp-field" data-index="${index}" data-field="position" value="${escapeAttr(item.position || '')}" placeholder="Software Engineer">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Company</label>
                        <input class="form-input exp-field" data-index="${index}" data-field="company" value="${escapeAttr(item.company || '')}" placeholder="Google">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Location</label>
                        <input class="form-input exp-field" data-index="${index}" data-field="location" value="${escapeAttr(item.location || '')}" placeholder="Mountain View, CA">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Start Date</label>
                        <input class="form-input exp-field" data-index="${index}" data-field="start_date" value="${escapeAttr(item.start_date || '')}" placeholder="Jan 2020">
                    </div>
                    <div class="form-group">
                        <label class="form-label">End Date</label>
                        <input class="form-input exp-field" data-index="${index}" data-field="end_date" value="${escapeAttr(item.end_date || '')}" placeholder="Present" ${item.is_current ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <div class="checkbox-row" style="margin-top: 28px;">
                            <input type="checkbox" id="exp_current_${index}" class="exp-current" data-index="${index}" ${item.is_current ? 'checked' : ''}>
                            <label for="exp_current_${index}">Current position</label>
                        </div>
                    </div>
                    <div class="form-group full-width">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea exp-field" data-index="${index}" data-field="description" rows="2" placeholder="Brief role description...">${sanitizeHTML(item.description || '')}</textarea>
                    </div>
                    <div class="form-group full-width">
                        <label class="form-label">Key Achievements</label>
                        <div class="bullet-list" id="achievements-${index}">
                            ${(item.achievements || []).map((a, ai) => `
                                <div class="bullet-item">
                                    <input class="form-input achievement-input" data-exp="${index}" data-ai="${ai}" value="${escapeAttr(a)}" placeholder="Increased revenue by 20%...">
                                    <button class="btn btn-icon btn-ghost btn-sm remove-achievement" data-exp="${index}" data-ai="${ai}">✕</button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="btn btn-ghost btn-sm add-achievement" data-index="${index}" style="margin-top:var(--space-2)">+ Add Achievement</button>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function bindEvents(container) {
        container.querySelector('#add-experience')?.addEventListener('click', () => {
            const items = ResumeStore.get('experience') || [];
            items.push({ position: '', company: '', location: '', start_date: '', end_date: '', is_current: false, description: '', achievements: [], sort_order: items.length });
            ResumeStore.set('experience', items);
            render(container);
        });

        container.addEventListener('input', (e) => {
            if (e.target.classList.contains('exp-field')) {
                const idx = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                const items = ResumeStore.get('experience');
                items[idx][field] = e.target.value;
                ResumeStore.set('experience', items);
            }
            if (e.target.classList.contains('achievement-input')) {
                const ei = parseInt(e.target.dataset.exp);
                const ai = parseInt(e.target.dataset.ai);
                const items = ResumeStore.get('experience');
                items[ei].achievements[ai] = e.target.value;
                ResumeStore.set('experience', items);
            }
        });

        container.addEventListener('change', (e) => {
            if (e.target.classList.contains('exp-current')) {
                const idx = parseInt(e.target.dataset.index);
                const items = ResumeStore.get('experience');
                items[idx].is_current = e.target.checked;
                if (e.target.checked) items[idx].end_date = '';
                ResumeStore.set('experience', items);
                render(container);
            }
        });

        container.addEventListener('click', (e) => {
            if (e.target.closest('.remove-entry')) {
                const idx = parseInt(e.target.closest('.remove-entry').dataset.index);
                const items = ResumeStore.get('experience');
                const entryName = items[idx]?.position || items[idx]?.company || `Experience ${idx + 1}`;
                if (!confirm(`Remove "${entryName}"? This cannot be undone.`)) return;
                items.splice(idx, 1);
                ResumeStore.set('experience', items);
                render(container);
            }
            if (e.target.closest('.add-achievement')) {
                const idx = parseInt(e.target.closest('.add-achievement').dataset.index);
                const items = ResumeStore.get('experience');
                if (!items[idx].achievements) items[idx].achievements = [];
                items[idx].achievements.push('');
                ResumeStore.set('experience', items);
                render(container);
            }
            if (e.target.closest('.remove-achievement')) {
                const btn = e.target.closest('.remove-achievement');
                const ei = parseInt(btn.dataset.exp);
                const ai = parseInt(btn.dataset.ai);
                const items = ResumeStore.get('experience');
                items[ei].achievements.splice(ai, 1);
                ResumeStore.set('experience', items);
                render(container);
            }
        });
    }

    function reorder(order) {
        const items = ResumeStore.get('experience');
        const reordered = order.map(id => items[parseInt(id)]);
        ResumeStore.set('experience', reordered);
        // Re-render so data-index attributes are refreshed to match new array order
        if (_container) render(_container);
    }

    return { render };
})();
