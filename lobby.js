// ================== ЛОББИ + ПАТИ (новый экран) ==================
(function() {
    'use strict';

    function getUserId() {
        try {
            if (window.tgUser && window.tgUser.id) return window.tgUser.id;
            const tg = window.Telegram?.WebApp;
            if (tg?.initDataUnsafe?.user) return tg.initDataUnsafe.user.id;
        } catch (e) {}
        return null;
    }

    function getApiUrl() {
        try {
            if (typeof API_URL !== 'undefined') return API_URL;
            if (window.API_URL) return window.API_URL;
        } catch (e) {}
        return '';
    }

    function toast(text) {
        let t = document.getElementById('play-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'play-toast';
            t.style.cssText = 'position:fixed;top:24px;left:50%;transform:translate(-50%,-20px);background:rgba(30,27,46,0.95);border:1px solid rgba(168,85,247,0.4);color:#fff;font-size:14px;font-weight:600;padding:12px 20px;border-radius:12px;z-index:100000;opacity:0;transition:all 0.25s ease;pointer-events:none;max-width:90vw;text-align:center;';
            document.body.appendChild(t);
        }
        t.textContent = text;
        requestAnimationFrame(() => t.style.opacity = '1');
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2600);
    }

    // ==== Открыть экран ====
    function openPlayScreen() {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const tab = document.getElementById('tab-play');
        if (tab) tab.classList.add('active');

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        const playBtn = document.querySelector('.tab-btn-play');
        if (playBtn) playBtn.classList.add('active');

        if (window.Telegram?.WebApp?.BackButton) {
            window.Telegram.WebApp.BackButton.show();
            window.Telegram.WebApp.BackButton.onClick(() => {
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const profileTab = document.getElementById('tab-profile');
                if (profileTab) profileTab.classList.add('active');
                window.Telegram.WebApp.BackButton.hide();
            });
        }

        window.scrollTo(0, 0);
        loadLobbies();
    }

    // ==== Лобби ====
    async function loadLobbies() {
        const container = document.getElementById('play-lobbies-list');
        if (!container) return;
        container.innerHTML = '<div class="tn-loading">Загрузка...</div>';

        const api = getApiUrl();
        const userId = getUserId();

        try {
            const lobbies = await fetch(api + '/api/lobbies').then(r => r.json());

            if (!lobbies || lobbies.length === 0) {
                container.innerHTML = '<div class="map-empty">Активных лобби нет. Создай первое!</div>';
                return;
            }

            container.innerHTML = lobbies.map(l => {
                const isFull = l.is_full;
                const isMember = userId && l.joined_users && l.joined_users.includes(userId);
                const isCreator = userId && l.creator_id === userId;
                const isAdmin = userId && (window.ADMIN_IDS && window.ADMIN_IDS.includes(userId) || [6999358439, 1135455373, 8863307702, 1244969288, 7938171818, 6372817931, 8594288119].includes(userId));

                // Игроки
                const playersHtml = (l.players || []).map(p => {
                    const avText = p.avatar_url || p.banner_url ? '' : (p.nickname || '?').charAt(0).toUpperCase();
                    
                    // Фон аватара: баннер > аватар
                    let avBgImage = '';
                    if (p.avatar_url && !p.banner_url) {
                        avBgImage = p.avatar_url;
                    }
                    const avatarStyle = avBgImage ? `background-image:url('${avBgImage}');background-size:cover;background-position:center;` : '';

                    // Видео/gif баннер
                    let bannerHtml = '';
                    if (p.banner_url) {
                        const bUrl = (typeof API_URL !== 'undefined' ? API_URL : '') + p.banner_url;
                        const bStyle = "position:absolute !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; object-fit:cover !important; object-position:center !important; opacity:1 !important; z-index:0 !important; pointer-events:none !important; border-radius:50% !important; display:block !important;";
                        if (p.banner_type === 'webm' || p.banner_type === 'mp4') {
                            bannerHtml = `<video src="${bUrl}" autoplay loop muted playsinline style="${bStyle}"></video>`;
                        } else if (p.banner_type === 'gif') {
                            bannerHtml = `<img src="${bUrl}" style="${bStyle}">`;
                        } else {
                            bannerHtml = `<div style="${bStyle} background-image:url('${bUrl}'); background-size:cover; background-position:center;"></div>`;
                        }
                    }
                    
                    const verify = p.is_verified && typeof verifySvg === 'function' ? '<span class="verify-badge">' + verifySvg('gold') + '</span>' : '';
                    const vip = p.is_vip ? '<span class="vip-badge-svg"><svg viewBox="0 0 24 24" fill="#ffd700" stroke="#b8860b" stroke-width="1" style="width:12px;height:12px;"><path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/></svg></span>' : '';
                    const leader = p.is_leader ? '<span class="leader-badge-svg"><svg viewBox="0 0 24 24" fill="#ffd700" stroke="#b8860b" stroke-width="1" style="width:12px;height:12px;"><path d="M12 3l2.9 6.3 6.6.6-5 4.7 1.5 6.7L12 17.9 6 21.3l1.5-6.7-5-4.7 6.6-.6z"/></svg></span>' : '';

                    return `
                        <div class="lobby-player">
                            <div class="lobby-player-avatar-wrap">
                                <div class="lobby-player-avatar" style="${avatarStyle} overflow:hidden !important; border-radius:50% !important; position:relative !important; width:100% !important; height:100% !important; display:flex !important; align-items:center !important; justify-content:center !important;">${bannerHtml}${p.avatar_url ? "" : (p.nickname || "?").charAt(0).toUpperCase()}</div>
                                <div class="lobby-player-level-hex">${typeof levelHexSvg === 'function' ? levelHexSvg(levelFromElo(p.elo), 22) : ''}</div>
                            </div>
                            <div class="lobby-player-info">
                                <div class="lobby-player-name">${leader}${escapeHtml(p.nickname)}${verify}${vip}</div>
                            </div>
                        </div>
                    `;
                }).join('');

                // Пустые слоты
                let emptySlots = '';
                const filled = (l.players || []).length;
                const total = l.max_players;
                // Полоса прогресса — прогресс по игрокам
                let progressBars = '';
                for (let i = 0; i < total; i++) {
                    progressBars += `<div class="lobby-progress-bar${i < filled ? ' filled' : ''}"></div>`;
                }

                const statusBadge = isFull
                    ? '<span class="lobby-status full" style="color:#ef4444;font-size:10px;font-weight:800;">ЗАПОЛНЕНО</span>'
                    : (filled >= total - 2
                        ? '<span class="lobby-status" style="color:#fbbf24;font-size:10px;font-weight:800;">ПОЧТИ ПОЛНОЕ</span>'
                        : '');

                const btnText = isCreator ? 'Выйти (ты создатель)' : (isMember ? 'Выйти' : (isFull ? 'Заполнено' : 'Войти'));
                const btnClass = isMember ? 'lobby-join-btn leave' : 'lobby-join-btn';
                const btnDisabled = !isMember && isFull;

                return `
                    <div class="lobby-card${isFull ? ' full' : ''}">
                        ${isAdmin ? '<button class="lobby-admin-delete" data-admin-delete="${l.lobby_id}" title="Удалить лобби">×</button>' : ''}
                        <div class="lobby-header">
                            <div class="lobby-title">
                                <span class="lobby-num">ЛОББИ #${l.lobby_id}</span>
                                <span class="lobby-mode-badge">${escapeHtml(l.mode)}</span>
                                ${statusBadge}
                            </div>
                            <div class="lobby-slots">
                                <span class="cur">${filled}</span><span class="max">/${total}</span>
                            </div>
                        </div>
                        <div class="lobby-map-name">Карта: ${escapeHtml(l.map)}</div>
                        <div class="lobby-players">${playersHtml}</div>
                        <div class="lobby-progress">${progressBars}</div>
                        <button class="${btnClass}" 
                                data-lobby-id="${l.lobby_id}"
                                data-action="${isMember ? 'leave' : 'join'}"
                                ${btnDisabled ? 'disabled' : ''}>
                            ${btnText}
                        </button>
                    </div>
                `;
            }).join('');

            // Обработчик админ-удаления
            container.querySelectorAll('.lobby-admin-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const lobbyId = parseInt(btn.dataset.adminDelete);
                    if (!confirm('Удалить это лобби?')) return;
                    try {
                        await fetch(api + '/api/admin/lobby/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                            body: JSON.stringify({ admin_id: getUserId(), lobby_id: lobbyId })
                        });
                        toast('✓ Лобби удалено');
                        loadLobbies();
                    } catch (e) {
                        toast('Ошибка: ' + e.message);
                    }
                });
            });

            // Обработчики
            container.querySelectorAll('.lobby-join-btn:not(:disabled)').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const lobbyId = parseInt(btn.dataset.lobbyId);
                    const action = btn.dataset.action;
                    if (action === 'join') await joinLobby(lobbyId);
                    else await leaveLobby(lobbyId);
                });
            });
        } catch (e) {
            console.error('[LOBBIES]', e);
            container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        }
    }

    async function joinLobby(lobbyId) {
        const userId = getUserId();
        const api = getApiUrl();
        try {
            const res = await fetch(api + '/api/join_lobby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                body: JSON.stringify({ lobby_id: lobbyId, user_id: userId })
            }).then(r => r.json());

            if (res.error) { toast('❌ ' + res.error); return; }
            toast('✓ Ты вошёл в лобби');
            window.openLobbyRoom(lobbyId);
        } catch (e) {
            toast('Ошибка: ' + e.message);
        }
    }

    async function leaveLobby(lobbyId) {
        const userId = getUserId();
        const api = getApiUrl();
        try {
            const res = await fetch(api + '/api/leave_lobby', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                body: JSON.stringify({ lobby_id: lobbyId, user_id: userId })
            }).then(r => r.json());

            if (res.error) { toast('❌ ' + res.error); return; }
            toast(res.closed ? '✓ Лобби закрыто' : '✓ Ты вышел');
            loadLobbies();
        } catch (e) {
            toast('Ошибка: ' + e.message);
        }
    }

    // ==== Создать лобби (модалка выбора режима/карты) ====
    function openCreateLobbyModal() {
        let modal = document.getElementById('create-lobby-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'create-lobby-modal';
            modal.className = 'create-lobby-overlay';
            modal.innerHTML = `
                <div class="create-lobby-modal">
                    <div class="create-lobby-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:24px;height:24px;"><path d="M12 5v14M5 12h14"/></svg>
                        <span>Создать лобби</span>
                    </div>

                    <div class="create-section">
                        <div class="create-label">Режим</div>
                        <div class="create-chips" id="create-mode-chips">
                            <button class="create-chip" data-mode="1x1">1×1</button>
                            <button class="create-chip" data-mode="2x2">2×2</button>
                            <button class="create-chip" data-mode="3x3">3×3</button>
                            <button class="create-chip" data-mode="4x4">4×4</button>
                            <button class="create-chip active" data-mode="5x5">5×5</button>
                        </div>
                    </div>

                    <div class="create-section">
                        <div class="create-label">Карта</div>
                        <div class="create-chips" id="create-map-chips">
                            <button class="create-chip active" data-map="Sandstone">Sandstone</button>
                            <button class="create-chip" data-map="Hanami">Hanami</button>
                            <button class="create-chip" data-map="Province">Province</button>
                            <button class="create-chip" data-map="Rust">Rust</button>
                            <button class="create-chip" data-map="Prison">Prison</button>
                        </div>
                    </div>

                    <div class="create-lobby-actions">
                        <button class="create-btn primary" id="create-lobby-submit">Создать</button>
                        <button class="create-btn secondary" id="create-lobby-cancel">Отмена</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        modal.classList.add('active');

        let selectedMode = '5x5';
        let selectedMap = 'Sandstone';

        // Выбор режима
        modal.querySelectorAll('#create-mode-chips .create-chip').forEach(chip => {
            chip.onclick = () => {
                modal.querySelectorAll('#create-mode-chips .create-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                selectedMode = chip.dataset.mode;
                if (window.haptic) window.haptic('light');
            };
        });

        // Выбор карты
        modal.querySelectorAll('#create-map-chips .create-chip').forEach(chip => {
            chip.onclick = () => {
                modal.querySelectorAll('#create-map-chips .create-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                selectedMap = chip.dataset.map;
                if (window.haptic) window.haptic('light');
            };
        });

        const cancelBtn = modal.querySelector('#create-lobby-cancel');
        cancelBtn.onclick = () => modal.classList.remove('active');
        modal.onclick = e => { if (e.target === modal) modal.classList.remove('active'); };

        modal.querySelector('#create-lobby-submit').onclick = async () => {
            const userId = getUserId();
            const api = getApiUrl();

            try {
                const res = await fetch(api + '/api/create_lobby', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                    body: JSON.stringify({ creator_id: userId, mode: selectedMode, map: selectedMap })
                }).then(r => r.json());

                if (res.error) { toast('❌ ' + res.error); return; }
                toast('✓ Лобби создано');
                modal.classList.remove('active');
                loadLobbies();
            } catch (e) {
                toast('Ошибка: ' + e.message);
            }
        };
    }

    // ==== Пати ====
    async function loadParty() {
        const container = document.getElementById('play-party-content');
        if (!container) return;
        container.innerHTML = '<div class="tn-loading">Загрузка...</div>';

        const userId = getUserId();
        const api = getApiUrl();

        try {
            const data = await fetch(api + '/api/party/info?tg_id=' + userId).then(r => r.json());

            if (!data.party) {
                container.innerHTML = `
                    <div class="party-card">
                        <div style="text-align:center;padding:20px 0;">
                            <div style="color:#fff;font-size:16px;font-weight:800;margin-bottom:8px;">У тебя нет пати</div>
                            <div style="color:#8a7a9b;font-size:13px;margin-bottom:20px;">Создай пати и пригласи друга по коду</div>
                            <button class="party-btn" id="party-create-btn" style="width:100%;padding:14px;font-size:14px;">Создать пати</button>
                        </div>
                    </div>

                    <div class="party-card">
                        <div style="color:#fff;font-size:14px;font-weight:700;margin-bottom:10px;">Вступить в пати</div>
                        <input class="party-input" id="party-code-input" placeholder="КОД" maxlength="6">
                        <button class="party-btn" id="party-join-btn" style="width:100%;padding:12px;">Вступить по коду</button>
                    </div>
                `;

                document.getElementById('party-create-btn').onclick = createParty;
                document.getElementById('party-join-btn').onclick = () => {
                    const code = document.getElementById('party-code-input').value.trim();
                    if (code) joinParty(code);
                };
                return;
            }

            // Есть пати
            const isLeader = data.party.leader_id === userId;

            let membersHtml = data.members.map(m => {
                const avStyle = m.avatar_url ? `background-image:url('${m.avatar_url}')` : '';
                const avText = m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase();
                const isL = m.user_id === data.party.leader_id;
                const kickBtn = (isLeader && !isL) ? `<button class="party-kick-btn" data-kick-id="${m.user_id}">×</button>` : '';
                return `
                    <div class="party-member">
                        <div class="party-member-avatar" style="${avStyle}">${p.avatar_url ? "" : (p.nickname || "?").charAt(0).toUpperCase()}</div>
                        <div class="party-member-info">
                            <div class="party-member-name">${escapeHtml(m.nickname || '—')}</div>
                            <div class="party-member-role">${isL ? 'Лидер' : 'Участник'} · LVL ${m.level || 1}</div>
                        </div>
                        ${kickBtn}
                    </div>
                `;
            }).join('');

            container.innerHTML = `
                <div class="party-card">
                    <div style="color:#fff;font-size:14px;font-weight:800;margin-bottom:12px;">Моя пати (${data.members.length}/4)</div>
                    
                    <div class="party-invite-code">
                        <div class="party-invite-label">Код приглашения</div>
                        <div class="party-invite-code-value">${data.party.invite_code}</div>
                        <button class="party-invite-copy" id="party-copy-btn">📋 Копировать</button>
                    </div>

                    ${membersHtml}

                    <div class="party-actions">
                        <button class="party-btn danger" id="party-leave-btn">${isLeader ? 'Закрыть пати' : 'Покинуть'}</button>
                    </div>
                </div>
            `;

            document.getElementById('party-copy-btn').onclick = () => {
                navigator.clipboard.writeText(data.party.invite_code);
                toast('✓ Скопировано');
            };

            document.getElementById('party-leave-btn').onclick = async () => {
                if (!confirm(isLeader ? 'Закрыть пати для всех?' : 'Покинуть пати?')) return;
                await leaveParty();
            };

            container.querySelectorAll('[data-kick-id]').forEach(btn => {
                btn.onclick = async () => {
                    const targetId = parseInt(btn.dataset.kickId);
                    if (!confirm('Выгнать игрока?')) return;
                    await kickMember(targetId);
                };
            });

        } catch (e) {
            console.error('[PARTY]', e);
            container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        }
    }

    async function createParty() {
        const userId = getUserId();
        const api = getApiUrl();
        try {
            const res = await fetch(api + '/api/party/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                body: JSON.stringify({ tg_id: userId })
            }).then(r => r.json());

            if (res.error) { toast('❌ ' + res.error); return; }
            toast('✓ Пати создано. Код: ' + res.invite_code);
            loadParty();
        } catch (e) {
            toast('Ошибка: ' + e.message);
        }
    }

    async function joinParty(code) {
        const userId = getUserId();
        const api = getApiUrl();
        try {
            const res = await fetch(api + '/api/party/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                body: JSON.stringify({ tg_id: userId, code })
            }).then(r => r.json());

            if (res.error) { toast('❌ ' + res.error); return; }
            toast('✓ Ты в пати');
            loadParty();
        } catch (e) {
            toast('Ошибка: ' + e.message);
        }
    }

    async function leaveParty() {
        const userId = getUserId();
        const api = getApiUrl();
        try {
            await fetch(api + '/api/party/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                body: JSON.stringify({ tg_id: userId })
            });
            toast('✓ Готово');
            loadParty();
        } catch (e) {
            toast('Ошибка: ' + e.message);
        }
    }

    async function kickMember(targetId) {
        const userId = getUserId();
        const api = getApiUrl();
        try {
            await fetch(api + '/api/party/kick', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                body: JSON.stringify({ leader_id: userId, target_id: targetId })
            });
            toast('✓ Игрок выгнан');
            loadParty();
        } catch (e) {
            toast('Ошибка: ' + e.message);
        }
    }

    // ==== Вкладки (Лобби / Пати) ====
    function initPlayTabs() {
        document.querySelectorAll('.play-tab').forEach(t => {
            t.onclick = () => {
                document.querySelectorAll('.play-tab').forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                const target = t.dataset.playTab;
                document.getElementById('play-lobbies-view').style.display = target === 'lobbies' ? 'block' : 'none';
                document.getElementById('play-party-view').style.display = target === 'party' ? 'block' : 'none';
                if (target === 'lobbies') loadLobbies();
                else loadParty();
            };
        });

        const createBtn = document.getElementById('play-create-lobby-btn');
        if (createBtn) createBtn.onclick = openCreateLobbyModal;
    }

    // ==== Экспорт ====
    window.openPlayScreen = openPlayScreen;
    window.loadLobbies = loadLobbies;
    window.loadParty = loadParty;

    document.addEventListener('DOMContentLoaded', initPlayTabs);

    // Заменяем openPlayModal (старую модалку) на новый экран
    window.openPlayModal = openPlayScreen;


// ================== ЛОББИ-КОМНАТА ==================

let currentRoomLobbyId = null;
let roomTimerInterval = null;

async function openLobbyRoom(lobbyId) {
    console.log('[ROOM] openLobbyRoom', lobbyId);
    window.currentRoomLobbyId = lobbyId;
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tab = document.getElementById('tab-lobby-room');
    if (!tab) {
        console.error('[ROOM] tab-lobby-room НЕ НАЙДЕН!');
        return;
    }
    tab.classList.add('active');
    console.log('[ROOM] tab active:', tab.classList.contains('active'));
    window.scrollTo(0, 0);
    await loadLobbyRoom(lobbyId);
    startRoomTimer();
}

function closeLobbyRoom() {
    if (roomTimerInterval) {
        clearInterval(roomTimerInterval);
        roomTimerInterval = null;
    }
    currentRoomLobbyId = null;
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const playTab = document.getElementById('tab-play');
    if (playTab) playTab.classList.add('active');
    loadLobbies();
}

function startRoomTimer() {
    if (roomTimerInterval) clearInterval(roomTimerInterval);
    let seconds = 0;
    roomTimerInterval = setInterval(() => {
        seconds++;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        const timerEl = document.getElementById('lobby-room-timer');
        if (timerEl) timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
}

async function loadLobbyRoom(lobbyId) {
    const api = getApiUrl();
    try {
        const data = await fetch(api + '/api/lobby/' + lobbyId).then(r => r.json());
        if (data.error) {
            // Не закрываем — просто показываем сообщение
            toast('⚠️ ' + data.error);
            // Рендерим пустую комнату
            renderLobbyRoom({
                lobby_id: lobbyId,
                mode: '—',
                map: '—',
                max_players: 10,
                current_players: 0,
                players: [],
                estimated_min: 90
            });
            return;
        }
        renderLobbyRoom(data);
    } catch (e) {
        toast('Ошибка загрузки комнаты');
    }
}

function renderLobbyRoom(data) {
    const userId = getUserId();

    // Заголовок
    const titleEl = document.getElementById('lobby-room-title');
    if (titleEl) titleEl.textContent = 'ЛОББИ #' + data.lobby_id;

    // Инфо
    const modeEl = document.getElementById('lobby-room-mode');
    if (modeEl) modeEl.textContent = data.mode;
    const estEl = document.getElementById('lobby-room-est');
    if (estEl) estEl.textContent = '~' + data.estimated_min + ' мин';

    // Сетка слотов
    const slotsEl = document.getElementById('lobby-room-slots');
    if (!slotsEl) return;

    let slotsHtml = '';
    const total = data.max_players;
    const players = data.players || [];

    for (let i = 0; i < total; i++) {
        const p = players[i];
        if (p) {
            const avStyle = p.avatar_url ? `background-image:url('${p.avatar_url}')` : '';
            const avText = p.avatar_url ? '' : (p.nickname || '?').charAt(0).toUpperCase();
            const crown = p.is_leader ? '<div class="lobby-slot-crown"><svg viewBox="0 0 24 24" fill="#ffd700" stroke="#b8860b" stroke-width="1" style="width:18px;height:18px;"><path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/></svg></div>' : '';

            // Баннер в фоне
            let bannerHtml = '';
            if (p.banner_url) {
                const bUrl = API_URL + p.banner_url;
                if (p.banner_type === 'webm' || p.banner_type === 'mp4') {
                    bannerHtml = `<video class="lobby-slot-banner" src="${bUrl}" autoplay loop muted playsinline></video>`;
                } else if (p.banner_type === 'gif') {
                    bannerHtml = `<img class="lobby-slot-banner" src="${bUrl}" alt="">`;
                } else {
                    bannerHtml = `<div class="lobby-slot-banner" style="background-image:url('${bUrl}');background-size:cover;background-position:center;"></div>`;
                }
            }

            slotsHtml += `
                <div class="lobby-slot filled" data-user-id="${p.user_id}">
                    ${crown}
                    <div class="lobby-slot-avatar" style="${avStyle}">
                        ${bannerHtml}
                        ${p.avatar_url ? "" : (p.nickname || "?").charAt(0).toUpperCase()}
                        <div class="lobby-slot-level-hex">${typeof levelHexSvg === 'function' ? levelHexSvg(levelFromElo(p.elo), 20) : ''}</div>
                    </div>
                    <div class="lobby-slot-name">${escapeHtml(p.nickname)}</div>
                    <div class="lobby-slot-elo">${p.elo || 0} ELO</div>
                </div>
            `;
        } else {
            slotsHtml += `
                <div class="lobby-slot empty">
                    <div class="lobby-slot-empty-icon">+</div>
                    <div class="lobby-slot-name">Ждём...</div>
                </div>
            `;
        }
    }
    slotsEl.innerHTML = slotsHtml;

    // Прогресс
    const progressEl = document.getElementById('lobby-room-progress');
    if (progressEl) progressEl.style.width = ((players.length / total) * 100) + '%';

    // Подсказка
    const hintEl = document.getElementById('lobby-room-hint');
    if (hintEl) {
        const left = total - players.length;
        if (left === 0) hintEl.textContent = 'Лобби заполнено! Матч стартует.';
        else hintEl.textContent = 'Ищем ещё ' + left + ' игроков — матч стартует, как только лобби заполнится';
    }

    // Обработчик для кнопки "Выйти"
    const leaveBtn = document.getElementById('lobby-room-leave');
    if (leaveBtn) {
        leaveBtn.onclick = async () => {
            if (!confirm('Выйти из лобби?')) return;
            await leaveLobbyRoom();
        };
    }

    // Пригласить — копирует ID лобби
    const inviteBtn = document.getElementById('lobby-room-invite');
    if (inviteBtn) {
        inviteBtn.onclick = () => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText('Лобби #' + data.lobby_id);
                toast('✓ ID лобби скопирован');
            }
        };
    }

    // Назад
    const backBtn = document.getElementById('lobby-room-back');
    if (backBtn) {
        backBtn.onclick = closeLobbyRoom;
    }
}

async function leaveLobbyRoom() {
    if (!currentRoomLobbyId) {
        closeLobbyRoom();
        return;
    }
    const userId = getUserId();
    const api = getApiUrl();
    try {
        await fetch(api + '/api/leave_lobby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
            body: JSON.stringify({ lobby_id: currentRoomLobbyId, user_id: userId })
        });
        toast('✓ Ты вышел из лобби');
    } catch (e) {}
    closeLobbyRoom();
}

window.openLobbyRoom = openLobbyRoom;
window.closeLobbyRoom = closeLobbyRoom;


})();
