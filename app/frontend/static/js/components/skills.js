// =============================================================================
// Skills Form Component
// =============================================================================

const SkillsComponent = (() => {
    const CATEGORIES = [
        { id: 'technical', label: 'Technical Skills' },
        { id: 'framework', label: 'Frameworks & Libraries' },
        { id: 'tool', label: 'Tools & Platforms' },
        { id: 'soft', label: 'Soft Skills' },
    ];

    function render(container) {
        if (!container) return;
        const skills = ResumeStore.get('skills') || [];
        const sortedSkills = [...skills].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

        container.innerHTML = `
            <h2 class="form-section-title">Skills</h2>
            <p class="form-section-subtitle">Add your skills grouped by category. Press Enter to add each skill. Drag tags to reorder or move between categories.</p>
            ${CATEGORIES.map(cat => {
                const catSkills = sortedSkills.filter(s => (s.category || 'technical') === cat.id);
                return `
                <div class="form-group skill-category-group" style="margin-bottom: var(--space-5);">
                    <label class="form-label">${cat.label}</label>
                    <div class="tags-input-container" id="skills-${cat.id}" data-category="${cat.id}">
                        ${catSkills.map(s => `<span class="tag tag-primary tag-removable" data-name="${escapeAttr(s.name)}" data-cat="${cat.id}" draggable="false">${sanitizeHTML(s.name)} <span class="tag-remove" data-name="${escapeAttr(s.name)}" data-cat="${cat.id}">✕</span></span>`).join('')}
                        <input type="text" class="skill-input" data-category="${cat.id}" placeholder="Type a skill & press Enter">
                    </div>
                </div>`;
            }).join('')}
        `;

        initSmoothDragDrop(container);

        container.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('skill-input') && e.key === 'Enter') {
                e.preventDefault();
                const val = e.target.value.trim();
                if (!val) return;
                const cat = e.target.dataset.category;
                const skills = ResumeStore.get('skills') || [];
                if (skills.some(s => s.name.toLowerCase() === val.toLowerCase() && s.category === cat)) return;
                skills.push({ name: val, category: cat, sort_order: skills.length });
                ResumeStore.set('skills', skills);
                render(container);
            }
        });

        container.addEventListener('click', (e) => {
            if (e.target.closest('.tag-remove')) {
                const btn = e.target.closest('.tag-remove');
                const name = btn.dataset.name;
                const cat = btn.dataset.cat;
                let skills = ResumeStore.get('skills') || [];
                skills = skills.filter(s => !(s.name === name && s.category === cat));
                ResumeStore.set('skills', skills);
                render(container);
            }
        });
    }

    function initSmoothDragDrop(container) {
        const tagContainers = container.querySelectorAll('.tags-input-container');
        
        tagContainers.forEach(cont => {
            if (cont.sortableInstance) {
                cont.sortableInstance.destroy();
            }
            
            cont.sortableInstance = new Sortable(cont, {
                group: 'skills', // Allow dragging between different categories
                animation: 200,  // Smooth slide animation in ms
                easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
                draggable: '.tag-removable',
                filter: '.skill-input', // Don't drag the input field
                preventOnFilter: false, // Ensure clicking input still focuses it
                ghostClass: 'sortable-ghost', // Applied to the drop placeholder
                dragClass: 'sortable-drag', // Applied to the dragging item
                forceFallback: true, // Forces custom dragging to look consistent across browsers
                fallbackClass: 'sortable-fallback',
                
                onEnd: function (evt) {
                    saveSkillOrder(container);
                    // Re-render to ensure input stays at the very end
                    render(container);
                }
            });
        });

        function saveSkillOrder(container) {
            const newSkills = [];
            container.querySelectorAll('.tags-input-container').forEach(cont => {
                const catId = cont.dataset.category;
                cont.querySelectorAll('.tag-removable').forEach((tag, idx) => {
                    newSkills.push({
                        name: tag.dataset.name,
                        category: catId,
                        sort_order: idx
                    });
                });
            });
            ResumeStore.set('skills', newSkills);
        }
    }

    return { render };
})();


