// ==== ЛОББИ (создание через модалку «Играть») ====
let lobbyMode = '5x5';
let lobbyMap = 'Sandstone';

function setupPlayChips() {
    const modeChips = document.querySelectorAll('#play-mode-chips .chip');
    modeChips.forEach(chip => {
        chip.addEventListener('click', () => {
            modeChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            lobbyMode = chip.dataset.value;
            if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });
    });

    const mapChips = document.querySelectorAll('#play-map-chips .chip');
    mapChips.forEach(chip => {
        chip.addEventListener('click', () => {
            mapChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            lobbyMap = chip.dataset.value;
            if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();
        });
    });
}

function openPlayModal() {
    const overlay = document.getElementById('play-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('active');
    loadLastLobbies();
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function closePlayModal() {
    const overlay = document.getElementById('play-modal-overlay');
    if (overlay) overlay.classList.remove('active');
}

async function loadLastLobbies() {
    const container = document.getElementById('play-lobbies-list');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const lobbies = await apiGet('/api/lobbies');
        if (!lobbies || lobbies.length === 0) {
            container.innerHTML = '<div class="map-empty">Активных лобби нет</div>';
            return;
        }

        // последние 5
        const last5 = lobbies.slice(0, 5);
        let html = '';
        last5.forEach(l => {
            const playersCount = l.joined_users ? l.joined_users.length : 0;
            const isFull = playersCount >= parseInt(l.slots.split('/')[1]);
            const status = isFull ? '<span class="lobby-status full">Полное</span>' : '<span class="lobby-status open">Открыто</span>';
            html += `
                <div class="play-lobby-item">
                    <div class="play-lobby-mode">${escapeHtml(l.mode)}</div>
                    <div class="play-lobby-info">
                        <div class="play-lobby-map">${escapeHtml(l.map)}</div>
                        <div class="play-lobby-author">#${l.lobby_id} · ${escapeHtml(l.author || '—')} · ${l.slots}</div>
                    </div>
                    ${status}
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (e) {
        console.error('Ошибка загрузки лобби:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

async function createLobbyFromApp() {
    if (!tgUser) {
        showToast('⚠ Открой через Telegram');
        return;
    }

    const btn = document.getElementById('play-create-btn');
    btn.disabled = true;
    btn.textContent = '⏳ Создание...';

    try {
        const res = await apiPost('/api/create_lobby', {
            creator_id: tgUser.id,
            mode: lobbyMode,
            map: lobbyMap
        });

        if (res.error) {
            showToast('⚠ ' + res.error);
            btn.disabled = false;
            btn.textContent = '🚀 Создать лобби';
            return;
        }

        showToast('✅ Лобби создано! Опубликовано в канале');
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

        // Обновить список
        await loadLastLobbies();

        // Вернуть кнопку
        btn.disabled = false;
        btn.textContent = '🚀 Создать лобби';

        // Закрыть модалку через секунду
        setTimeout(closePlayModal, 800);
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка создания');
        btn.disabled = false;
        btn.textContent = '🚀 Создать лобби';
    }
}

// ==== ИНИЦИАЛИЗАЦИЯ ====
document.addEventListener('DOMContentLoaded', () => {
    setupPlayChips();

    const playBtn = document.querySelector('.tab-btn-play');
    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openPlayModal();
        });
    }

    const closeBtn = document.getElementById('play-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closePlayModal);

    const overlay = document.getElementById('play-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePlayModal();
        });
    }

    const createBtn = document.getElementById('play-create-btn');
    if (createBtn) createBtn.addEventListener('click', createLobbyFromApp);
});
