// ================== СМЕНА НИКА/ID ==================
(function() {
    'use strict';

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
                <div class="change-modal-icon">${isNick ? '✏️' : '🎯'}</div>
                <div class="change-modal-desc">${desc}</div>
                <input type="text" class="change-modal-input" id="change-input" placeholder="${placeholder}" autocomplete="off">
                <div class="change-modal-error" id="change-error" style="display:none;"></div>
                <div class="change-modal-actions">
                    <button class="change-modal-btn cancel" id="change-cancel">Отмена</button>
                    <button class="change-modal-btn confirm" id="change-confirm">${isNick ? 'Сменить за 200 LM' : 'Сменить'}</button>
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
                    const body = isNick
                        ? { user_id: tgUser.id, nickname: value }
                        : { user_id: tgUser.id, player_id: value };

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
