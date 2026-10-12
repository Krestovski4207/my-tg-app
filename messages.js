// ==== ЛИЧНЫЕ СООБЩЕНИЯ ====
let currentDialogPartner = null;
let dialogMessages = [];
let dialogPollTimer = null;
let globalChatActive = false;

async function loadDialogs() {
    // Если открыт глобальный чат — не перезагружаем список
    if (globalChatActive) return;

    const container = document.getElementById('dialogs-list');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    if (!tgUser) {
        container.innerHTML = '<div class="map-empty">Открой через Telegram</div>';
        return;
    }

    try {
        const dialogs = await apiGet('/api/messages/dialogs?tg_id=' + tgUser.id);

        if (!dialogs || dialogs.length === 0) {
            container.innerHTML = '<div class="map-empty">Нет диалогов. Начни с профиля игрока 💬</div>';
            return;
        }

        let html = '';
        dialogs.forEach(d => {
            const avatarStyle = d.avatar_url ? 'style="background-image:url(' + d.avatar_url + ')"' : '';
            const avatarText = d.avatar_url ? '' : (d.nickname || '?').charAt(0).toUpperCase();
            const time = (d.last_at || '').substring(11, 16);
            const unreadBadge = d.unread > 0
                ? `<div class="dialog-unread">${d.unread > 99 ? '99+' : d.unread}</div>`
                : '';

            html += `
                <div class="dialog-item ${d.unread > 0 ? 'has-unread' : ''}" data-uid="${d.partner_id}">
                    <div class="dialog-avatar" ${avatarStyle}>${avatarText}</div>
                    <div class="dialog-info">
                        <div class="dialog-name">${escapeHtml(d.nickname || '—')}</div>
                        <div class="dialog-last">${escapeHtml((d.last_msg || '').substring(0, 50))}</div>
                    </div>
                    <div class="dialog-meta">
                        <div class="dialog-time">${time}</div>
                        ${unreadBadge}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll('.dialog-item').forEach(el => {
            el.addEventListener('click', () => openDialog(parseInt(el.dataset.uid)));
        });
    } catch (e) {
        console.error('Ошибка диалогов:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

async function openDialog(partnerId) {
    globalChatActive = false;
    currentDialogPartner = partnerId;

    const container = document.getElementById('dialogs-content');
    if (!container) return;

    container.innerHTML = `
        <div class="dialog-header">
            <button class="dialog-back" id="dialog-back">←</button>
            <div class="dialog-header-name" id="dialog-header-name">Загрузка...</div>
            <button class="dialog-block-btn" id="dialog-block">⋯</button>
        </div>
        <div class="chat-wrap">
            <div class="chat-messages" id="dialog-messages">
                <div class="map-empty">Загрузка...</div>
            </div>
            <div class="chat-input-row">
                <textarea id="dialog-input" class="chat-input" placeholder="Написать..." maxlength="500" rows="1"></textarea>
                <button id="dialog-send" class="chat-send-btn">➤</button>
            </div>
        </div>
    `;

    document.getElementById('dialog-back').addEventListener('click', () => {
        stopDialogPolling();
        currentDialogPartner = null;
        backToDialogs();
    });

    document.getElementById('dialog-send').addEventListener('click', sendDialogMessage);

    const input = document.getElementById('dialog-input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendDialogMessage();
        }
    });
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    document.getElementById('dialog-block').addEventListener('click', showDialogActions);

    try {
        const profile = await apiGet('/api/profile?tg_id=' + partnerId);
        const nameEl = document.getElementById('dialog-header-name');
        if (nameEl) nameEl.textContent = profile.nickname || 'Игрок';
    } catch (e) {}

    await loadDialogMessages();
    startDialogPolling();
}

function backToDialogs() {
    globalChatActive = false;
    const container = document.getElementById('dialogs-content');
    if (!container) return;
    container.innerHTML = `
        <button class="btn-global-chat" id="btn-global-chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;">
                <path d="M21 12a8 8 0 0 1-8 8H6l-3 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/>
            </svg>
            <span>Глобальный чат</span>
        </button>
        <div class="section-head centered"><div class="section-title">💬 Сообщения</div></div>
        <div id="dialogs-list"><div class="map-empty">Загрузка...</div></div>
    `;
    bindGlobalChatBtn();
    loadDialogs();
}

// ==== ГЛОБАЛЬНЫЙ ЧАТ ====
async function openGlobalChat() {
    globalChatActive = true;
    const container = document.getElementById('dialogs-content');
    if (!container) return;

    container.innerHTML = `
        <div class="dialog-header">
            <button class="dialog-back" id="global-back">←</button>
            <div class="dialog-header-name">🌍 Глобальный чат</div>
            <div style="width:36px;"></div>
        </div>
        <div class="chat-wrap">
            <div class="chat-messages" id="chat-messages">
                <div class="map-empty">Загрузка...</div>
            </div>
            <div class="chat-input-row">
                <textarea id="chat-input" class="chat-input" placeholder="Написать в чат..." maxlength="500" rows="1"></textarea>
                <button id="chat-send-btn" class="chat-send-btn">➤</button>
            </div>
        </div>
    `;

    document.getElementById('global-back').addEventListener('click', () => {
        stopChatPolling();
        globalChatActive = false;
        backToDialogs();
    });

    // Используем существующие функции из chat.js
    if (typeof initChat === 'function') {
        initChat();
    }
}

function bindGlobalChatBtn() {
    const btn = document.getElementById('btn-global-chat');
    if (btn) btn.addEventListener('click', openGlobalChat);
}

// ==== ОСТАЛЬНЫЕ ФУНКЦИИ (без изменений) ====
async function loadDialogMessages() {
    if (!currentDialogPartner) return;
    const container = document.getElementById('dialog-messages');
    if (!container) return;

    try {
        const msgs = await apiGet('/api/messages/chat?tg_id=' + tgUser.id + '&partner_id=' + currentDialogPartner);
        dialogMessages = msgs || [];
        renderDialogMessages();
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        console.error('Ошибка чата:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

function renderDialogMessages() {
    const container = document.getElementById('dialog-messages');
    if (!container) return;

    if (!dialogMessages || dialogMessages.length === 0) {
        container.innerHTML = '<div class="map-empty">Сообщений пока нет. Напиши первым!</div>';
        return;
    }

    let html = '';
    dialogMessages.forEach(m => {
        const isMe = Number(m.from_id) === Number(tgUser.id);
        const time = (m.created_at || '').substring(11, 16);

        html += `
            <div class="chat-msg ${isMe ? 'mine' : ''}">
                <div class="chat-body">
                    <div class="chat-bubble" data-mid="${m.id}">
                        <div class="chat-text">${escapeHtml(m.message)}</div>
                        <div class="chat-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    container.querySelectorAll('.chat-bubble').forEach(bubble => {
        let timer = null;
        bubble.addEventListener('touchstart', () => {
            timer = setTimeout(() => {
                const mid = parseInt(bubble.dataset.mid);
                if (confirm('Удалить сообщение?')) deleteDialogMessage(mid);
            }, 700);
        });
        bubble.addEventListener('touchend', () => clearTimeout(timer));
        bubble.addEventListener('touchmove', () => clearTimeout(timer));
        bubble.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const mid = parseInt(bubble.dataset.mid);
            if (confirm('Удалить сообщение?')) deleteDialogMessage(mid);
        });
    });
}

