// =============================================================================
// Personal Info Form Component
// =============================================================================

const PersonalInfoComponent = (() => {
    function render(container) {
        const s = ResumeStore.get();
        container.innerHTML = `
            <h2 class="form-section-title">Personal Information</h2>
            <p class="form-section-subtitle">Let's start with your basic details.</p>

            <div class="photo-upload">
                <div class="photo-preview" id="photo-preview">
                    ${s.photo ? `<img src="${escapeAttr(s.photo)}" alt="Photo">` : '<span class="photo-preview-placeholder">👤</span>'}
                </div>
                <div class="photo-upload-controls">
                    <label class="btn btn-secondary btn-sm" for="photo-input">Upload Photo</label>
                    <input type="file" id="photo-input" accept="image/*" style="display:none">
                    ${s.photo ? '<button class="btn btn-ghost btn-sm" id="remove-photo">Remove</button>' : ''}
                    <span class="form-hint">Optional. JPG, PNG, or WebP. Max 5MB.</span>
                </div>
            </div>

            <div class="form-grid">
                <div class="form-group">
                    <label class="form-label" for="first_name">First Name</label>
                    <input class="form-input" id="first_name" value="${escapeAttr(s.first_name)}" placeholder="John" data-validate="required">
                    <span class="form-error"></span>
                </div>
                <div class="form-group">
                    <label class="form-label" for="last_name">Last Name</label>
                    <input class="form-input" id="last_name" value="${escapeAttr(s.last_name)}" placeholder="Doe" data-validate="required">
                    <span class="form-error"></span>
                </div>
                <div class="form-group full-width">
                    <label class="form-label" for="professional_title">Professional Title</label>
                    <input class="form-input" id="professional_title" value="${escapeAttr(s.professional_title)}" placeholder="Senior Software Engineer">
                </div>
                <div class="form-group">
                    <label class="form-label" for="email">Email</label>
                    <input class="form-input" id="email" type="email" value="${escapeAttr(s.email)}" placeholder="john@example.com" data-validate="email">
                    <span class="form-error"></span>
                </div>
                <div class="form-group">
                    <label class="form-label" for="phone">Phone</label>
                    <input class="form-input" id="phone" value="${escapeAttr(s.phone)}" placeholder="+1 (555) 123-4567" data-validate="phone">
                    <span class="form-error"></span>
                </div>
                <div class="form-group full-width">
                    <label class="form-label" for="address">Address</label>
                    <input class="form-input" id="address" value="${escapeAttr(s.address)}" placeholder="New York, NY">
                </div>
                <div class="form-group">
                    <label class="form-label" for="linkedin">LinkedIn URL</label>
                    <input class="form-input" id="linkedin" value="${escapeAttr(s.linkedin)}" placeholder="linkedin.com/in/johndoe">
                </div>
                <div class="form-group">
                    <label class="form-label" for="github">GitHub URL</label>
                    <input class="form-input" id="github" value="${escapeAttr(s.github)}" placeholder="github.com/johndoe">
                </div>
                <div class="form-group">
                    <label class="form-label" for="portfolio">Portfolio URL</label>
                    <input class="form-input" id="portfolio" value="${escapeAttr(s.portfolio)}" placeholder="johndoe.com">
                </div>
                <div class="form-group">
                    <label class="form-label" for="website">Website</label>
                    <input class="form-input" id="website" value="${escapeAttr(s.website)}" placeholder="myblog.com">
                </div>
                <div class="form-group">
                    <label class="form-label" for="nationality">Nationality</label>
                    <input class="form-input" id="nationality" value="${escapeAttr(s.nationality)}" placeholder="American">
                </div>
            </div>
        `;

        // Bind events
        const fields = ['first_name','last_name','professional_title','email','phone','address','linkedin','github','portfolio','website','nationality'];
        fields.forEach(f => {
            const el = container.querySelector(`#${f}`);
            if (el) el.addEventListener('input', debounce(() => ResumeStore.set(f, el.value), 300));
        });

        // Photo upload
        const photoInput = container.querySelector('#photo-input');
        if (photoInput) {
            photoInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.', 'error'); return; }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    ResumeStore.set('photo', ev.target.result);
                    render(container);
                };
                reader.readAsDataURL(file);
            });
        }

        const removePhoto = container.querySelector('#remove-photo');
        if (removePhoto) removePhoto.addEventListener('click', () => { ResumeStore.set('photo', null); render(container); });
    }

    return { render };
})();
