// ================== ТЕГИ ПРОФИЛЯ (Alliance style badges) ==================
(function() {
    'use strict';

    // SVG-иконки для тегов (переиспользуем из window.ICONS)
    function getTagIcon(iconName) {
        if (typeof window.ICONS !== 'undefined' && window.ICONS[iconName]) {
            return window.ICONS[iconName];
        }
        // Fallback — звезда
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.9 6.3 6.6.6-5 4.7 1.5 6.7L12 17.9 6 21.3l1.5-6.7-5-4.7 6.6-.6z"/></svg>';
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

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

            container.innerHTML = tags.map(t => {
                const icon = t.icon || 'star';
                const style = t.style || 'solid';
                const bg = t.bg_color || (t.color + '22');
                const textColor = t.text_color || t.color || '#fff';
                const borderColor = t.border_color || t.color || 'rgba(255,255,255,0.2)';

                // Формируем inline style
                let inlineStyle = '';
                if (style === 'outline') {
                    inlineStyle = `
                        background: transparent;
                        color: ${textColor};
                        border: 1.5px solid ${borderColor};
                    `;
                } else if (style === 'gradient') {
                    inlineStyle = `
                        background: ${bg};
                        color: ${textColor};
                        border: 1.5px solid ${borderColor};
                    `;
                } else {
                    // solid
                    inlineStyle = `
                        background: ${bg};
                        color: ${textColor};
                        border: 1.5px solid ${borderColor};
                    `;
                }

                return `<span class="user-badge-custom" style="${inlineStyle}">
                    <span class="user-badge-custom-icon">${getTagIcon(icon)}</span>
                    <span class="user-badge-custom-text">${escapeHtml(t.name)}</span>
                </span>`;
            }).join('');

            container.style.display = 'flex';

            // Проверяем, есть ли тег VERIFIED — если да, делаем галочку зелёной
            const hasVerified = tags.some(t => 
                (t.code || '').toUpperCase() === 'VERIFIED' || 
                (t.name || '').toUpperCase() === 'VERIFIED'
            );
            
            if (hasVerified) {
                // Ищем галочку рядом с ником (в профиле)
                const nameRow = document.querySelector('.user-name-row');
                if (nameRow) {
                    const badge = nameRow.querySelector('.verify-badge');
                    if (badge && typeof verifySvg === 'function') {
                        // Заменяем на зелёную
                        const greenBadge = document.createElement('span');
                        greenBadge.className = 'verify-badge';
                        greenBadge.innerHTML = verifySvg('green');
                        badge.replaceWith(greenBadge);
                    }
                }
            }
        } catch (e) {
            console.error('[TAGS]', e);
            container.style.display = 'none';
        }
    }

    window.loadUserTags = loadUserTags;
})();
