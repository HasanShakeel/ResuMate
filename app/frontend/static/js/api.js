// =============================================================================
// API Client
// =============================================================================

const API = (() => {
    const BASE = '/api';

    async function request(path, options = {}) {
        const url = `${BASE}${path}`;
        const config = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        };
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }
        const res = await fetch(url, config);
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            throw new Error(err.detail || 'Request failed');
        }
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) return res.json();
        if (ct.includes('text/html')) return res.text();
        return res;
    }

    return {
        // Resume CRUD
        createResume: (data) => request('/resumes', { method: 'POST', body: data }),
        getResume: (id) => request(`/resumes/${id}`),
        getResumeBySession: (sid) => request(`/resumes/session/${sid}`),
        updateResume: (id, data) => request(`/resumes/${id}`, { method: 'PUT', body: data }),
        deleteResume: (id) => request(`/resumes/${id}`, { method: 'DELETE' }),

        // Preview
        getPreview: (data) => request('/preview', { method: 'POST', body: data }),

        // PDF
        downloadPDF: async (data) => {
            const res = await fetch(`${BASE}/download/pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('PDF generation failed');
            return res.blob();
        },
        
        getPageCount: (data) => request('/page-count', { method: 'POST', body: data }),

        // Templates
        getTemplates: () => request('/templates'),
        getTemplate: (id) => request(`/templates/${id}`),

        // Health
        health: () => request('/health'),
    };
})();
