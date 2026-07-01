// =============================================================================
// Centralized State Store with Reactive Updates
// =============================================================================

const ResumeStore = (() => {
    const PROFILES_KEY = 'rb_profiles';
    const ACTIVE_PROFILE_KEY = 'rb_active_profile_id';
    const LEGACY_STORAGE_KEY = 'rb_resume_data';
    const listeners = [];
    let autoSaveTimer = null;

    const defaultState = () => ({
        id: null,
        session_id: getSessionId(),
        title: 'Untitled Resume',
        template_id: 'modern',
        page_size: 'A4',
        photo: null,
        first_name: '', last_name: '', professional_title: '',
        email: '', phone: '', address: '',
        linkedin: '', github: '', portfolio: '', website: '', nationality: '',
        summary: '',
        education: [],
        experience: [],
        projects: [],
        skills: [],
        languages: [],
        certifications: [],
        awards: [],
        volunteer: [],
        references: [],
        section_order: ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'languages', 'awards', 'volunteer', 'references'],
        hidden_sections: [],
    });

    let state = defaultState();
    let profiles = [];
    let activeProfileId = null;

    function _generateId() {
        return Math.random().toString(36).substring(2, 15);
    }

    function initProfiles() {
        try {
            const savedProfiles = localStorage.getItem(PROFILES_KEY);
            if (savedProfiles) {
                profiles = JSON.parse(savedProfiles);
            }
            
            const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
            
            if (profiles.length === 0) {
                // Migration or fresh start
                const defaultProfileId = _generateId();
                profiles = [{
                    id: defaultProfileId,
                    name: legacyData ? 'Hasan Ahmad' : 'My Resume',
                    updated_at: new Date().toISOString()
                }];
                localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
                
                if (legacyData) {
                    localStorage.setItem(`rb_resume_data_${defaultProfileId}`, legacyData);
                    localStorage.removeItem(LEGACY_STORAGE_KEY);
                }
                activeProfileId = defaultProfileId;
                localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
            } else {
                activeProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
                if (!activeProfileId || !profiles.find(p => p.id === activeProfileId)) {
                    activeProfileId = profiles[0].id;
                    localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
                }
            }
        } catch (e) {
            console.error('Profile initialization failed', e);
        }
    }

    function getProfiles() {
        return profiles;
    }

    function getActiveProfileId() {
        return activeProfileId;
    }

    function createProfile(name) {
        save(); // Save current state before switching
        const id = _generateId();
        profiles.push({
            id,
            name: name || 'New Resume',
            updated_at: new Date().toISOString()
        });
        localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        switchProfile(id);
    }

    function switchProfile(id) {
        if (!profiles.find(p => p.id === id)) return;
        save();
        activeProfileId = id;
        localStorage.setItem(ACTIVE_PROFILE_KEY, activeProfileId);
        load();
    }

    function deleteProfile(id) {
        profiles = profiles.filter(p => p.id !== id);
        localStorage.removeItem(`rb_resume_data_${id}`);
        if (profiles.length === 0) {
            createProfile('My Resume');
        } else if (activeProfileId === id) {
            switchProfile(profiles[0].id);
        } else {
            localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        }
    }

    function updateProfileTimestamp() {
        const p = profiles.find(p => p.id === activeProfileId);
        if (p) {
            p.updated_at = new Date().toISOString();
            localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
        }
    }

    function load() {
        if (!activeProfileId) initProfiles();
        try {
            const saved = localStorage.getItem(`rb_resume_data_${activeProfileId}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...defaultState(), ...parsed, session_id: getSessionId() };
            } else {
                state = defaultState();
            }
        } catch (e) { console.warn('Failed to load saved state', e); state = defaultState(); }
        notify();
    }

    function save() {
        if (!activeProfileId) return;
        try { 
            localStorage.setItem(`rb_resume_data_${activeProfileId}`, JSON.stringify(state)); 
            updateProfileTimestamp();
        } catch (e) { /* ignore */ }
    }

    function get(key) { return key ? state[key] : { ...state }; }

    function set(key, value) {
        if (typeof key === 'object') { Object.assign(state, key); }
        else { state[key] = value; }
        // Do not auto-save. Wait for explicit save (e.g., Save & Next)
        notify();
    }

    function reset() { state = defaultState(); save(); notify(); }

    function subscribe(fn) { listeners.push(fn); return () => { const i = listeners.indexOf(fn); if (i > -1) listeners.splice(i, 1); }; }

    function notify() { listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }

    function revert() {
        load(); // Reload state from localStorage, wiping unsaved changes
    }

    function updateSaveStatus(status) {
        const el = document.getElementById('save-status');
        if (!el) return;
        const textEl = el.querySelector('.save-text');
        el.classList.remove('saving', 'error');
        if (status === 'saving') { el.classList.add('saving'); if(textEl) textEl.textContent = 'Saving...'; }
        else if (status === 'saved') { if(textEl) textEl.textContent = 'Saved'; }
        else if (status === 'error') { el.classList.add('error'); if(textEl) textEl.textContent = 'Save failed'; }
    }

    function getResumeData() {
        const d = { ...state };
        delete d.id;
        delete d.session_id;
        return d;
    }

    return { 
        load, save, get, set, reset, subscribe, getResumeData, defaultState,
        getProfiles, getActiveProfileId, createProfile, switchProfile, deleteProfile,
        revert, updateSaveStatus
    };
})();
