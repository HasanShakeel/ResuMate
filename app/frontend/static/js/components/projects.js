// =============================================================================
// Projects Form Component
// =============================================================================

const ProjectsComponent = (() => {
    let _container = null;

    function render(container) {
        _container = container;
        const items = ResumeStore.get('projects') || [];
        container.innerHTML = `
            <h2 class="form-section-title">Projects</h2>
            <p class="form-section-subtitle">Showcase your notable projects.</p>
            <div id="projects-list">${items.map((item, i) => renderCard(item, i)).join('')}</div>
            <button class="add-entry-btn" id="add-project">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
                Add Project
            </button>
        `;
        bindEvents(container);
        initDragDrop(container.querySelector('#projects-list'), reorder);
    }

    function renderCard(item, index) {
        const title = item.title || `Project ${index + 1}`;
        const techs = (item.technologies || []);
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
                    <div class="form-group full-width">
                        <label class="form-label">Project Name</label>
                        <input class="form-input proj-field" data-index="${index}" data-field="title" value="${escapeAttr(item.title || '')}" placeholder="My Awesome App">
                    </div>
                    <div class="form-group full-width">
                        <label class="form-label">Description</label>
                        <textarea class="form-textarea proj-field" data-index="${index}" data-field="description" rows="2" placeholder="A brief description of the project...">${sanitizeHTML(item.description || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">GitHub URL</label>
                        <input class="form-input proj-field" data-index="${index}" data-field="github_url" value="${escapeAttr(item.github_url || '')}" placeholder="github.com/user/repo">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Live URL</label>
                        <input class="form-input proj-field" data-index="${index}" data-field="live_url" value="${escapeAttr(item.live_url || '')}" placeholder="myapp.com">
                    </div>
                    <div class="form-group full-width">
                        <label class="form-label">Technologies</label>
                        <div class="tags-input-container" id="tech-tags-${index}">
                            ${techs.map(t => `<span class="tag tag-primary tag-removable" data-exp="${index}" data-tech="${escapeAttr(t)}">${sanitizeHTML(t)} <span class="tag-remove" data-exp="${index}" data-tech="${escapeAttr(t)}">✕</span></span>`).join('')}
                            <input type="text" class="tech-input" data-index="${index}" placeholder="Type & press Enter">
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }

    function bindEvents(container) {
        container.querySelector('#add-project')?.addEventListener('click', () => {
            const items = ResumeStore.get('projects') || [];
            items.push({ title: '', description: '', technologies: [], github_url: '', live_url: '', highlights: [], sort_order: items.length });
            ResumeStore.set('projects', items);
            render(container);
        });

        container.addEventListener('input', (e) => {
            if (e.target.classList.contains('proj-field')) {
                const idx = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                const items = ResumeStore.get('projects');
                items[idx][field] = e.target.value;
                ResumeStore.set('projects', items);
            }
        });

        container.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('tech-input') && e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (!val) return;
                const idx = parseInt(e.target.dataset.index);
                const items = ResumeStore.get('projects');
                if (!items[idx].technologies) items[idx].technologies = [];
                if (!items[idx].technologies.includes(val)) {
                    items[idx].technologies.push(val);
                    ResumeStore.set('projects', items);
                    render(container);
                }
            }
        });

        container.addEventListener('click', (e) => {
            if (e.target.closest('.remove-entry')) {
                const idx = parseInt(e.target.closest('.remove-entry').dataset.index);
                const items = ResumeStore.get('projects');
                const projectName = items[idx]?.title || `Project ${idx + 1}`;
                if (!confirm(`Remove "${projectName}"? This cannot be undone.`)) return;
                items.splice(idx, 1);
                ResumeStore.set('projects', items);
                render(container);
            }
            if (e.target.closest('.tag-remove')) {
                const btn = e.target.closest('.tag-remove');
                const idx = parseInt(btn.dataset.exp);
                const tech = btn.dataset.tech;
                const items = ResumeStore.get('projects');
                items[idx].technologies = items[idx].technologies.filter(t => t !== tech);
                ResumeStore.set('projects', items);
                render(container);
            }
        });
    }

    function reorder(order) {
        const items = ResumeStore.get('projects');
        const reordered = order.map(id => items[parseInt(id)]);
        ResumeStore.set('projects', reordered);
        // Re-render so data-index attributes are refreshed to match new array order
        if (_container) render(_container);
    }

    return { render };
})();
