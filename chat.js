// ==== ГЛОБАЛЬНЫЙ ЧАТ ====
let chatMessages = [];
let chatLastId = 0;
let chatPollTimer = null;

async function loadGlobalChat() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    if (!tgUser) {
        container.innerHTML = '<div class="map-empty">Открой через Telegram</div>';
        return;
    }

    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const msgs = await apiGet('/api/chat/global?limit=50');
        chatMessages = msgs || [];
        chatLastId = chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].id : 0;
        renderGlobalChat();
        scrollChatToBottom();
        markChatRead();
    } catch (e) {
        console.error('Ошибка чата:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

function renderGlobalChat() {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    if (!chatMessages || chatMessages.length === 0) {
        container.innerHTML = '<div class="map-empty">Сообщений пока нет. Будь первым!</div>';
        return;
    }

    let html = '';
    chatMessages.forEach(m => {
        const isMe = Number(m.user_id) === Number(tgUser.id);
        const isAdmin = Number(m.user_id) === Number(ADMIN_ID);
        const avatarStyle = m.avatar_url ? 'style="background-image:url(' + m.avatar_url + ')"' : '';
        const avatarText = m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase();
        const clanTag = m.clan_tag ? ' <span class="chat-clan-tag">[' + escapeHtml(m.clan_tag) + ']</span>' : '';

        if (m.is_deleted) {
            html += `
                <div class="chat-msg ${isMe ? 'mine' : ''} deleted">
                    <div class="chat-bubble deleted-bubble">
                        <i>Сообщение удалено</i>
                    </div>
                </div>
            `;
            return;
        }

        const time = (m.created_at || '').substring(11, 16); // "HH:MM"

        html += `
            <div class="chat-msg ${isMe ? 'mine' : ''}">
                ${!isMe ? `
                    <div class="chat-avatar" ${avatarStyle} data-uid="${m.user_id}">
                        ${avatarText}
                    </div>
                ` : ''}
                <div class="chat-body">
                    ${!isMe ? `
                        <div class="chat-name" data-uid="${m.user_id}">
                            ${escapeHtml(m.nickname)}${clanTag}
                            ${isAdmin ? ' <span class="chat-admin-star">👑</span>' : ''}
                        </div>
                    ` : ''}
                    <div class="chat-bubble" data-mid="${m.id}" data-uid="${m.user_id}">
                        <div class="chat-text">${escapeHtml(m.message)}</div>
                        <div class="chat-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Клик по аватару/имени → профиль
    container.querySelectorAll('[data-uid]').forEach(el => {
        el.addEventListener('click', (e) => {
            const uid = parseInt(el.dataset.uid);
            if (uid && typeof openModal === 'function') openModal(uid);
        });
    });

    // Долгий тап на сообщении → удалить (своё или админ)
    container.querySelectorAll('.chat-bubble').forEach(bubble => {
        let touchTimer = null;
        bubble.addEventListener('touchstart', () => {
            touchTimer = setTimeout(() => {
                const mid = parseInt(bubble.dataset.mid);
                const uid = parseInt(bubble.dataset.uid);
                const canDelete = (uid === Number(tgUser.id)) || (Number(tgUser.id) === Number(ADMIN_ID));
                if (canDelete && confirm('Удалить сообщение?')) {
                    deleteChatMessage(mid);
                }
            }, 700);
        });
        bubble.addEventListener('touchend', () => clearTimeout(touchTimer));
        bubble.addEventListener('touchmove', () => clearTimeout(touchTimer));
        bubble.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const mid = parseInt(bubble.dataset.mid);
            const uid = parseInt(bubble.dataset.uid);
            const canDelete = (uid === Number(tgUser.id)) || (Number(tgUser.id) === Number(ADMIN_ID));
            if (canDelete && confirm('Удалить сообщение?')) {
                deleteChatMessage(mid);
            }
        });
    });
}

function scrollChatToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) container.scrollTop = container.scrollHeight;
}

async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    if (text.length > 500) return showToast('⚠ Максимум 500 символов');

    input.value = '';
    input.style.height = 'auto';

    try {
        const res = await apiPost('/api/chat/global/send', {
            user_id: tgUser.id,
            message: text
        });
        if (res.error) {
            showToast('⚠ ' + res.error);
            input.value = text;
            return;
        }
        await loadGlobalChat();
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка отправки');
        input.value = text;
    }
}

async function deleteChatMessage(messageId) {
    try {
        const res = await apiPost('/api/chat/global/delete', {
            user_id: tgUser.id,
            message_id: messageId
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('🗑 Удалено');
        await loadGlobalChat();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

async function markChatRead() {
    if (!tgUser || chatLastId === 0) return;
    try {
        await apiPost('/api/chat/read', {
            user_id: tgUser.id,
            chat_type: 'global',
            last_id: chatLastId
        });
        updateChatBadge(0);
    } catch (e) {}
}

function updateChatBadge(count) {
    const badge = document.getElementById('chat-badge');
    if (!badge) return;
    if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// ==== ПОЛЛИНГ НОВЫХ СООБЩЕНИЙ ====
function startChatPolling() {
    stopChatPolling();
    chatPollTimer = setInterval(async () => {
        if (!tgUser) return;
        try {
            const msgs = await apiGet('/api/chat/global?limit=50');
            if (!msgs || msgs.length === 0) return;
            const newLastId = msgs[msgs.length - 1].id;
            if (newLastId !== chatLastId) {
                chatMessages = msgs;
                chatLastId = newLastId;
                renderGlobalChat();
                scrollChatToBottom();
                markChatRead();
            }
        } catch (e) {}
    }, 3000);
}

function stopChatPolling() {
    if (chatPollTimer) {
        clearInterval(chatPollTimer);
        chatPollTimer = null;
    }
}

// ==== ИНИЦИАЛИЗАЦИЯ ====
function initChat() {
    const sendBtn = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-input');

    if (sendBtn) sendBtn.addEventListener('click', sendChatMessage);

    if (input) {
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });
    }

    loadGlobalChat();
    startChatPolling();
}
