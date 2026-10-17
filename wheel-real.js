// ================== РУЛЕТКА (отдельный экран) ==================
(function() {
    'use strict';

    // ==== SVG-иконки ====
    const ICON_LM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;color:#FFD700;"><circle cx="12" cy="12" r="9" fill="rgba(255,215,0,0.15)"/><path d="M12 7v10M9.5 10h5M9.5 14h5"/></svg>';
    const ICON_CROWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;color:#FFD700;"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" fill="rgba(255,215,0,0.2)"/><path d="M5 20h14"/></svg>';
    const ICON_SKIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;color:#4ade80;"><path d="M4 7h16v3H4z" fill="rgba(74,222,128,0.2)"/><path d="M5 10v9h14v-9"/><path d="M12 7v12"/><path d="M8 7V5a2 2 0 0 1 4 0 2 2 0 0 1 4 0v2"/></svg>';

    const SPIN_COST = 100;
    const SPIN_DURATION = 10000; // 10 секунд
    const SLOT_W = 60;
    const BASE_SLOTS = 90;    // длина одной ленты (визуально бесконечная)
    const TOTAL_SLOTS = BASE_SLOTS * 2; // 2 копии, чтобы можно было перескочить незаметно

    let isSpinning = false;

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

    function slotBg(p) {
        if (p.type === 'lm' && p.value >= 100) return 'linear-gradient(135deg, #ffd700, #cc9900)';
        if (p.type === 'lm' && p.value >= 50) return 'linear-gradient(135deg, #ef4444, #b91c1c)';
        if (p.type === 'premium') return 'linear-gradient(135deg, #ffd700, #b8860b)';
        if (p.type === 'skin') return 'linear-gradient(135deg, #4ade80, #16a34a)';
        return 'linear-gradient(135deg, #252542, #1a1a2e)';
    }

    // ==== Генерация ленты с весами (редкие реже) ====
    function buildTrackSlots(prizes, count) {
        // Строим массив по весам, чтобы редкие реже попадали
        const weighted = [];
        prizes.forEach(p => {
            const w = Math.max(1, Math.round((p.chance || p.weight || 1) * 10));
            for (let i = 0; i < w; i++) weighted.push(p);
        });
        if (weighted.length === 0) weighted.push(...prizes);

        let html = '';
        for (let i = 0; i < count; i++) {
            const p = weighted[Math.floor(Math.random() * weighted.length)];
            html += '<div class="roulette-slot" style="background:' + slotBg(p) + ';">' + iconForPrize(p) + '</div>';
        }
        return html;
    }

    // ==== Открытие/закрытие ====
    function openRouletteScreen() {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const tab = document.getElementById('tab-roulette');
        if (tab) tab.classList.add('active');
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

        if (track) {
            // Двойная лента — визуально бесконечная
            track.innerHTML = buildTrackSlots(prizes, TOTAL_SLOTS);
            track.style.transition = 'none';
            // Стартуем в середине второй половины — чтобы можно было "перескочить"
            track.style.transform = 'translateX(' + (-BASE_SLOTS * SLOT_W) + 'px)';
        }

        if (grid) {
            grid.innerHTML = prizes.map(p =>
                '<div class="roulette-prize-card">' +
                    '<div class="roulette-prize-icon">' + iconForPrize(p) + '</div>' +
                    '<div class="roulette-prize-label">' + labelForPrize(p) + '</div>' +
                '</div>'
            ).join('');
        }

        if (balance) {
            const coins = status.coins || user.coins || 0;
            balance.textContent = '💰 ' + coins + ' LM';
        }

        if (recent) {
            const wins = status.recent_wins || [];
            if (wins.length === 0) {
                recent.innerHTML = '<div class="roulette-recent-empty">Пока нет выигрышей</div>';
            } else {
                recent.innerHTML = wins.map(w => {
                    let icon = ICON_LM, label = '', color = '#FFD700';
                    if (w.type === 'premium') { icon = ICON_CROWN; label = 'Премиум'; color = '#FFD700'; }
                    else if (w.type === 'skin') { icon = ICON_SKIN; label = 'Скин'; color = '#4ade80'; }
                    else { label = '+' + w.value + ' LM'; }

                    let timeStr = '';
                    try {
                        if (w.at) {
                            const d = new Date(w.at.replace(' ', 'T') + 'Z');
                            const diff = Math.floor((Date.now() - d.getTime()) / 1000);
                            if (diff < 60) timeStr = 'только что';
                            else if (diff < 3600) timeStr = Math.floor(diff/60) + ' мин назад';
                            else if (diff < 86400) timeStr = Math.floor(diff/3600) + ' ч назад';
                            else timeStr = Math.floor(diff/86400) + ' дн назад';
                        }
                    } catch(e) { timeStr = ''; }

                    return '<div class="roulette-recent-row">' +
                        '<div class="roulette-recent-icon" style="color:' + color + ';">' + icon + '</div>' +
                        '<div class="roulette-recent-label" style="color:' + color + ';">' + label + '</div>' +
                        '<div class="roulette-recent-time">' + timeStr + '</div>' +
                    '</div>';
                }).join('');
            }
        }

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

        if (spinBtn) spinBtn.disabled = true;
        if (window.haptic) window.haptic('medium');

        try {
            const res = await fetch(api + '/api/wheel/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            }).then(r => r.json());

            if (res.error) {
                showSpinToast('❌ ' + res.error, 'error');
                isSpinning = false;
                if (spinBtn) spinBtn.disabled = false;
                return;
            }

            // ==== Анимация ====
            const wrapW = wrap ? wrap.offsetWidth : 360;
            const centerOffset = wrapW / 2 - SLOT_W / 2;

            // Победитель — где-то во второй половине ленты, чтобы ехать далеко
            const minIdx = BASE_SLOTS + 10;
            const maxIdx = TOTAL_SLOTS - 5;
            const winnerIdx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx));

            // Стартовая позиция — середина первой половины
            const startIdx = Math.floor(BASE_SLOTS / 2);
            const startX = -(startIdx * SLOT_W) + centerOffset;
            const targetX = -(winnerIdx * SLOT_W) + centerOffset;

            if (track) {
                track.style.transition = 'none';
                track.style.transform = 'translateX(' + startX + 'px)';
                void track.offsetWidth;

                // Очень длинный хвост — последние секунды ползёт медленно
                track.style.transition = 'transform ' + (SPIN_DURATION / 1000) + 's cubic-bezier(0.06, 0.9, 0.12, 1)';
                track.style.transform = 'translateX(' + targetX + 'px)';
            }

            setTimeout(() => {
                if (window.haptic) window.haptic('heavy');
                showWinModal(res.prize_type, res.prize_value, () => {
                    loadRoulette();
                    isSpinning = false;
                });
            }, SPIN_DURATION + 200);

        } catch (e) {
            showSpinToast('Ошибка: ' + (e.message || e), 'error');
            isSpinning = false;
            if (spinBtn) spinBtn.disabled = false;
        }
    }

    // ==== SVG-иконка для модалки ====
    function bigIconForPrize(type) {
        if (type === 'premium') {
            return '<svg viewBox="0 0 64 64" fill="none" stroke="#FFD700" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:72px;height:72px;">' +
                '<path d="M14 42L8 14l14 13L32 12l10 15 14-13-6 28H14z" fill="rgba(255,215,0,0.25)"/>' +
                '<path d="M14 52h36"/></svg>';
        }
        if (type === 'skin') {
            return '<svg viewBox="0 0 64 64" fill="none" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:72px;height:72px;">' +
                '<path d="M10 20h44v10H10z" fill="rgba(74,222,128,0.25)"/>' +
                '<path d="M14 30v22h36V30"/>' +
                '<path d="M32 20v32"/>' +
                '<path d="M22 20v-5a5 5 0 0 1 10 0 5 5 0 0 1 10 0v5"/></svg>';
        }
        return '<svg viewBox="0 0 64 64" fill="none" stroke="#FFD700" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width:72px;height:72px;">' +
            '<circle cx="32" cy="32" r="24" fill="rgba(255,215,0,0.2)"/>' +
            '<circle cx="32" cy="32" r="24"/>' +
            '<path d="M32 18v28M24 28h16M24 36h16"/></svg>';
    }

    // ==== Модалка ====
    function showWinModal(prizeType, prizeValue, onClose) {
        const old = document.getElementById('luma-win-modal');
        if (old) old.remove();

        let title = '', subtitle = '', accent = '#22c55e', iconHTML = '';
        if (prizeType === 'lm') {
            title = '+' + prizeValue + ' LM';
            subtitle = 'Ты выиграл монеты!';
            accent = '#FFD700';
            iconHTML = bigIconForPrize('lm');
        } else if (prizeType === 'premium') {
            title = 'ПРЕМИУМ';
            subtitle = 'Подписка на месяц!';
            accent = '#FFD700';
            iconHTML = bigIconForPrize('premium');
        } else if (prizeType === 'skin') {
            title = 'СКИН';
            subtitle = 'Эксклюзивный скин!';
            accent = '#4ade80';
            iconHTML = bigIconForPrize('skin');
        }

        let confettiHTML = '';
        for (let i = 0; i < 40; i++) {
            const a = Math.random() * Math.PI * 2;
            const d = 120 + Math.random() * 180;
            const x = Math.cos(a) * d;
            const y = Math.sin(a) * d;
            const colors = ['#FFD700', '#22c55e', '#22c55e', '#ef4444', '#3b82f6', '#ec4899'];
            const c = colors[Math.floor(Math.random() * colors.length)];
            const delay = (Math.random() * 0.3).toFixed(2);
            const size = 6 + Math.random() * 8;
            confettiHTML += '<span class="luma-confetti" style="' +
                '--tx:' + x + 'px;--ty:' + y + 'px;--delay:' + delay + 's;' +
                'background:' + c + ';width:' + size + 'px;height:' + size + 'px;' +
                'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';"></span>';
        }

        const modal = document.createElement('div');
        modal.id = 'luma-win-modal';
        modal.className = 'luma-win-overlay';
        modal.innerHTML =
            '<div class="luma-win-card" style="--accent:' + accent + ';">' +
                '<div class="luma-confetti-wrap">' + confettiHTML + '</div>' +
                '<div class="luma-win-icon">' + iconHTML + '</div>' +
                '<div class="luma-win-title">' + title + '</div>' +
                '<div class="luma-win-subtitle">' + subtitle + '</div>' +
                '<button class="luma-win-btn" id="luma-win-close">🎉 Забрать</button>' +
            '</div>';

        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('show'));

        if (prizeType === 'lm') {
            const titleEl = modal.querySelector('.luma-win-title');
            const target = parseInt(prizeValue, 10) || 0;
            const dur = 1200;
            const t0 = performance.now();
            function tick(now) {
                const p = Math.min((now - t0) / dur, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                const val = Math.floor(eased * target);
                titleEl.textContent = '+' + val + ' LM';
                if (p < 1) requestAnimationFrame(tick);
                else titleEl.textContent = '+' + target + ' LM';
            }
            requestAnimationFrame(tick);
        }

        const closeBtn = modal.querySelector('#luma-win-close');
        const closeFn = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
                if (onClose) onClose();
            }, 250);
        };
        closeBtn.addEventListener('click', closeFn);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeFn(); });
    }

    // ==== Toast ====
    function showSpinToast(text, type) {
        const old = document.getElementById('luma-spin-toast');
        if (old) old.remove();
        const t = document.createElement('div');
        t.id = 'luma-spin-toast';
        t.className = 'luma-spin-toast' + (type === 'error' ? ' error' : '');
        t.textContent = text;
        document.body.appendChild(t);
        requestAnimationFrame(() => t.classList.add('show'));
        setTimeout(() => {
            t.classList.remove('show');
            setTimeout(() => t.remove(), 300);
        }, 2600);
    }

    // ==== Стили ====
    function injectStyles() {
        if (document.getElementById('luma-wheel-styles')) return;
        const s = document.createElement('style');
        s.id = 'luma-wheel-styles';
        s.textContent = `
        .luma-win-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
            display: flex; align-items: center; justify-content: center;
            z-index: 99999; opacity: 0;
            transition: opacity .25s ease; padding: 20px;
        }
        .luma-win-overlay.show { opacity: 1; }
        .luma-win-card {
            position: relative; width: 100%; max-width: 320px;
            background: linear-gradient(160deg, #1e1b2e 0%, #15132a 100%);
            border: 1px solid rgba(34,197,94,0.35);
            border-radius: 24px; padding: 32px 24px 24px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
            transform: scale(0.7); opacity: 0;
            transition: transform .45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .3s ease;
        }
        .luma-win-overlay.show .luma-win-card { transform: scale(1); opacity: 1; }
        .luma-win-icon {
            display: inline-flex; align-items: center; justify-content: center;
            width: 120px; height: 120px; border-radius: 50%;
            background: radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(34,197,94,0.08) 60%, transparent 75%);
            margin-bottom: 16px; animation: lumaPulse 1.8s ease-in-out infinite;
        }
        @keyframes lumaPulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px var(--accent)); }
            50% { transform: scale(1.08); filter: drop-shadow(0 0 28px var(--accent)); }
        }
        .luma-win-title {
            font-size: 34px; font-weight: 800; color: var(--accent);
            letter-spacing: 0.5px; margin-bottom: 6px;
            text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 60%, transparent);
        }
        .luma-win-subtitle { font-size: 14px; color: #a0a0b8; margin-bottom: 22px; }
        .luma-win-btn {
            width: 100%; padding: 14px; border: none; border-radius: 14px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: #fff; font-size: 16px; font-weight: 700; cursor: pointer;
            box-shadow: 0 8px 24px rgba(34,197,94,0.4);
            transition: transform .15s ease, box-shadow .2s ease;
        }
        .luma-win-btn:active { transform: scale(0.97); box-shadow: 0 4px 12px rgba(34,197,94,0.5); }
        .luma-confetti-wrap { position: absolute; top: 50%; left: 50%; width: 0; height: 0; pointer-events: none; }
        .luma-confetti {
            position: absolute; top: 0; left: 0; opacity: 0;
            animation: lumaConfetti 1.4s cubic-bezier(0.15, 0.7, 0.3, 1) forwards;
            animation-delay: var(--delay);
        }
        @keyframes lumaConfetti {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            60% { opacity: 1; }
            100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1) rotate(360deg); opacity: 0; }
        }
        .luma-spin-toast {
            position: fixed; top: 24px; left: 50%;
            transform: translate(-50%, -20px);
            background: rgba(30,27,46,0.95);
            border: 1px solid rgba(34,197,94,0.4);
            color: #fff; font-size: 14px; font-weight: 600;
            padding: 12px 20px; border-radius: 12px;
            z-index: 100000; opacity: 0;
            transition: opacity .25s ease, transform .25s ease;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            pointer-events: none;
        }
        .luma-spin-toast.show { opacity: 1; transform: translate(-50%, 0); }
        .luma-spin-toast.error { border-color: rgba(239,68,68,0.6); }

        /* История выигрышей */
        .roulette-recent-row {
            display: flex; align-items: center; gap: 12px;
            padding: 12px 16px;
            background: linear-gradient(135deg, #1a1a2e, #15132a);
            border: 1px solid rgba(34,197,94,0.15);
            border-radius: 12px;
            margin-bottom: 8px;
        }
        .roulette-recent-icon {
            display: flex; align-items: center; justify-content: center;
            width: 32px; height: 32px;
            border-radius: 50%;
            background: rgba(255,255,255,0.04);
            flex-shrink: 0;
        }
        .roulette-recent-icon svg { width: 20px !important; height: 20px !important; }
        .roulette-recent-label {
            flex: 1; font-weight: 700; font-size: 15px;
        }
        .roulette-recent-time {
            font-size: 12px; color: #6b6b85; font-weight: 500;
        }
        .roulette-recent-empty {
            padding: 20px; text-align: center;
            color: #6b6b85; font-size: 14px;
            background: rgba(255,255,255,0.02);
            border-radius: 12px;
            border: 1px dashed rgba(34,197,94,0.15);
        }
        `;
        document.head.appendChild(s);
    }

    document.addEventListener('DOMContentLoaded', () => {
        injectStyles();
        const btnRoulette = document.getElementById('btn-roulette');
        if (btnRoulette) {
            btnRoulette.addEventListener('click', () => {
                if (window.haptic) window.haptic('light');
                openRouletteScreen();
            });
        }
        const btnBack = document.getElementById('roulette-back');
        if (btnBack) btnBack.addEventListener('click', closeRouletteScreen);
    });

    window.openRouletteScreen = openRouletteScreen;
    window.closeRouletteScreen = closeRouletteScreen;
})();
