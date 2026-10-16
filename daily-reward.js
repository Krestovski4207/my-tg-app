// ================== ЕЖЕДНЕВНАЯ НАГРАДА ==================
(function() {
    'use strict';

    const DAYS_LABELS = ['День 1', 'День 2', 'День 3', 'День 4', 'День 5', 'День 6', 'Бонус'];

    let currentStatus = null;

    async function loadDailyStatus() {
        const card = document.getElementById('daily-reward-card');
        if (!card) return;
        if (!window.tgUser || !tgUser.id) return;

        try {
            const res = await apiGet('/api/daily/status?tg_id=' + tgUser.id);
            if (res.error) {
                console.error('[DAILY]', res.error);
                return;
            }
            currentStatus = res;
            renderDaily(res);
        } catch (e) {
            console.error('[DAILY] load error:', e);
        }
    }

    function renderDaily(data) {
        const badge = document.getElementById('daily-day-badge');
        const sub = document.getElementById('daily-sub');
        const btn = document.getElementById('daily-claim-btn');
        const grid = document.getElementById('daily-grid');

        if (!grid) return;

        // День в бейдже
        const currentDay = data.current_day || 1;
        if (badge) badge.textContent = currentDay;

        // Подпись
        if (sub) {
            if (data.can_claim) {
                const prize = (data.prizes && data.prizes[currentDay - 1]) || 0;
                sub.textContent = 'Забери ' + prize + ' LM за сегодня';
            } else {
                sub.textContent = 'Возвращайся завтра за наградой';
            }
        }

        // Кнопка
        if (btn) {
            btn.disabled = !data.can_claim;
            if (data.can_claim) {
                btn.textContent = 'Забрать';
                btn.classList.remove('claimed');
                btn.onclick = claimDaily;
            } else {
                btn.textContent = '✓ Получено';
                btn.classList.add('claimed');
                btn.onclick = null;
            }
        }

        // Сетка 7 дней
        grid.innerHTML = '';
        const prizes = data.prizes || [10, 15, 20, 25, 30, 40, 75];
        const streak = data.streak || 0;

        for (let i = 0; i < 7; i++) {
            const dayEl = document.createElement('div');
            const dayNum = i + 1;
            const isBonus = dayNum === 7;
            const isToday = data.can_claim ? (dayNum === currentDay) : false;
            const isClaimed = dayNum <= (streak % 7);

            dayEl.className = 'daily-day';
            if (isToday) dayEl.classList.add('today');
            if (isClaimed) dayEl.classList.add('claimed');
            if (isBonus) dayEl.classList.add('bonus');

            let prizeIcon = '';
            if (isClaimed) {
                prizeIcon = '<div class="daily-day-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:14px;height:14px;"><path d="M20 6L9 17l-5-5"/></svg></div>';
            } else if (isBonus) {
                prizeIcon = '<div class="daily-day-check" style="color:#FFD700;"><svg viewBox="0 0 24 24" fill="currentColor" style="width:14px;height:14px;"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/></svg></div>';
            } else {
                prizeIcon = '<div class="daily-day-check" style="color:#7a7a8a;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>';
            }

            dayEl.innerHTML =
                '<div class="daily-day-label">' + DAYS_LABELS[i] + '</div>' +
                prizeIcon +
                '<div class="daily-day-prize">' + prizes[i] + '</div>';

            grid.appendChild(dayEl);
        }
    }

    async function claimDaily() {
        if (!window.tgUser || !tgUser.id) return;

        const btn = document.getElementById('daily-claim-btn');
        if (btn) btn.disabled = true;

        try {
            const res = await apiPost('/api/daily/claim', { tg_id: tgUser.id });
            if (res.error) {
                showToast('❌ ' + res.error);
                if (btn) btn.disabled = false;
                return;
            }

            if (window.haptic) window.haptic('success');
            showToast('🎉 +' + res.prize + ' LM!');

            // Обновляем статус
            await loadDailyStatus();
        } catch (e) {
            console.error('[DAILY] claim error:', e);
            showToast('Ошибка начисления');
            if (btn) btn.disabled = false;
        }
    }

    // Экспорт
    window.loadDailyStatus = loadDailyStatus;

    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(loadDailyStatus, 500);
    });
})();
