// =============================================================================
// Additional Sections Component (Languages, Certifications, Awards, Volunteer, References)
// =============================================================================

const AdditionalComponent = (() => {
    const TABS = [
        { id: 'languages', label: 'Languages' },
        { id: 'certifications', label: 'Certifications' },
        { id: 'awards', label: 'Awards' },
        { id: 'volunteer', label: 'Volunteer' },
        { id: 'references', label: 'References' },
    ];
    let activeTab = 'languages';

    function render(container) {
        container.innerHTML = `
            <h2 class="form-section-title">Additional Sections</h2>
            <p class="form-section-subtitle">Add optional sections to strengthen your resume.</p>
            <div class="tabs" id="additional-tabs">
                ${TABS.map(t => `<button class="tab ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}
            </div>
            <div id="additional-content" style="margin-top: var(--space-6);"></div>
        `;
        container.querySelector('#additional-tabs').addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                activeTab = e.target.dataset.tab;
                render(container);
            }
        });
        renderTab(container.querySelector('#additional-content'));
    }

    function renderTab(content) {
        switch (activeTab) {
            case 'languages': renderLanguages(content); break;
            case 'certifications': renderCertifications(content); break;
            case 'awards': renderAwards(content); break;
            case 'volunteer': renderVolunteer(content); break;
            case 'references': renderReferences(content); break;
        }
    }

    // === LANGUAGES ===
    function renderLanguages(c) {
        const items = ResumeStore.get('languages') || [];
        c.innerHTML = `
            <div id="lang-list">${items.map((it, i) => `
                <div class="entry-card" data-index="${i}">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Language</label>
                            <input class="form-input lang-f" data-i="${i}" data-f="name" value="${escapeAttr(it.name || '')}" placeholder="English">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fluency</label>
                            <select class="form-select lang-f" data-i="${i}" data-f="fluency">
                                <option value="">Select level</option>
                                ${['Native','Fluent','Advanced','Intermediate','Beginner'].map(l => `<option value="${l}" ${it.fluency === l ? 'selected' : ''}>${l}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-ghost btn-sm remove-lang" data-i="${i}" style="margin-top:var(--space-2)">Remove</button>
                </div>
            `).join('')}</div>
            <button class="add-entry-btn" id="add-lang"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add Language</button>
        `;
        c.querySelector('#add-lang').addEventListener('click', () => { items.push({ name: '', fluency: '', sort_order: items.length }); ResumeStore.set('languages', items); renderLanguages(c); });
        c.addEventListener('input', handleField('languages', 'lang-f', c, renderLanguages));
        c.addEventListener('change', handleField('languages', 'lang-f', c, renderLanguages));
        c.addEventListener('click', handleRemove('languages', 'remove-lang', c, renderLanguages));
    }

    // === CERTIFICATIONS ===
    function renderCertifications(c) {
        const items = ResumeStore.get('certifications') || [];
        c.innerHTML = `
            <div id="cert-list">${items.map((it, i) => `
                <div class="entry-card" data-index="${i}">
                    <div class="form-grid">
                        <div class="form-group"><label class="form-label">Certification Name</label><input class="form-input cert-f" data-i="${i}" data-f="name" value="${escapeAttr(it.name || '')}" placeholder="AWS Solutions Architect"></div>
                        <div class="form-group"><label class="form-label">Issuer</label><input class="form-input cert-f" data-i="${i}" data-f="issuer" value="${escapeAttr(it.issuer || '')}" placeholder="Amazon Web Services"></div>
                        <div class="form-group"><label class="form-label">Date</label><input class="form-input cert-f" data-i="${i}" data-f="date" value="${escapeAttr(it.date || '')}" placeholder="Jan 2023"></div>
                        <div class="form-group"><label class="form-label">Credential URL</label><input class="form-input cert-f" data-i="${i}" data-f="credential_url" value="${escapeAttr(it.credential_url || '')}" placeholder="https://..."></div>
                    </div>
                    <button class="btn btn-ghost btn-sm remove-cert" data-i="${i}" style="margin-top:var(--space-2)">Remove</button>
                </div>
            `).join('')}</div>
            <button class="add-entry-btn" id="add-cert"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add Certification</button>
        `;
        c.querySelector('#add-cert').addEventListener('click', () => { items.push({ name: '', issuer: '', date: '', credential_url: '', sort_order: items.length }); ResumeStore.set('certifications', items); renderCertifications(c); });
        c.addEventListener('input', handleField('certifications', 'cert-f', c, renderCertifications));
        c.addEventListener('click', handleRemove('certifications', 'remove-cert', c, renderCertifications));
    }

    // === AWARDS ===
    function renderAwards(c) {
        const items = ResumeStore.get('awards') || [];
        c.innerHTML = `
            <div id="award-list">${items.map((it, i) => `
                <div class="entry-card" data-index="${i}">
                    <div class="form-grid">
                        <div class="form-group"><label class="form-label">Award Title</label><input class="form-input award-f" data-i="${i}" data-f="title" value="${escapeAttr(it.title || '')}" placeholder="Best Paper Award"></div>
                        <div class="form-group"><label class="form-label">Issuer</label><input class="form-input award-f" data-i="${i}" data-f="issuer" value="${escapeAttr(it.issuer || '')}" placeholder="IEEE"></div>
                        <div class="form-group"><label class="form-label">Date</label><input class="form-input award-f" data-i="${i}" data-f="date" value="${escapeAttr(it.date || '')}" placeholder="2023"></div>
                        <div class="form-group full-width"><label class="form-label">Description</label><textarea class="form-textarea award-f" data-i="${i}" data-f="description" rows="2">${sanitizeHTML(it.description || '')}</textarea></div>
                    </div>
                    <button class="btn btn-ghost btn-sm remove-award" data-i="${i}" style="margin-top:var(--space-2)">Remove</button>
                </div>
            `).join('')}</div>
            <button class="add-entry-btn" id="add-award"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add Award</button>
        `;
        c.querySelector('#add-award').addEventListener('click', () => { items.push({ title: '', issuer: '', date: '', description: '', sort_order: items.length }); ResumeStore.set('awards', items); renderAwards(c); });
        c.addEventListener('input', handleField('awards', 'award-f', c, renderAwards));
        c.addEventListener('click', handleRemove('awards', 'remove-award', c, renderAwards));
    }

    // === VOLUNTEER ===
    function renderVolunteer(c) {
        const items = ResumeStore.get('volunteer') || [];
        c.innerHTML = `
            <div id="vol-list">${items.map((it, i) => `
                <div class="entry-card" data-index="${i}">
                    <div class="form-grid">
                        <div class="form-group"><label class="form-label">Organization</label><input class="form-input vol-f" data-i="${i}" data-f="organization" value="${escapeAttr(it.organization || '')}"></div>
                        <div class="form-group"><label class="form-label">Role</label><input class="form-input vol-f" data-i="${i}" data-f="role" value="${escapeAttr(it.role || '')}"></div>
                        <div class="form-group"><label class="form-label">Start Date</label><input class="form-input vol-f" data-i="${i}" data-f="start_date" value="${escapeAttr(it.start_date || '')}"></div>
                        <div class="form-group"><label class="form-label">End Date</label><input class="form-input vol-f" data-i="${i}" data-f="end_date" value="${escapeAttr(it.end_date || '')}"></div>
                        <div class="form-group full-width"><label class="form-label">Description</label><textarea class="form-textarea vol-f" data-i="${i}" data-f="description" rows="2">${sanitizeHTML(it.description || '')}</textarea></div>
                    </div>
                    <button class="btn btn-ghost btn-sm remove-vol" data-i="${i}" style="margin-top:var(--space-2)">Remove</button>
                </div>
            `).join('')}</div>
            <button class="add-entry-btn" id="add-vol"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add Volunteer Experience</button>
        `;
        c.querySelector('#add-vol').addEventListener('click', () => { items.push({ organization: '', role: '', start_date: '', end_date: '', description: '', sort_order: items.length }); ResumeStore.set('volunteer', items); renderVolunteer(c); });
        c.addEventListener('input', handleField('volunteer', 'vol-f', c, renderVolunteer));
        c.addEventListener('click', handleRemove('volunteer', 'remove-vol', c, renderVolunteer));
    }

    // === REFERENCES ===
    function renderReferences(c) {
        const items = ResumeStore.get('references') || [];
        c.innerHTML = `
            <div id="ref-list">${items.map((it, i) => `
                <div class="entry-card" data-index="${i}">
                    <div class="form-grid">
                        <div class="form-group"><label class="form-label">Name</label><input class="form-input ref-f" data-i="${i}" data-f="name" value="${escapeAttr(it.name || '')}"></div>
                        <div class="form-group"><label class="form-label">Title</label><input class="form-input ref-f" data-i="${i}" data-f="title" value="${escapeAttr(it.title || '')}"></div>
                        <div class="form-group"><label class="form-label">Company</label><input class="form-input ref-f" data-i="${i}" data-f="company" value="${escapeAttr(it.company || '')}"></div>
                        <div class="form-group"><label class="form-label">Email</label><input class="form-input ref-f" data-i="${i}" data-f="email" value="${escapeAttr(it.email || '')}"></div>
                        <div class="form-group"><label class="form-label">Phone</label><input class="form-input ref-f" data-i="${i}" data-f="phone" value="${escapeAttr(it.phone || '')}"></div>
                        <div class="form-group"><label class="form-label">Relationship</label><input class="form-input ref-f" data-i="${i}" data-f="relationship_type" value="${escapeAttr(it.relationship_type || '')}" placeholder="Former Manager"></div>
                    </div>
                    <button class="btn btn-ghost btn-sm remove-ref" data-i="${i}" style="margin-top:var(--space-2)">Remove</button>
                </div>
            `).join('')}</div>
            <button class="add-entry-btn" id="add-ref"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Add Reference</button>
        `;
        c.querySelector('#add-ref').addEventListener('click', () => { items.push({ name: '', title: '', company: '', email: '', phone: '', relationship_type: '', sort_order: items.length }); ResumeStore.set('references', items); renderReferences(c); });
        c.addEventListener('input', handleField('references', 'ref-f', c, renderReferences));
        c.addEventListener('click', handleRemove('references', 'remove-ref', c, renderReferences));
    }

    // === HELPERS ===
    function handleField(storeKey, cssClass, c, rerender) {
        return (e) => {
            if (e.target.classList.contains(cssClass)) {
                const i = parseInt(e.target.dataset.i);
                const f = e.target.dataset.f;
                const items = ResumeStore.get(storeKey) || [];
                if (items[i]) { items[i][f] = e.target.value; ResumeStore.set(storeKey, items); }
            }
        };
    }

    function handleRemove(storeKey, cssClass, c, rerender) {
        return (e) => {
            if (e.target.closest(`.${cssClass}`)) {
                const i = parseInt(e.target.closest(`.${cssClass}`).dataset.i);
                const items = ResumeStore.get(storeKey) || [];
                items.splice(i, 1);
                ResumeStore.set(storeKey, items);
                rerender(c);
            }
        };
    }

    return { render };
})();
