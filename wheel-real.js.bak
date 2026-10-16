// ================== РУЛЕТКА (отдельный экран) ==================
(function() {
    'use strict';

    // ==== SVG-иконки ====
    const ICON_LM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;color:#FFD700;"><circle cx="12" cy="12" r="9" fill="rgba(255,215,0,0.15)"/><path d="M12 7v10M9.5 10h5M9.5 14h5"/></svg>';
    const ICON_CROWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;color:#FFD700;"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" fill="rgba(255,215,0,0.2)"/><path d="M5 20h14"/></svg>';
    const ICON_SKIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;color:#c084fc;"><path d="M4 7h16v3H4z" fill="rgba(192,132,252,0.2)"/><path d="M5 10v9h14v-9"/><path d="M12 7v12"/><path d="M8 7V5a2 2 0 0 1 4 0 2 2 0 0 1 4 0v2"/></svg>';

    const SPIN_COST = 100;
    let isSpinning = false;
    let totalSlots = 30;
    const SLOT_W = 60;

    function getUser() {
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) return tg.initDataUnsafe.user;
        } catch (e) {}
        try { if (typeof tgUser !== 'undefined' && tgUser && tgUser.id) return tgUser; } catch (e) {}
        if (window.tgUser && window.tgUser.id) return window.tgUser;
        return null;
    }

    function getApiUrl() {
        try {
            if (typeof API_URL !== 'undefined') return API_URL;
            if (window.API_URL) return window.API_URL;
        } catch (e) {}
        return '';
    }

    function iconForPrize(p) {
        if (p.type === 'lm') return ICON_LM;
        if (p.type === 'premium') return ICON_CROWN;
        if (p.type === 'skin') return ICON_SKIN;
        return ICON_LM;
    }

    function labelForPrize(p) {
        if (p.type === 'lm') return p.value + ' LM';
        if (p.type === 'premium') return 'ПРЕМИУМ';
        if (p.type === 'skin') return 'СКИН';
        return '?';
    }

    // ==== Открытие экрана рулетки ====
    function openRouletteScreen() {
        // Скрываем все вкладки
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        // Показываем рулетку
        const tab = document.getElementById('tab-roulette');
        if (tab) tab.classList.add('active');

        // BackButton Telegram
        if (window.Telegram?.WebApp?.BackButton) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(closeRouletteScreen);
        }

        window.scrollTo(0, 0);
        loadRoulette();
    }

    function closeRouletteScreen() {
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
    async function loadRoulette() {
        const user = getUser();
        if (!user) return;

        const api = getApiUrl();
        if (!api) return;

        try {
            const res = await fetch(api + '/api/wheel/status?tg_id=' + user.id).then(r => r.json());
            if (res.error) return;

            renderRoulette(res, user, api);
        } catch (e) {
            console.error('[ROULETTE]', e);
        }
    }

    function renderRoulette(status, user, api) {
        const track = document.getElementById('roulette-track');
        const grid = document.getElementById('roulette-prizes-grid');
        const balance = document.getElementById('roulette-balance');
        const spinBtn = document.getElementById('roulette-spin-main');
        const recent = document.getElementById('roulette-recent');

        const prizes = status.prizes || [];

        // Трек
        if (track) {
            let trackHTML = '';
            for (let i = 0; i < totalSlots; i++) {
                const p = prizes[Math.floor(Math.random() * prizes.length)];
                let bg = 'linear-gradient(135deg, #252542, #1a1a2e)';
                if (p.type === 'lm' && p.value >= 100) bg = 'linear-gradient(135deg, #ffd700, #cc9900)';
                else if (p.type === 'lm' && p.value >= 50) bg = 'linear-gradient(135deg, #ef4444, #b91c1c)';
                else if (p.type === 'premium') bg = 'linear-gradient(135deg, #ffd700, #b8860b)';
                else if (p.type === 'skin') bg = 'linear-gradient(135deg, #c084fc, #7c3aed)';

                trackHTML += '<div class="roulette-slot" style="background:' + bg + ';">' + iconForPrize(p) + '</div>';
            }
            track.innerHTML = trackHTML;
            track.style.transform = 'translateX(0)';
            track.style.transition = 'none';
        }

        // Сетка призов
        if (grid) {
            grid.innerHTML = prizes.map(p =>
                '<div class="roulette-prize-card">' +
                    '<div class="roulette-prize-icon">' + iconForPrize(p) + '</div>' +
                    '<div class="roulette-prize-label">' + labelForPrize(p) + '</div>' +
                '</div>'
            ).join('');
        }

        // Баланс
        if (balance) {
            const coins = status.coins || user.coins || 0;
            balance.textContent = '💰 ' + coins + ' LM';
        }

        // История
        if (recent) {
            recent.innerHTML = '<div class="roulette-recent-empty">Пока нет выигрышей</div>';
        }

        // Кнопка
        if (spinBtn) {
            spinBtn.disabled = false;
            spinBtn.onclick = () => spinRoulette(user, api);
        }
    }

    // ==== Кручение ====
    async function spinRoulette(user, api) {
        if (isSpinning) return;
        isSpinning = true;

        const spinBtn = document.getElementById('roulette-spin-main');
        const track = document.getElementById('roulette-track');
        const wrap = document.querySelector('.roulette-screen');

        if (spinBtn) { spinBtn.disabled = true; }

        try {
            const res = await fetch(api + '/api/wheel/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            }).then(r => r.json());

            if (res.error) {
                alert('❌ ' + res.error);
                isSpinning = false;
                if (spinBtn) spinBtn.disabled = false;
                return;
            }

            // Анимация
            const wrapW = wrap ? wrap.offsetWidth : 360;
            const centerOffset = wrapW / 2 - SLOT_W / 2;
            const winnerIdx = 15 + Math.floor(Math.random() * 13);
            const targetX = -(winnerIdx * SLOT_W) + centerOffset;

            if (track) {
                track.style.transition = 'none';
                track.style.transform = 'translateX(0)';
                void track.offsetWidth;
                track.style.transition = 'transform 5s cubic-bezier(0.15, 0.85, 0.15, 1)';
                track.style.transform = 'translateX(' + targetX + 'px)';
            }

            setTimeout(() => {
                let prize = '';
                if (res.prize_type === 'lm') prize = '🪙 +' + res.prize_value + ' LM';
                else if (res.prize_type === 'premium') prize = '👑 Премиум на месяц!';
                else if (res.prize_type === 'skin') prize = '🎁 Скин!';
                alert('🎉 ' + prize);

                setTimeout(() => {
                    loadRoulette();
                    isSpinning = false;
                }, 500);
            }, 5200);

        } catch (e) {
            alert('Ошибка: ' + (e.message || e));
            isSpinning = false;
            if (spinBtn) spinBtn.disabled = false;
        }
    }

    // ==== Привязка кнопок ====
    document.addEventListener('DOMContentLoaded', () => {
        // Кнопка рулетки в профиле
        const btnRoulette = document.getElementById('btn-roulette');
        if (btnRoulette) {
            btnRoulette.addEventListener('click', () => {
                if (window.haptic) window.haptic('light');
                openRouletteScreen();
            });
        }

        // Кнопка назад
        const btnBack = document.getElementById('roulette-back');
        if (btnBack) {
            btnBack.addEventListener('click', closeRouletteScreen);
        }
    });

    window.openRouletteScreen = openRouletteScreen;
    window.closeRouletteScreen = closeRouletteScreen;
})();
