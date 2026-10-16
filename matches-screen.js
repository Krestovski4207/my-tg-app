// ================== ЭКРАН МАТЧЕЙ (Alliance) ==================
(function() {
    'use strict';

    let matchesCache = null;

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

    function escapeHtml(s) {
        if (typeof window.escapeHtml === 'function') return window.escapeHtml(s);
        return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    // SVG-иконка меча для пустого состояния
    function swordIcon() {
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/>' +
            '<path d="M13 19l6-6"/>' +
            '<path d="M16 16l4 4"/>' +
            '<path d="M19 21l2-2"/>' +
            '</svg>';
    }

    // ==== Открытие/закрытие ====
    function openMatchesScreen() {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const tab = document.getElementById('tab-matches');
        if (tab) tab.classList.add('active');

        if (window.Telegram?.WebApp?.BackButton) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(closeMatchesScreen);
        }
        window.scrollTo(0, 0);
        loadMatchesScreen();
    }

    function closeMatchesScreen() {
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
    async function loadMatchesScreen() {
        const userId = getUserId();
        const api = getApiUrl();
        if (!userId || !api) return;

        const list = document.getElementById('matches-screen-list');
        if (list) list.innerHTML = '<div class="tn-loading">Загрузка...</div>';

        try {
            const data = await fetch(api + '/api/user/' + userId).then(r => r.json());
            matchesCache = data.matches || [];
            renderMatchesScreen();
        } catch (e) {
            console.error('[MATCHES SCREEN]', e);
            if (list) list.innerHTML = '<div class="tn-loading">Ошибка загрузки</div>';
        }
    }

    function renderMatchesScreen() {
        const list = document.getElementById('matches-screen-list');
        if (!list) return;

        const matches = matchesCache || [];

        if (matches.length === 0) {
            list.innerHTML =
                '<div class="matches-empty">' +
                    swordIcon() +
                    '<div class="matches-empty-title">Нет матчей</div>' +
                    '<div class="matches-empty-sub">Сыграй первый матч, чтобы увидеть статистику</div>' +
                '</div>';
            return;
        }

        list.innerHTML = matches.map(m => {
            const isWin = m.result === 'win';
            const eloChange = Number(m.elo_change) || 0;
            const coinsChange = Number(m.coins_change) || 0;
            const eloText = (eloChange >= 0 ? '+' : '') + eloChange;
            const coinsText = (coinsChange >= 0 ? '+' : '') + coinsChange;
            const date = (m.date || '').substring(0, 16);

            return '<div class="match-card ' + (isWin ? 'win' : 'lose') + '" data-match-id="' + m.match_id + '">' +
                '<div class="match-card-head">' +
                    '<div class="match-card-map">' + escapeHtml(m.map || '—') + '</div>' +
                    '<div class="match-card-mode">' + escapeHtml(m.mode || '') + '</div>' +
                    '<div class="match-card-result ' + (isWin ? 'win' : 'lose') + '">' + (isWin ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ') + '</div>' +
                '</div>' +
                '<div class="match-card-score">' +
                    '<div class="match-card-score-value">' + escapeHtml(m.score || '0:0') + '</div>' +
                    '<div class="match-card-score-label">счёт</div>' +
                '</div>' +
                '<div class="match-card-foot">' +
                    '<div class="match-card-kd"><span class="lbl">K/D:</span> ' + (m.kills || 0) + '/' + (m.deaths || 0) + '</div>' +
                    '<div class="match-card-elo' + (eloChange < 0 ? ' minus' : '') + '">' + eloText + ' ELO</div>' +
                    '<div class="match-card-coins">' + coinsText + ' 💰</div>' +
                '</div>' +
                '<div class="match-card-date">' + date + '</div>' +
            '</div>';
        }).join('');

        // Клик → openMatchModal
        list.querySelectorAll('.match-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.matchId;
                if (window.haptic) window.haptic('light');
                if (typeof window.openMatchModal === 'function') {
                    window.openMatchModal(id);
                } else {
                    console.warn('openMatchModal не определена');
                }
            });
        });
    }

    // ==== Привязка ====
    document.addEventListener('DOMContentLoaded', () => {
        const btnBack = document.getElementById('matches-back');
        if (btnBack) btnBack.addEventListener('click', closeMatchesScreen);
    });

    window.openMatchesScreen = openMatchesScreen;
    window.closeMatchesScreen = closeMatchesScreen;
})();
