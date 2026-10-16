// ================== ЭКРАН ДОСТИЖЕНИЙ (Alliance) ==================
(function() {
    'use strict';

    let catalogCache = null;
    let userAchCache = null;

    function getUserId() {
        try {
            if (window.tgUser && window.tgUser.id) return window.tgUser.id;
            const tg = window.Telegram && window.Telegram.WebApp;
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) return tg.initDataUnsafe.user.id;
        } catch (e) {}
        return null;
    }

    function getApiUrl() {
        try {
            if (typeof API_URL !== 'undefined') return API_URL;
            if (window.API_URL) return window.API_URL;
        } catch (e) {}
        return '';
    }

    // ==== SVG-гексагон ====
    function hexSvg() {
        return '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M32 4 L56 18 L56 46 L32 60 L8 46 L8 18 Z" ' +
            'fill="rgba(34,197,94,0.06)" stroke="#22c55e" stroke-width="2" stroke-linejoin="round"/>' +
            '<path d="M32 10 L51 21 L51 43 L32 54 L13 43 L13 21 Z" ' +
            'fill="none" stroke="rgba(34,197,94,0.15)" stroke-width="1" stroke-linejoin="round"/>' +
            '</svg>';
    }

    // ==== SVG-замочек ====
    function lockSvg() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:28px;height:28px;">' +
            '<rect x="4.5" y="11" width="15" height="10" rx="2"/>' +
            '<path d="M8 11V7a4 4 0 0 1 8 0v4"/>' +
            '</svg>';
    }

    // ==== SVG-иконка по коду достижения (переиспользуем стиль) ====
    function achIcon(code) {
        const paths = {
            first_win:          '<circle cx="12" cy="10" r="5"/><path d="M7 15l-1 6 6-3 6 3-1-6"/>',
            first_tournament:   '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
            streak_5:           '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
            streak_10:          '<path d="M12 22a7 7 0 0 0 7-7c0-3-2-5-3-7-1 2-3 3-3 3 0-3-2-6-2-6s-1 2-3 5c-1 2-3 3-3 6a7 7 0 0 0 7 7z"/>',
            veteran:            '<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/>',
            elo_2000:           '<path d="M6 3h12l4 6-10 12L2 9z"/>',
            top_1:              '<path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/>',
            tournament_winner:  '<path d="M6 4h12v7a6 6 0 0 1-12 0z"/><path d="M6 4H4v3a3 3 0 0 0 3 3"/><path d="M18 4h2v3a3 3 0 0 1-3 3"/><path d="M10 17h4"/><path d="M12 13v4"/>',
            tournament_master:  '<path d="M6 4h12v7a6 6 0 0 1-12 0z"/><path d="M6 4H4v3a3 3 0 0 0 3 3"/><path d="M18 4h2v3a3 3 0 0 1-3 3"/><path d="M10 17h4"/><path d="M12 13v4"/>',
            vip:                '<path d="M12 3l2.9 6.3 6.6.6-5 4.7 1.5 6.7L12 17.9 6 21.3l1.5-6.7-5-4.7 6.6-.6z"/>'
        };
        const inner = paths[code] || '<path d="M12 3l2.9 6.3 6.6.6-5 4.7 1.5 6.7L12 17.9 6 21.3l1.5-6.7-5-4.7 6.6-.6z"/>';
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            inner + '</svg>';
    }

    // ==== Открытие/закрытие ====
    function openAchievementsScreen() {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const tab = document.getElementById('tab-achievements');
        if (tab) tab.classList.add('active');

        if (window.Telegram?.WebApp?.BackButton) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(closeAchievementsScreen);
        }
        window.scrollTo(0, 0);
        loadAchievementsScreen();
    }

    function closeAchievementsScreen() {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const profileTab = document.getElementById('tab-profile');
        if (profileTab) profileTab.classList.add('active');
        const profileBtn = document.querySelector('.tab-btn[data-tab="profile"]');
        if (profileBtn) profileBtn.classList.add('active');

        if (window.Telegram?.WebApp?.BackButton) {
            window.Telegram.WebApp.BackButton.hide();
        }
    }

    // ==== Загрузка ====
    async function loadAchievementsScreen() {
        const userId = getUserId();
        const api = getApiUrl();
        if (!userId || !api) return;

        const grid = document.getElementById('ach-grid');
        if (grid) grid.innerHTML = '<div class="tn-loading">Загрузка...</div>';

        try {
            if (!catalogCache) {
                catalogCache = await fetch(api + '/api/achievements/catalog').then(r => r.json());
            }
            userAchCache = await fetch(api + '/api/achievements/user?tg_id=' + userId).then(r => r.json());

            renderAchievementsScreen();
        } catch (e) {
            console.error('[ACH SCREEN]', e);
            if (grid) grid.innerHTML = '<div class="tn-loading">Ошибка загрузки</div>';
        }
    }

    function renderAchievementsScreen() {
        const catalog = catalogCache || [];
        const userAch = userAchCache || [];

        // Мапа полученных: code → granted_at
        const grantedMap = {};
        userAch.forEach(a => { grantedMap[a.code] = a.granted_at; });

        // Прогресс
        const total = catalog.length;
        const done = userAch.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;

        const doneEl = document.getElementById('ach-count-done');
        const totalEl = document.getElementById('ach-count-total');
        const pctEl = document.getElementById('ach-pct');
        if (doneEl) doneEl.textContent = done;
        if (totalEl) totalEl.textContent = total;
        if (pctEl) pctEl.textContent = pct + '% открыто';

        // Круг прогресса — обводка
        const ring = document.getElementById('ach-progress-ring');
        if (ring) {
            const circumference = 2 * Math.PI * 36; // ≈ 226
            const offset = circumference * (1 - done / Math.max(total, 1));
            setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100);
        }

        // Сетка карточек
        const grid = document.getElementById('ach-grid');
        if (!grid) return;

        if (catalog.length === 0) {
            grid.innerHTML = '<div class="tn-loading">Нет достижений в каталоге</div>';
            return;
        }

        grid.innerHTML = catalog.map(a => {
            const isDone = !!grantedMap[a.code];
            const date = isDone ? grantedMap[a.code].substring(0, 10) : '';
            const cls = 'ach-card rarity-' + (a.rarity || 'common') + (isDone ? '' : ' locked');

            return '<div class="' + cls + '">' +
                '<div class="ach-hex">' +
                    hexSvg() +
                    '<div class="ach-hex-icon">' + (isDone ? achIcon(a.code) : lockSvg()) + '</div>' +
                '</div>' +
                '<div class="ach-card-name">' + (isDone ? escapeHtml(a.name) : '???') + '</div>' +
                '<div class="ach-card-desc">' + (isDone ? escapeHtml(a.description || '') : 'Заблокировано') + '</div>' +
                '<div class="ach-card-date">' + (isDone ? 'ПОЛУЧЕНО ' + date : 'НЕ ПОЛУЧЕНО') + '</div>' +
            '</div>';
        }).join('');
    }

    // ==== escapeHtml fallback ====
    function escapeHtml(s) {
        if (typeof window.escapeHtml === 'function') return window.escapeHtml(s);
        return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    // ==== Привязка ====
    document.addEventListener('DOMContentLoaded', () => {
        const btnBack = document.getElementById('ach-back');
        if (btnBack) btnBack.addEventListener('click', closeAchievementsScreen);
    });

    window.openAchievementsScreen = openAchievementsScreen;
    window.closeAchievementsScreen = closeAchievementsScreen;
})();
