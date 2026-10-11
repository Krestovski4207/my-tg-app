// ==== ЛОББИ ====
let lobbyMode = '5x5';
let lobbyMap = 'Sandstone';

function setupLobbyChips() {
    const modeChips = document.querySelectorAll('#lobby-mode-chips .chip');
    modeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            modeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            lobbyMode = chip.dataset.value;
            if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });
    });

    const mapChips = document.querySelectorAll('#lobby-map-chips .chip');
    mapChips.forEach(chip => {
        chip.addEventListener('click', () => {
            mapChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            lobbyMap = chip.dataset.value;
            if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });
    });
}

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

// ==== СОЗДАНИЕ ЛОББИ ====
const lobbyForm = document.getElementById('lobby-form');
if (lobbyForm) {
    lobbyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!tgUser) {
            showToast('⚠ Открой через Telegram');
            return;
        }

        const submitBtn = document.getElementById('lobby-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Отправка...';

        try {
            // 1) Создаём в БД
            const res = await apiPost('/api/create_lobby', {
                creator_id: tgUser.id,
                mode: lobbyMode,
                map: lobbyMap
            });

            if (!res.lobby_id) throw new Error('Нет lobby_id');

            // 2) Отправляем боту для публикации в канал
            if (tg) {
                tg.sendData(JSON.stringify({
                    action: 'create_lobby',
                    lobby_id: res.lobby_id,
                    mode: lobbyMode,
                    map: lobbyMap
                }));
            }

            if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            showToast('✅ Лобби создано');
            await loadLobbies();
        } catch (e) {
            console.error(e);
            showToast('⚠ Ошибка создания');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '🚀 Создать лобби';
        }
    });
}

// ==== ИНИЦИАЛИЗАЦИЯ ====
setupLobbyChips();
loadLobbies();
