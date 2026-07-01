// =============================================================================
// Profiles Modal Manager
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const profilesModal = document.getElementById('profiles-modal-overlay');
    if (!profilesModal) return;

    const btnProfiles = document.getElementById('btn-profiles');
    const heroCtaBtn = document.getElementById('hero-cta-btn');
    const navCtaBtn = document.getElementById('nav-cta-btn');
    const ctaBottomBtn = document.getElementById('cta-bottom-btn');
    
    const btnCloseProfiles = document.getElementById('profiles-modal-close');
    const profilesListContainer = document.getElementById('profiles-list-container');
    const btnCreateProfile = document.getElementById('btn-create-profile');
    const inputNewProfile = document.getElementById('new-profile-name');

    const isLandingPage = window.location.pathname === '/' || window.location.pathname === '/index.html';

    const renderProfilesList = () => {
        if (!profilesListContainer) return;
        
        // Ensure profiles are initialized before rendering
        if (ResumeStore.getProfiles().length === 0) {
            ResumeStore.load(); 
        }

        const profiles = ResumeStore.getProfiles();
        const activeId = ResumeStore.getActiveProfileId();
        
        profilesListContainer.innerHTML = profiles.map(p => `
            <div class="profile-list-item ${p.id === activeId ? 'active' : ''}" data-id="${p.id}">
                <div class="profile-info">
                    <div class="profile-name">${p.name}</div>
                    <div class="profile-date">Updated: ${new Date(p.updated_at).toLocaleDateString()}</div>
                </div>
                ${p.id === activeId ? `<span class="profile-badge">Active</span>` : `<button class="btn-delete-profile" data-id="${p.id}" title="Delete Resume">🗑️</button>`}
            </div>
        `).join('');
    };

    const openProfilesModal = (e) => {
        if(e) e.preventDefault();
        renderProfilesList();
        profilesModal.classList.add('active');
    };

    // Attach to builder page button
    if (btnProfiles) btnProfiles.addEventListener('click', openProfilesModal);

    // Attach to landing page buttons
    if (heroCtaBtn) heroCtaBtn.addEventListener('click', openProfilesModal);
    if (navCtaBtn) navCtaBtn.addEventListener('click', openProfilesModal);
    if (ctaBottomBtn) ctaBottomBtn.addEventListener('click', openProfilesModal);

    const closeProfilesModal = () => {
        profilesModal.classList.remove('active');
        if(inputNewProfile) inputNewProfile.value = '';
    };

    if (btnCloseProfiles) btnCloseProfiles.addEventListener('click', closeProfilesModal);
    profilesModal.addEventListener('click', (e) => {
        if (e.target === profilesModal) closeProfilesModal();
    });

    // Handle profile selection and deletion
    if (profilesListContainer) {
        profilesListContainer.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-profile');
            if (deleteBtn) {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this resume?')) {
                    ResumeStore.deleteProfile(deleteBtn.dataset.id);
                    renderProfilesList();
                }
                return;
            }

            const item = e.target.closest('.profile-list-item');
            if (item) {
                const id = item.dataset.id;
                if (id !== ResumeStore.getActiveProfileId()) {
                    ResumeStore.switchProfile(id);
                }
                closeProfilesModal();
                if (isLandingPage) {
                    window.location.href = '/builder';
                } else {
                    if (typeof StepperComponent !== 'undefined') {
                        StepperComponent.goToStep(0);
                    }
                    if (typeof showToast === 'function') {
                        showToast('Switched to resume: ' + ResumeStore.getProfiles().find(p=>p.id===id).name, 'success');
                    }
                }
            }
        });
    }

    // Handle create
    if (btnCreateProfile && inputNewProfile) {
        btnCreateProfile.addEventListener('click', () => {
            const name = inputNewProfile.value.trim() || 'New Resume';
            ResumeStore.createProfile(name);
            closeProfilesModal();
            if (isLandingPage) {
                window.location.href = '/builder';
            } else {
                if (typeof StepperComponent !== 'undefined') {
                    StepperComponent.goToStep(0);
                }
                if (typeof showToast === 'function') {
                    showToast('Created new resume: ' + name, 'success');
                }
            }
        });
    }
});
