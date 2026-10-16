// ================== РУЛЕТКА ==================
(function() {
    'use strict';

    let isSpinning = false;

    // ==== Получить пользователя (надёжно) ====
    function getUser() {
        // 1. Из Telegram.WebApp
        try {
            const tg = window.Telegram && window.Telegram.WebApp;
            if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
                return tg.initDataUnsafe.user;
            }
        } catch (e) {}
        // 2. Из глобальной tgUser
        try {
            if (typeof tgUser !== 'undefined' && tgUser && tgUser.id) return tgUser;
        } catch (e) {}
        // 3. Из window.tgUser
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

    // ==== Открыть рулетку ====
    async function openWheel() {
        try {
            const user = getUser();
            if (!user) {
                alert('Открой через Telegram');
                return;
            }

            const api = getApiUrl();
            if (!api) {
                alert('API URL не найден');
                return;
            }

            const res = await fetch(api + '/api/wheel/status?tg_id=' + user.id).then(r => r.json());
            if (!res || res.error) {
                alert('Ошибка API: ' + JSON.stringify(res));
                return;
            }

            showRoulette(res, user, api);
        } catch (e) {
            alert('Ошибка: ' + (e.message || e));
        }
    }

    // ==== Рулетка ====
    function showRoulette(status, user, api) {
        const old = document.getElementById('wheel-overlay');
        if (old) old.remove();

        const canSpin = status.can_spin;
        const prizes = status.prizes || [];

        // Названия призов
        const names = prizes.map(p => {
            if (p.type === 'lm') return p.value + ' LM';
            if (p.type === 'premium') return 'Премиум';
            if (p.type === 'skin') return 'Скин';
            return '?';
        });

        // Строим дорожку 30 слотов (случайные из доступных)
        const TOTAL = 30;
        const WIN_INDEX = 22; // победитель в позиции 22
        const items = [];
        for (let i = 0; i < TOTAL; i++) {
            // Случайный приз (визуально)
            const randPrize = prizes[Math.floor(Math.random() * prizes.length)];
            items.push(randPrize);
        }
        // Зафиксируем победителя в WIN_INDEX — но каким будет приз, узнаем после spin

        // Рендер слотов
        let trackHTML = '';
        items.forEach((p, i) => {
            let label = '';
            let color = '#1a1a2e';
            let bgColor = 'linear-gradient(135deg, #1a1a2e, #252542)';
            if (p.type === 'lm') {
                label = p.value;
                if (p.value >= 100) { bgColor = 'linear-gradient(135deg, #ffd700, #cc9900)'; }
                else if (p.value >= 50) { bgColor = 'linear-gradient(135deg, #ff6b6b, #cc4444)'; }
                else { bgColor = 'linear-gradient(135deg, #252542, #3a3a5c)'; }
            } else if (p.type === 'premium') {
                label = '👑';
                bgColor = 'linear-gradient(135deg, #ffd700, #b8860b)';
            } else {
                label = '🎁';
                bgColor = 'linear-gradient(135deg, #c084fc, #7c3aed)';
            }

            trackHTML += '<div class="roulette-slot" style="background:' + bgColor + ';">' + label + '</div>';
        });

        const timerText = !canSpin && status.seconds_left > 0
            ? '<div style="text-align:center;font-size:13px;color:#7a7a8a;padding:8px;background:rgba(255,255,255,0.03);border-radius:10px;margin-bottom:12px;">⏰ Через ' + Math.floor(status.seconds_left / 3600) + 'ч ' + Math.floor((status.seconds_left % 3600) / 60) + 'м</div>'
            : '';

        const overlay = document.createElement('div');
        overlay.id = 'wheel-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:99999;display:flex;align-items:center;justify-content:center;padding:12px;overflow-y:auto;';

        overlay.innerHTML =
            '<div style="background:linear-gradient(135deg,#13131f,#0a0a12);border:1px solid rgba(0,255,136,0.3);border-radius:20px;padding:20px 16px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.8);">' +

                '<div style="text-align:center;font-size:20px;font-weight:900;color:#fff;text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">🎰 Рулетка</div>' +
                '<div style="text-align:center;font-size:11px;color:#7a7a8a;margin-bottom:16px;">Одно вращение в день</div>' +

                // Дорожка
                '<div id="roulette-wrap" style="position:relative;overflow:hidden;border-radius:12px;background:#0a0a12;border:1px solid rgba(255,255,255,0.08);margin-bottom:16px;height:100px;">' +
                    // Красная стрелка сверху
                    '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:16px solid #ff3b3b;filter:drop-shadow(0 0 10px #ff3b3b);z-index:10;"></div>' +
                    // Дорожка
                    '<div id="roulette-track" style="display:flex;transition:transform 5s cubic-bezier(0.15,0.85,0.15,1);padding:0;height:100%;align-items:stretch;">' + trackHTML + '</div>' +
                    // Тень по бокам
                    '<div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(10,10,18,0.9),transparent 20%,transparent 80%,rgba(10,10,18,0.9));"></div>' +
                '</div>' +

                timerText +

                '<button id="roulette-spin-btn" style="width:100%;padding:16px;background:linear-gradient(135deg,#00ff88,#00cc6a);border:none;border-radius:14px;color:#0a0a12;font-size:15px;font-weight:900;text-transform:uppercase;letter-spacing:2px;cursor:pointer;box-shadow:0 8px 30px rgba(0,255,136,0.5);font-family:inherit;' + (canSpin ? '' : 'opacity:0.4;cursor:not-allowed;') + '"' + (canSpin ? '' : ' disabled') + '>⚡ Крутить</button>' +

                '<div style="text-align:center;font-size:11px;color:#7a7a8a;margin-top:10px;">Всего вращений: <b style="color:#00ff88;">' + (status.total_spins || 0) + '</b></div>' +

                '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:14px;">' +
                    names.map(n => '<div style="padding:8px 6px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;font-size:11px;font-weight:800;color:#ccc;text-align:center;">' + n + '</div>').join('') +
                '</div>' +

                '<button id="roulette-close-btn" style="width:100%;padding:12px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#aaa;font-size:13px;font-weight:700;cursor:pointer;margin-top:14px;font-family:inherit;">Закрыть</button>' +

            '</div>';

        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        document.getElementById('roulette-close-btn').addEventListener('click', closeWheel);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeWheel(); });

        if (canSpin) {
            document.getElementById('roulette-spin-btn').addEventListener('click', function() {
                spinRoulette(user, api, TOTAL, WIN_INDEX);
            });
        }
    }

    function closeWheel() {
        const el = document.getElementById('wheel-overlay');
        if (el) el.remove();
        document.body.style.overflow = '';
    }

    async function spinRoulette(user, api, TOTAL, WIN_INDEX) {
        if (isSpinning) return;
        isSpinning = true;

        const btn = document.getElementById('roulette-spin-btn');
        const track = document.getElementById('roulette-track');
        if (btn) { btn.disabled = true; btn.textContent = 'Крутим...'; }

        try {
            const res = await fetch(api + '/api/wheel/spin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.id })
            }).then(r => r.json());

            if (res.error) {
                alert('❌ ' + res.error);
                isSpinning = false;
                if (btn) { btn.disabled = false; btn.textContent = '⚡ Крутить'; }
                return;
            }

            // Ширина одного слота 60px (задана в CSS)
            const SLOT_W = 60;
            const wrap = document.getElementById('roulette-wrap');
            const wrapW = wrap ? wrap.offsetWidth : 360;
            const centerOffset = wrapW / 2 - SLOT_W / 2;

            // Победитель в WIN_INDEX → нужно сдвинуть track так,
            // чтобы слот WIN_INDEX оказался по центру
            const targetX = -(WIN_INDEX * SLOT_W) + centerOffset;
            // + случайное дрожание ±15px
            const jitter = (Math.random() - 0.5) * 30;
            const finalX = targetX + jitter;

            if (track) {
                track.style.transform = 'translateX(' + finalX + 'px)';
            }

            // Через 5 сек — показать результат
            setTimeout(() => {
                let prize = res.prize_text || '';
                if (res.prize_type === 'premium') prize = '👑 Премиум на месяц!';
                alert('🎉 ' + prize);
                closeWheel();
                isSpinning = false;
            }, 5200);
        } catch (e) {
            alert('Ошибка: ' + (e.message || e));
            isSpinning = false;
            if (btn) { btn.disabled = false; btn.textContent = '⚡ Крутить'; }
        }
    }

    window.openWheel = openWheel;
})();
