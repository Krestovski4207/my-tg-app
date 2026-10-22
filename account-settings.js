// ================== СМЕНА НИКА/ID ==================
(function() {
    'use strict';

    // ==== SVG-иконки ====
    const ICON_NICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px;color:#a855f7;filter:drop-shadow(0 0 20px rgba(168,85,247,0.6));"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" fill="rgba(168,85,247,0.15)"/></svg>';
    const ICON_ID = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:48px;height:48px;color:#3b82f6;filter:drop-shadow(0 0 20px rgba(59,130,246,0.6));"><circle cx="12" cy="12" r="9" fill="rgba(59,130,246,0.15)"/><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>';

    function renderAccountInfo(p) {
        const nickEl = document.getElementById('account-nick-value');
        const idEl = document.getElementById('account-id-value');
        if (nickEl) nickEl.textContent = p.nickname || '—';
        if (idEl) idEl.textContent = p.player_id || '—';
    }

    window.renderAccountInfo = renderAccountInfo;

    document.addEventListener('DOMContentLoaded', () => {
        const btnNick = document.getElementById('btn-change-nick');
        const btnId = document.getElementById('btn-change-id');

        btnNick?.addEventListener('click', () => openChangeModal('nick'));
        btnId?.addEventListener('click', () => openChangeModal('id'));
    });

    function openChangeModal(type) {
        if (window.haptic) window.haptic('light');

        if (!window.tgUser || !tgUser.id) {
            showToast('Открой в Telegram');
            return;
        }

        const isNick = type === 'nick';
        const title = isNick ? '✏️ Смена ника' : '🎯 Смена игрового ID';
        const desc = isNick
            ? 'Ник: 3-24 символа, буквы/цифры/_/-. Стоимость: <b>200 LM</b>'
            : 'Игровой ID: 3-32 символа. <b>Бесплатно</b>';
        const placeholder = isNick ? 'Новый ник' : 'Новый игровой ID';

        const content = `
            <div class="change-modal-content">
                <div class="change-modal-icon">${isNick ? ICON_NICK : ICON_ID}</div>
                <div class="change-modal-desc">${desc}</div>
                <input type="text" class="change-modal-input" id="change-input" placeholder="${placeholder}" autocomplete="off">
                <div class="change-modal-error" id="change-error" style="display:none;"></div>
                <div class="change-modal-actions">
                    <button class="change-modal-btn cancel" id="change-cancel">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        Отмена
                    </button>
                    <button class="change-modal-btn confirm" id="change-confirm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><path d="M20 6L9 17l-5-5"/></svg>
                        ${isNick ? 'Сменить за 200 LM' : 'Сменить'}
                    </button>
                </div>
            </div>
        `;

        openModal(title, content);

        setTimeout(() => {
            const input = document.getElementById('change-input');
            const cancelBtn = document.getElementById('change-cancel');
            const confirmBtn = document.getElementById('change-confirm');
            const errEl = document.getElementById('change-error');

            input?.focus();

            cancelBtn?.addEventListener('click', closeModal);

            confirmBtn?.addEventListener('click', async () => {
                const value = input.value.trim();
                errEl.style.display = 'none';

                if (!value) {
                    errEl.textContent = 'Заполни поле';
                    errEl.style.display = 'block';
                    return;
                }

                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Отправка...';

                try {
                    const endpoint = isNick ? '/api/user/change-nick' : '/api/user/change-id';
                    // === change-id with game ===
                    let _gameSlug = 'standleo';
                    try {
                        _gameSlug = localStorage.getItem('luma_profile_game') || window.__gameFromUrl || 'standleo';
                    } catch(e) {}
                    const body = isNick
                        ? { user_id: tgUser.id, nickname: value }
                        : { user_id: tgUser.id, player_id: value, game: _gameSlug };

                    const res = await apiPost(endpoint, body);

                    if (res.error) {
                        errEl.textContent = '❌ ' + res.error;
                        errEl.style.display = 'block';
                        confirmBtn.disabled = false;
                        confirmBtn.textContent = isNick ? 'Сменить за 200 LM' : 'Сменить';
                        if (window.haptic) window.haptic('error');
                        return;
                    }

                    if (window.haptic) window.haptic('success');
                    showToast(isNick ? '✅ Ник обновлён' : '✅ ID обновлён');
                    closeModal();

                    // Перезагружаем профиль
                    if (typeof window.loadProfile === 'function') {
                        setTimeout(window.loadProfile, 300);
                    }
                } catch (e) {
                    errEl.textContent = 'Ошибка: ' + (e.message || e);
                    errEl.style.display = 'block';
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = isNick ? 'Сменить за 200 LM' : 'Сменить';
                }
            });
        }, 100);
    }

    function openModal(title, content) {
        let overlay = document.getElementById('change-modal-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'change-modal-overlay';
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal change-modal">
                    <button class="modal-close" id="change-modal-close">✕</button>
                    <div class="change-modal-title" id="change-modal-title"></div>
                    <div class="change-modal-body" id="change-modal-body"></div>
                </div>
            `;
            document.body.appendChild(overlay);

            document.getElementById('change-modal-close').addEventListener('click', closeModal);
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
        }

        document.getElementById('change-modal-title').textContent = title;
        document.getElementById('change-modal-body').innerHTML = content;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        const overlay = document.getElementById('change-modal-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    window.openChangeModal = openChangeModal;
})();
