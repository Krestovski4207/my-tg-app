// ================== КОЛЕСО ФОРТУНЫ ==================
(function() {
    'use strict';

    let isSpinning = false;
    let wheelState = null;

    const SECTORS = 12;
    const RED = '#c81e2c';
    const GREEN = '#00a855';
    const COLORS = [RED, RED, GREEN, RED, RED, GREEN, RED, RED, RED, GREEN, RED, GREEN];

    // ==== Открыть модалку ====
    async function openWheel() {
        try {
            // 1. Загружаем статус
            if (!window.tgUser || !tgUser.id) {
                alert('Открой через Telegram');
                return;
            }

            const res = await apiGet('/api/wheel/status?tg_id=' + tgUser.id);
            if (!res || res.error) {
                alert('Ошибка API: ' + JSON.stringify(res));
                return;
            }
            wheelState = res;

            // 2. Создаём модалку
            showWheel(res);
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    }

    function showWheel(status) {
        // Удаляем старую
        const old = document.getElementById('wheel-overlay');
        if (old) old.remove();

        const canSpin = status.can_spin;
        const prizes = status.prizes || [];

        // Сектора
        let sectors = '';
        const step = 360 / SECTORS;
        for (let i = 0; i < SECTORS; i++) {
            const a1 = (i * step - 90) * Math.PI / 180;
            const a2 = ((i + 1) * step - 90) * Math.PI / 180;
            const x1 = 100 + 95 * Math.cos(a1);
            const y1 = 100 + 95 * Math.sin(a1);
            const x2 = 100 + 95 * Math.cos(a2);
            const y2 = 100 + 95 * Math.sin(a2);
            sectors += '<path d="M 100 100 L ' + x1 + ' ' + y1 + ' A 95 95 0 0 1 ' + x2 + ' ' + y2 + ' Z" fill="' + COLORS[i] + '" stroke="rgba(0,255,136,0.2)" stroke-width="1"/>';

            const midA = ((i + 0.5) * step - 90) * Math.PI / 180;
            const tx = 100 + 65 * Math.cos(midA);
            const ty = 100 + 65 * Math.sin(midA);
            const p = prizes[i];
            let label = '';
            if (p) {
                if (p.type === 'lm') label = p.value;
                else if (p.type === 'premium') label = 'ПРЕМ';
                else label = 'СКИН';
            }
            const fs = p && p.type === 'lm' ? 11 : 7;
            sectors += '<text x="' + tx + '" y="' + ty + '" fill="#fff" font-size="' + fs + '" font-weight="900" text-anchor="middle" dominant-baseline="middle" transform="rotate(' + (i * step + step/2) + ' ' + tx + ' ' + ty + ')">' + label + '</text>';
        }

        // Призы снизу
        let prizeList = '';
        prizes.forEach(p => {
            let txt = '';
            if (p.type === 'lm') txt = '🪙 ' + p.value + ' LM';
            else if (p.type === 'premium') txt = '👑 Премиум 30д';
            else txt = '🎁 Скин';
            prizeList += '<div class="wheel-prize-badge">' + txt + '</div>';
        });

        const timerText = !canSpin && status.seconds_left > 0
            ? '<div class="wheel-cooldown">⏰ Через ' + Math.floor(status.seconds_left / 3600) + 'ч ' + Math.floor((status.seconds_left % 3600) / 60) + 'м</div>'
            : '';

        const overlay = document.createElement('div');
        overlay.id = 'wheel-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';

        overlay.innerHTML =
            '<div style="background:linear-gradient(135deg,#1a1a2e,#0d0d15);border:1px solid rgba(0,255,136,0.3);border-radius:20px;padding:20px;max-width:400px;width:100%;max-height:95vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.8);">' +

                '<div style="text-align:center;font-size:22px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;">Колесо Фортуны</div>' +
                '<div style="text-align:center;font-size:12px;color:#7a7a8a;margin-bottom:16px;">Одно вращение в день</div>' +

                '<div style="position:relative;width:280px;height:280px;margin:0 auto 16px;">' +
                    '<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:14px solid transparent;border-right:14px solid transparent;border-top:22px solid #00ff88;filter:drop-shadow(0 0 12px #00ff88);z-index:10;"></div>' +
                    '<div id="wheel-spin-rotor" style="width:100%;height:100%;transition:transform 4s cubic-bezier(0.15,0.85,0.15,1);">' +
                        '<svg viewBox="0 0 200 200" style="width:100%;height:100%;filter:drop-shadow(0 0 24px rgba(0,255,136,0.4));">' +
                            sectors +
                            '<circle cx="100" cy="100" r="14" fill="#0a0a12" stroke="#00ff88" stroke-width="2"/>' +
                            '<circle cx="100" cy="100" r="5" fill="#00ff88"/>' +
                        '</svg>' +
                    '</div>' +
                '</div>' +

                timerText +

                '<button id="wheel-spin-btn" style="width:100%;padding:18px;background:linear-gradient(135deg,#00ff88,#00cc6a);border:none;border-radius:14px;color:#0a0a12;font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:2px;cursor:pointer;box-shadow:0 8px 30px rgba(0,255,136,0.5);font-family:inherit;' + (canSpin ? '' : 'opacity:0.4;cursor:not-allowed;') + '"' + (canSpin ? '' : ' disabled') + '>⚡ ' + (canSpin ? 'Крутить' : 'Кулдаун') + '</button>' +

                '<div style="text-align:center;font-size:12px;color:#7a7a8a;margin-top:12px;">Всего вращений: <b style="color:#00ff88;">' + (status.total_spins || 0) + '</b></div>' +

                '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:16px;">' + prizeList + '</div>' +

                '<button id="wheel-close-btn" style="width:100%;padding:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#aaa;font-size:14px;font-weight:700;cursor:pointer;margin-top:16px;font-family:inherit;">Закрыть</button>' +

            '</div>';

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        document.getElementById('wheel-close-btn').addEventListener('click', closeWheel);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWheel(); });

        if (canSpin) {
            document.getElementById('wheel-spin-btn').addEventListener('click', spinWheel);
        }
    }

    function closeWheel() {
        const el = document.getElementById('wheel-overlay');
        if (el) el.remove();
        document.body.style.overflow = '';
    }

    async function spinWheel() {
        if (isSpinning) return;
        isSpinning = true;

        const btn = document.getElementById('wheel-spin-btn');
        const rotor = document.getElementById('wheel-spin-rotor');
        if (btn) { btn.disabled = true; btn.textContent = 'Крутим...'; }

        try {
            const res = await apiPost('/api/wheel/spin', { user_id: tgUser.id });

            if (res.error) {
                alert('❌ ' + res.error);
                isSpinning = false;
                if (btn) { btn.disabled = false; btn.textContent = '⚡ Крутить'; }
                return;
            }

            // Анимация
            const idx = res.winner_index || 0;
            const step = 360 / (res.total_prizes || SECTORS);
            const targetAngle = 360 * 5 + (360 - (idx * step + step / 2));
            if (rotor) rotor.style.transform = 'rotate(' + targetAngle + 'deg)';

            setTimeout(() => {
                let prize = res.prize_text || '';
                if (res.prize_type === 'premium') prize = '👑 Премиум на месяц!';
                alert('🎉 ' + prize);
                closeWheel();
                isSpinning = false;
            }, 4200);
        } catch (e) {
            alert('Ошибка: ' + e.message);
            isSpinning = false;
            if (btn) { btn.disabled = false; btn.textContent = '⚡ Крутить'; }
        }
    }

    window.openWheel = openWheel;
})();
