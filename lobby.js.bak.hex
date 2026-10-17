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

                // Игроки
                const playersHtml = (l.players || []).map(p => {
                    const avStyle = p.avatar_url ? `background-image:url('${p.avatar_url}')` : '';
                    const avText = p.avatar_url ? '' : (p.nickname || '?').charAt(0).toUpperCase();
                    const verify = p.is_verified ? '<span class="verify-badge">' + verifySvg('gold') + '</span>' : '';
                    const vip = p.is_vip ? '<span class="vip-badge">👑</span>' : '';
                    const leader = p.is_leader ? '<span style="color:#ffd700;font-size:10px;">★</span>' : '';

                    return `
                        <div class="lobby-player">
                            <div class="lobby-player-avatar" style="${avStyle}">
                                ${avText}
                                <div class="lobby-player-level">${levelFromElo(p.elo)}</div>
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
            loadLobbies();
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
            modal.className = 'banner-upload-modal-overlay';
            modal.innerHTML = `
                <div class="banner-upload-modal">
                    <div class="banner-upload-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:22px;height:22px;"><path d="M12 5v14M5 12h14"/></svg>
                        Создать лобби
                    </div>

                    <label style="color:#8a7a9b;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:6px;display:block;">Режим</label>
                    <select id="create-mode" style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(168,85,247,0.3);border-radius:10px;color:#fff;font-size:14px;margin-bottom:12px;">
                        <option value="1x1">1v1 (2 игрока)</option>
                        <option value="2x2">2v2 (4 игрока)</option>
                        <option value="3x3">3v3 (6 игроков)</option>
                        <option value="4x4">4v4 (8 игроков)</option>
                        <option value="5x5" selected>5v5 (10 игроков)</option>
                    </select>

                    <label style="color:#8a7a9b;font-size:11px;font-weight:700;text-transform:uppercase;margin-bottom:6px;display:block;">Карта</label>
                    <select id="create-map" style="width:100%;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(168,85,247,0.3);border-radius:10px;color:#fff;font-size:14px;margin-bottom:16px;">
                        <option>Sandstone</option>
                        <option>Dust</option>
                        <option>Mirage</option>
                        <option>Inferno</option>
                        <option>Nuke</option>
                    </select>

                    <div class="banner-upload-actions">
                        <button class="banner-upload-btn primary" id="create-lobby-submit">Создать</button>
                        <button class="banner-upload-btn secondary" id="create-lobby-cancel">Отмена</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.classList.add('active');

        const cancelBtn = modal.querySelector('#create-lobby-cancel');
        cancelBtn.onclick = () => modal.classList.remove('active');
        modal.onclick = e => { if (e.target === modal) modal.classList.remove('active'); };

        modal.querySelector('#create-lobby-submit').onclick = async () => {
            const mode = modal.querySelector('#create-mode').value;
            const map = modal.querySelector('#create-map').value;
            const userId = getUserId();
            const api = getApiUrl();

            try {
                const res = await fetch(api + '/api/create_lobby', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'lumafaceit_secret_e8jd90jd19dd7dk' },
                    body: JSON.stringify({ creator_id: userId, mode, map })
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
                        <div class="party-member-avatar" style="${avStyle}">${avText}</div>
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
})();
