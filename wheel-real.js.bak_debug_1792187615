// ================== КОЛЕСО ФОРТУНЫ ==================
(function() {
    'use strict';

    // ==== SVG ====
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

    // ==== СВОЯ МОДАЛКА ====
    function showWheelModal(content) {
        const old = document.getElementById('wheel-modal-overlay');
        if (old) old.remove();

        const overlay = document.createElement('div');
        overlay.id = 'wheel-modal-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;transition:opacity 0.3s,visibility 0.3s;';

        overlay.innerHTML = '<div class="modal wheel-modal-real" style="max-width:440px;width:100%;max-height:90vh;overflow-y:auto;background:linear-gradient(135deg,rgba(30,30,45,0.95),rgba(15,15,25,0.95));border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px 20px;box-shadow:0 20px 60px rgba(0,0,0,0.6);transform:scale(0.85);transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);position:relative;">' +
            '<button id="wheel-modal-x" style="position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.06);border:none;color:#aaa;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;">✕</button>' +
            '<h2 style="text-align:center;font-size:22px;font-weight:900;color:#fff;margin:0 0 16px 0;text-transform:uppercase;letter-spacing:2px;">🎡 Колесо фортуны</h2>' +
            '<div id="wheel-modal-body">' + content + '</div>' +
        '</div>';

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.style.visibility = 'visible';
            const modal = overlay.querySelector('.modal');
            if (modal) modal.style.transform = 'scale(1)';
        });

        document.getElementById('wheel-modal-x').addEventListener('click', closeWheelModal);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWheelModal(); });
    }

    function closeWheelModal() {
        const overlay = document.getElementById('wheel-modal-overlay');
        if (!overlay) return;
        overlay.style.opacity = '0';
        overlay.style.visibility = 'hidden';
        const modal = overlay.querySelector('.modal');
        if (modal) modal.style.transform = 'scale(0.85)';
        document.body.style.overflow = '';
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300);
    }

    async function openWheel() {
        const status = await loadWheelStatus();
        if (!status) { showToast('Ошибка загрузки'); return; }
        const content = buildWheelHTML(status);
        showWheelModal(content);
        setTimeout(() => {
            const spinBtn = document.getElementById('wheel-spin-real');
            if (spinBtn) spinBtn.addEventListener('click', spinWheel);
        }, 200);
    }

    function buildWheelHTML(status) {
        const canSpin = status.can_spin;
        const secondsLeft = status.seconds_left;

        let timerText = '';
        if (!canSpin && secondsLeft > 0) {
            const h = Math.floor(secondsLeft / 3600);
            const m = Math.floor((secondsLeft % 3600) / 60);
            timerText = '<div class="wheel-timer">⏰ Следующая попытка: ' + h + 'ч ' + m + 'м</div>';
        }

        const prizesHTML = status.prizes.map(p => {
            return '<div class="wheel-prize-item">' + getPrizeLabel(p) + '</div>';
        }).join('');

        return '<div class="wheel-modal-subtitle">Одно вращение в день · Призы LM и Премиум</div>' +
            '<div class="wheel-modal-content">' +
                '<div class="wheel-container">' +
                    '<div class="wheel-pointer-real"></div>' +
                    '<div class="wheel-rotor" id="wheel-rotor">' +
                        '<svg viewBox="0 0 200 200" class="wheel-svg-real">' + buildWheelSVG() + '</svg>' +
                    '</div>' +
                '</div>' +
                timerText +
                '<button class="wheel-spin-real" id="wheel-spin-real"' + (canSpin ? '' : ' disabled') + '>⚡ ' + (canSpin ? 'Крутить' : 'Кулдаун') + '</button>' +
                '<div class="wheel-spins-counter">Всего вращений: <b>' + (status.total_spins || 0) + '</b></div>' +
                renderRecentPrizes() +
            '</div>';
    }

    function buildWheelSVG() {
        const centerX = 100, centerY = 100, radius = 95;
        const angleStep = 360 / SECTORS;
        const prizes = (wheelState && wheelState.prizes) || [];
        let paths = '';
        for (let i = 0; i < SECTORS; i++) {
            const startAngle = (i * angleStep - 90) * Math.PI / 180;
            const endAngle = ((i + 1) * angleStep - 90) * Math.PI / 180;
            const x1 = centerX + radius * Math.cos(startAngle);
            const y1 = centerY + radius * Math.sin(startAngle);
            const x2 = centerX + radius * Math.cos(endAngle);
            const y2 = centerY + radius * Math.sin(endAngle);
            const path = 'M ' + centerX + ' ' + centerY + ' L ' + x1 + ' ' + y1 + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + x2 + ' ' + y2 + ' Z';
            const fill = COLORS[i];
            paths += '<path d="' + path + '" fill="' + fill + '" stroke="rgba(0,255,136,0.2)" stroke-width="0.8"/>';
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
            paths += '<text x="' + textX + '" y="' + textY + '" fill="#fff" font-size="' + fontSize + '" font-weight="900" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + (i * angleStep + angleStep/2) + ' ' + textX + ' ' + textY + ')">' + text + '</text>';
        }
        paths += '<circle cx="' + centerX + '" cy="' + centerY + '" r="16" fill="#0a0a12" stroke="url(#wheelGrad)" stroke-width="2"/>';
        paths += '<circle cx="' + centerX + '" cy="' + centerY + '" r="6" fill="url(#wheelGrad)"/>';
        paths += '<defs><linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#00ff88"/><stop offset="100%" stop-color="#00cc6a"/></linearGradient></defs>';
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
                rotor.style.transform = 'rotate(' + totalRotation + 'deg)';
            }
            setTimeout(() => {
                if (window.haptic) window.haptic('success');
                let prizeLabel = res.prize_text || '';
                if (res.prize_type === 'premium') prizeLabel = '👑 Премиум на месяц!';
                showToast('🎉 ' + prizeLabel);
                setTimeout(() => {
                    closeWheelModal();
                    isSpinning = false;
                }, 2000);
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
        let html = '<div class="wheel-recent"><div class="wheel-recent-title">Недавние крупные призы</div>';
        RECENT_PRIZES.forEach(p => {
            html += '<div class="wheel-recent-item"><div class="wheel-recent-nick">' + p.nick + '</div><div class="wheel-recent-prize">' + p.prize + '</div></div>';
        });
        html += '</div>';
        return html;
    }

    window.openWheel = openWheel;
    window.loadWheelStatus = loadWheelStatus;
    window.showWheelModal = showWheelModal;
    window.closeWheelModal = closeWheelModal;
    console.log('[WHEEL] Initialized OK');
})();
