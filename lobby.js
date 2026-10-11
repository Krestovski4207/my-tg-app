// ==== ЛОББИ ====
async function loadLobbies() {
    try {
        const lobbies = await apiGet('/api/lobbies');
        renderLobbies(lobbies);
    } catch (e) {
        console.error('Ошибка лобби:', e);
    }
}

function renderLobbies(lobbies) {
    const container = document.getElementById('lobby-list');
    if (!container) return;
    container.innerHTML = '';

    if (!lobbies || lobbies.length === 0) {
        container.innerHTML = '<div class="map-empty">Активных лобби нет</div>';
        return;
    }

    const myId = tgUser?.id;

    lobbies.forEach(l => {
        const isMine = (l.creator_id === myId);
        const isJoined = l.joined_users && l.joined_users.includes(myId);
        const maxPlayers = parseInt(l.slots.split('/')[1]);
        const currentPlayers = l.joined_users ? l.joined_users.length : 0;
        const isFull = currentPlayers >= maxPlayers;

        let btnText = '', btnClass = '', btnAction = '';
        if (isMine) {
            btnText = 'Закрыть';
            btnClass = 'lobby-btn-close';
            btnAction = 'close';
        } else if (isJoined) {
            btnText = 'Выйти';
            btnClass = 'lobby-btn-leave';
            btnAction = 'leave';
        } else if (isFull) {
            btnText = 'Полное';
            btnClass = 'lobby-btn-full';
        } else {
            btnText = 'Войти';
            btnClass = 'lobby-btn-join';
            btnAction = 'join';
        }

        const item = document.createElement('div');
        item.className = 'lobby-item';
        item.innerHTML =
            '<div class="lobby-mode">' + l.mode + '</div>' +
            '<div class="lobby-info">' +
                '<div class="lobby-map">' + l.map + '</div>' +
                '<div class="lobby-author">создал: ' + escapeHtml(l.author) + ' · ' + l.slots + '</div>' +
            '</div>' +
            '<button class="lobby-btn ' + btnClass + '" data-lobby-id="' + l.lobby_id + '" data-action="' + btnAction + '" ' + (!btnAction ? 'disabled' : '') + '>' +
                btnText +
            '</button>';
        container.appendChild(item);
    });

    container.querySelectorAll('.lobby-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const lobbyId = parseInt(btn.dataset.lobbyId);
            const action = btn.dataset.action;
            if (!action || !tgUser) return;

            try {
                if (action === 'join') {
                    await apiPost('/api/join_lobby', { lobby_id: lobbyId, user_id: tgUser.id });
                    showToast('✅ Ты в лобби');
                } else if (action === 'leave') {
                    await apiPost('/api/leave_lobby', { lobby_id: lobbyId, user_id: tgUser.id });
                    showToast('🚪 Ты вышел');
                } else if (action === 'close') {
                    await apiPost('/api/close_lobby', { lobby_id: lobbyId, user_id: tgUser.id });
                    showToast('🗑 Лобби закрыто');
                }
                await loadLobbies();
                if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
            } catch (err) {
                console.error(err);
                showToast('⚠ Ошибка');
            }
        });
    });
}

// ==== ИНИЦИАЛИЗАЦИЯ ====
loadLobbies();
