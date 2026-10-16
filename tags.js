// ================== ТЕГИ ПРОФИЛЯ ==================
(function() {
    'use strict';

    async function loadUserTags(userId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        try {
            const tags = await apiGet('/api/user/' + userId + '/tags');
            if (!tags || !tags.length) {
                container.innerHTML = '';
                container.style.display = 'none';
                return;
            }

            container.innerHTML = tags.map(t => `
                <span class="user-tag" style="
                    color: ${t.color};
                    background: ${t.color}22;
                    border-color: ${t.color}66;
                    box-shadow: 0 0 8px ${t.color}33;
                ">${escapeHtml(t.name)}</span>
            `).join('');
            container.style.display = 'flex';
        } catch (e) {
            console.error('[TAGS]', e);
            container.style.display = 'none';
        }
    }

    window.loadUserTags = loadUserTags;
})();
