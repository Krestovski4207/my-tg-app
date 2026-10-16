// ================== КОЛЕСО ФОРТУНЫ (SVG, премиум) ==================
(function() {
    'use strict';

    try {

    // ==== SVG-иконки ====
    const SVG_LM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;display:inline-block;vertical-align:-0.15em;"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9h5M9.5 15h5"/></svg>';
    const SVG_CROWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;display:inline-block;vertical-align:-0.15em;"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z"/><path d="M5 20h14"/></svg>';
    const SVG_GIFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;display:inline-block;vertical-align:-0.15em;"><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M19 12v9H5v-9"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>';

    function getPrizeIcon(type) {
        if (type === 'lm') return SVG_LM;
        if (type === 'premium') return SVG_CROWN;
        if (type === 'skin') return SVG_GIFT;
        return SVG_LM;
    }

    function getPrizeLabel(prize) {
        if (prize.type === 'lm') return getPrizeIcon('lm') + ' ' + prize.value + ' LM';
        if (prize.type === 'premium') return getPrizeIcon('premium') + ' Премиум 30д';
        if (prize.type === 'skin') return getPrizeIcon('skin') + ' Скин';
        return '';
    }

    let isSpinning = false;
    let wheelState = null;

    const SECTORS = 12;
    const RED = '#c81e2c';
    const GREEN = '#00a855';
    const COLORS = [RED, RED, GREEN, RED, RED, GREEN, RED, RED, RED, GREEN, RED, GREEN];

    async function loadWheelStatus() {
        if (!window.tgUser || !tgUser.id) return null;
        try {
            const res = await apiGet('/api/wheel/status?tg_id=' + tgUser.id);
            if (res.error) return null;
            wheelState = res;
            return res;
        } catch (e) {
            console.error('[WHEEL]', e);
            return null;
        }
    }

    async function openWheel() {
        const status = await loadWheelStatus();
        if (!status) { showToast('Ошибка загрузки'); return; }
        const content = buildWheelHTML(status);
        // Используем ТОЛЬКО правильные модалки (openModal — это профиль игрока!)
        if (typeof window.openProfileModal === 'function') {
            window.openProfileModal('🎡 Колесо фортуны', content);
        } else if (typeof window.openMoreModal === 'function') {
            window.openMoreModal('🎡 Колесо фортуны', content);
        } else {
            console.error('[WHEEL] Модалка не найдена! openProfileModal:', typeof window.openProfileModal, 'openMoreModal:', typeof window.openMoreModal);
            alert('Ошибка: модалка не загружена');
            return;
        }
        setTimeout(() => {
            const spinBtn = document.getElementById('wheel-spin-real');
            spinBtn?.addEventListener('click', spinWheel);
        }, 100);
    }

    function buildWheelHTML(status) {
        const canSpin = status.can_spin;
        const secondsLeft = status.seconds_left;

        let timerText = '';
        if (!canSpin && secondsLeft > 0) {
            const h = Math.floor(secondsLeft / 3600);
            const m = Math.floor((secondsLeft % 3600) / 60);
            timerText = `<div class="wheel-timer">⏰ Следующая попытка: ${h}ч ${m}м</div>`;
        }

        const prizesHTML = status.prizes.map(p => {
            return `<div class="wheel-prize-item">${getPrizeLabel(p)}</div>`;
        }).join('');

        return `
            <div class="wheel-modal-subtitle">Одно вращение в день · Призы LM и Премиум</div>
            <div class="wheel-modal-content">
                <div class="wheel-container">
                    <div class="wheel-pointer-real"></div>
                    <div class="wheel-rotor" id="wheel-rotor">
                        <svg viewBox="0 0 200 200" class="wheel-svg-real">
                            ${buildWheelSVG()}
                        </svg>
                    </div>
                </div>
                ${timerText}
                <button class="wheel-spin-real ${!canSpin ? 'disabled' : ''}"
                        id="wheel-spin-real"
                        ${!canSpin ? 'disabled' : ''}>
                    ⚡ ${canSpin ? 'Крутить' : 'Кулдаун'}
                </button>
                <div class="wheel-spins-counter">Всего вращений: <b>${status.total_spins || 0}</b></div>
                ${renderRecentPrizes()}
            </div>
        `;
    }

    function buildWheelSVG() {
        const centerX = 100, centerY = 100, radius = 95;
        const angleStep = 360 / SECTORS;
        const prizes = wheelState?.prizes || [];
        let paths = '';
        for (let i = 0; i < SECTORS; i++) {
            const startAngle = (i * angleStep - 90) * Math.PI / 180;
            const endAngle = ((i + 1) * angleStep - 90) * Math.PI / 180;
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;
            const fill = COLORS[i];
            paths += `<path d="${path}" fill="${fill}" stroke="rgba(0,255,136,0.2)" stroke-width="0.8"/>`;
            const textAngle = ((i + 0.5) * angleStep - 90) * Math.PI / 180;
            const textX = centerX + (radius * 0.68) * Math.cos(textAngle);
            const textY = centerY + (radius * 0.68) * Math.sin(textAngle);
            const prize = prizes[i];
            let text = '';
            if (prize) {
                if (prize.type === 'lm') text = prize.value;
                else if (prize.type === 'premium') text = 'PREM';
                else text = 'SKIN';
            }
            const fontSize = prize && prize.type === 'lm' ? 11 : 7;
            paths += `<text x="${textX}" y="${textY}" fill="#fff" font-size="${fontSize}" font-weight="900" text-anchor="middle" dominant-baseline="middle" transform="rotate(${i * angleStep + angleStep/2} ${textX} ${textY})">${text}</text>`;
        }
        paths += `<circle cx="${centerX}" cy="${centerY}" r="16" fill="#0a0a12" stroke="url(#wheelGrad)" stroke-width="2"/>`;
        paths += `<circle cx="${centerX}" cy="${centerY}" r="6" fill="url(#wheelGrad)"/>`;
        paths += `<defs><linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00ff88"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs>`;
        return paths;
    }

    async function spinWheel() {
        if (isSpinning) return;
        if (!window.tgUser || !tgUser.id) return;
        isSpinning = true;
        if (window.haptic) window.haptic('medium');
        const rotor = document.getElementById('wheel-rotor');
        const spinBtn = document.getElementById('wheel-spin-real');
        if (spinBtn) { spinBtn.disabled = true; spinBtn.textContent = 'Крутим...'; }
        try {
            const res = await apiPost('/api/wheel/spin', { user_id: tgUser.id });
            if (res.error) { showToast('❌ ' + res.error); isSpinning = false; return; }
            const prizeIndex = res.winner_index || 0;
            const angleStep = 360 / (res.total_prizes || SECTORS);
            const sectorCenter = prizeIndex * angleStep + angleStep / 2;
            const targetAngle = 360 * 5 + (360 - sectorCenter);
            const jitter = (Math.random() - 0.5) * (angleStep * 0.6);
            const totalRotation = targetAngle + jitter;
            if (rotor) {
                rotor.style.transition = 'transform 4s cubic-bezier(0.15, 0.85, 0.15, 1)';
                rotor.style.transform = `rotate(${totalRotation}deg)`;
            }
            setTimeout(() => {
                if (window.haptic) window.haptic('success');
                let prizeLabel = res.prize_text || '';
                if (res.prize_type === 'premium') prizeLabel = '👑 Премиум на месяц!';
                showToast('🎉 ' + prizeLabel);
                setTimeout(() => {
                    if (typeof window.closeProfileModal === 'function') window.closeProfileModal();
                    else if (typeof window.closeMoreModal === 'function') window.closeMoreModal();
                    isSpinning = false;
                    setTimeout(openWheel, 300);
                }, 1500);
            }, 4100);
        } catch (e) {
            console.error('[WHEEL] spin error:', e);
            showToast('Ошибка');
            isSpinning = false;
            if (spinBtn) { spinBtn.disabled = false; spinBtn.textContent = '⚡ Крутить'; }
        }
    }

    const RECENT_PRIZES = [
        { nick: 'Maqsi', prize: '100 LM' },
        { nick: 'ayuki', prize: '100 LM' },
        { nick: 'Kursh', prize: '100 LM' }
    ];

    function renderRecentPrizes() {
        if (!RECENT_PRIZES.length) return '';
        return `
            <div class="wheel-recent">
                <div class="wheel-recent-title">Недавние крупные призы</div>
                ${RECENT_PRIZES.map(p => `
                    <div class="wheel-recent-item">
                        <div class="wheel-recent-nick">${typeof escapeHtml === 'function' ? escapeHtml(p.nick) : p.nick}</div>
                        <div class="wheel-recent-prize">${p.prize}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    window.openWheel = openWheel;
    console.log('[WHEEL] Initialized OK');
    window.loadWheelStatus = loadWheelStatus;
    } catch (e) {
        console.error('[WHEEL] INIT FATAL:', e);
    }

})();