async function sendDialogMessage() {
    const input = document.getElementById('dialog-input');
    if (!input || !currentDialogPartner) return;
    const text = input.value.trim();
    if (!text) return;
    if (text.length > 500) return showToast('⚠ Максимум 500 символов');

    input.value = '';
    input.style.height = 'auto';

    try {
        const res = await apiPost('/api/messages/send', {
            from_id: tgUser.id,
            to_id: currentDialogPartner,
            message: text
        });
        if (res.error) {
            showToast('⚠ ' + res.error);
            input.value = text;
            return;
        }
        await loadDialogMessages();
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка отправки');
        input.value = text;
    }
}

async function deleteDialogMessage(messageId) {
    try {
        const res = await apiPost('/api/messages/delete', {
            user_id: tgUser.id,
            message_id: messageId
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('🗑 Удалено');
        await loadDialogMessages();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

async function showDialogActions() {
    if (!currentDialogPartner) return;
    try {
        const res = await apiGet('/api/messages/is_blocked?tg_id=' + tgUser.id + '&target_id=' + currentDialogPartner);
        const isBlocked = res.blocked_by_me;

        const action = confirm(
            isBlocked
                ? 'Разблокировать пользователя?'
                : 'Заблокировать пользователя? Он не сможет тебе писать.'
        );

        if (!action) return;

        await apiPost('/api/messages/block', {
            user_id: tgUser.id,
            target_id: currentDialogPartner,
            action: isBlocked ? 'unblock' : 'block'
        });

        showToast(isBlocked ? '✅ Разблокирован' : '🚫 Заблокирован');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

function startDialogPolling() {
    stopDialogPolling();
    dialogPollTimer = setInterval(async () => {
        if (!currentDialogPartner) return;
        try {
            const msgs = await apiGet('/api/messages/chat?tg_id=' + tgUser.id + '&partner_id=' + currentDialogPartner);
            if (msgs && msgs.length !== dialogMessages.length) {
                dialogMessages = msgs;
                renderDialogMessages();
                const container = document.getElementById('dialog-messages');
                if (container) container.scrollTop = container.scrollHeight;
            }
        } catch (e) {}
    }, 3000);
}

function stopDialogPolling() {
    if (dialogPollTimer) {
        clearInterval(dialogPollTimer);
        dialogPollTimer = null;
    }
}

async function openPrivateChat(userId) {
    if (Number(userId) === Number(tgUser.id)) {
        showToast('⚠ Нельзя писать себе');
        return;
    }

    const modal = document.getElementById('modal-overlay');
    if (modal) modal.classList.remove('active');

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const msgTab = document.querySelector('.tab-btn[data-tab="messages"]');
    if (msgTab) msgTab.classList.add('active');

    const msgContent = document.getElementById('tab-messages');
    if (msgContent) msgContent.classList.add('active');

    if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();

    await openDialog(userId);
}

// ==== УВЕДОМЛЕНИЯ ====
async function updateUnreadBadges() {
    if (!tgUser) return;
    try {
        const chat = await apiGet('/api/chat/unread?tg_id=' + tgUser.id);
        if (typeof updateChatBadge === 'function') updateChatBadge(chat.global || 0);

        const msgs = await apiGet('/api/messages/unread?tg_id=' + tgUser.id);
        const badge = document.getElementById('messages-badge');
        if (badge) {
            if (msgs.unread > 0) {
                badge.textContent = msgs.unread > 99 ? '99+' : msgs.unread;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) {}
}

// ==== ИНИЦИАЛИЗАЦИЯ ====
document.addEventListener('DOMContentLoaded', () => {
    bindGlobalChatBtn();
});
