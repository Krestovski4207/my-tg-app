// ==========================================
// НОВАЯ СИСТЕМА ЛОББИ (БЕЗ МИГАНИЯ + СОЗДАНИЕ)
// ==========================================
(function() {
    'use strict';
    if (window.__lobbyNewFinal) return;
    window.__lobbyNewFinal = true;

    const API_KEY = 'lumafaceit_secret_e8jd90jd19dd7dk';
    const ADMINS = [6999358439, 1135455373, 8863307702, 1244969288, 7938171818, 6372817931, 8594288119];
    const MODES = ['1x1', '2x2', '3x3', '4x4', '5x5'];
    const MAPS = ['Sandstone', 'Rust', 'Prison', 'Hanami'];

    function getApi() { return window.API_URL || (typeof getApiUrl === 'function' ? getApiUrl() : ''); }
    function getUid() { return window.tgUser ? window.tgUser.id : (typeof getUserId === 'function' ? getUserId() : null); }

    let lastDataStr = '';
    let container = null;

    // ===== РЕНДЕР КАРТОЧКИ =====
    function renderCard(l, isFull, isMember, isCreator, isAdmin) {
        const API = getApi();
        const players = l.players || [];
        const maxPlayers = l.max_players || 10;
        const half = Math.ceil(maxPlayers / 2);
        const ctPlayers = players.slice(0, half);
        const tPlayers = players.slice(half, maxPlayers);

        function renderPlayer(p) {
            if (!p) return '<div class="lobby-slot-empty">Ждём...</div>';
            const avUrl = p.banner_url ? (API + p.banner_url) : (p.avatar_url || '');
            const avStyle = avUrl ? `background-image:url('${avUrl}');background-size:cover;background-position:center;` : 'background:#1a0f2a;';
            const letter = avUrl ? '' : (p.nickname || '?').charAt(0).toUpperCase();
            const level = typeof levelFromElo === 'function' ? levelFromElo(p.elo || 0) : 1;
            const hexSvg = typeof levelHexSvg === 'function' ? levelHexSvg(level, 22) : `<div style="width:22px;height:22px;background:#333;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;">${level}</div>`;
            const verify = p.is_verified && typeof verifySvg === 'function' ? `<span style="margin-left:4px;">${verifySvg('gold')}</span>` : '';
            const vip = p.is_vip ? `<span style="margin-left:2px;color:#ffd700;">⭐</span>` : '';
            const leader = p.is_leader ? `<span style="margin-left:2px;color:#ffd700;">👑</span>` : '';

            return `
                <div class="lobby-player-glass">
                    <div class="lp-av-wrap">
                        <div class="lp-av" style="${avStyle}">${letter}</div>
                        <div class="lp-hex">${hexSvg}</div>
                    </div>
                    <div class="lp-name">${leader}${p.nickname || '?'}${verify}${vip}</div>
                </div>
            `;
        }

        let btnHtml = '';
        if (isMember) {
            btnHtml = `<button class="lobby-btn-red" data-lobby-id="${l.lobby_id}" data-action="leave">Выйти</button>`;
        } else {
            btnHtml = `<button class="lobby-btn-purple ${isFull ? 'disabled' : ''}" data-lobby-id="${l.lobby_id}" data-action="join" ${isFull ? 'disabled' : ''}>${isFull ? 'Заполнено' : 'Войти'}</button>`;
        }
        if (isCreator || isAdmin) {
            btnHtml += `<button class="lobby-btn-del" data-admin-delete="${l.lobby_id}" title="Удалить">✕</button>`;
        }

        let status = '';
        if (isFull) {
            const hostPlayer = players.find(p => Number(p.user_id) === Number(l.creator_id));
            const hostName = hostPlayer ? hostPlayer.nickname : ('ID ' + l.creator_id);
            status = `<span class="lobby-status-full">ЗАПОЛНЕНО</span> <span style="color:#8a7a9b;font-size:11px;margin-left:8px;">Хост: ${hostName}</span>`;
        } else if (players.length >= maxPlayers - 1) {
            status = `<span class="lobby-status-almost">ПОЧТИ ПОЛНОЕ</span>`;
        }

        let progressHtml = '<div class="lobby-progress">';
        for (let i = 0; i < maxPlayers; i++) {
            progressHtml += `<div class="lobby-progress-seg ${i < players.length ? 'filled' : ''}"></div>`;
        }
        progressHtml += '</div>';

        return `
            <div class="lobby-card-glass ${isFull ? 'full' : ''}" data-lobby-id="${l.lobby_id}">
                <div class="lobby-card-header">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:18px;font-weight:800;color:#fff;font-style:italic;">ЛОББИ #${l.lobby_id}</span>
                        <span class="lobby-mode-tag">${l.mode}</span>
                        ${status}
                    </div>
                    <div class="lobby-card-actions">${btnHtml}</div>
                </div>
                <div class="lobby-map">Карта: ${l.map || 'Sandstone'}</div>
                <div class="lobby-teams">
                    <div class="lobby-team-col">
                        <div class="lobby-team-title">CT</div>
                        ${ctPlayers.map(p => renderPlayer(p)).join('')}
                        ${Array(Math.max(0, half - ctPlayers.length)).fill('<div class="lobby-slot-empty">Ждём...</div>').join('')}
                    </div>
                    <div class="lobby-team-col">
                        <div class="lobby-team-title">T</div>
                        ${tPlayers.map(p => renderPlayer(p)).join('')}
                        ${Array(Math.max(0, (maxPlayers - half) - tPlayers.length)).fill('<div class="lobby-slot-empty">Ждём...</div>').join('')}
                    </div>
                </div>
                ${progressHtml}
            </div>
        `;
    }

    // ===== ЗАГРУЗКА (БЕЗ МИГАНИЯ) =====
    async function loadAndRender() {
        if (!container) {
            container = document.getElementById('play-lobbies-list');
            if (!container) {
                const tabPlay = document.getElementById('tab-play');
                if (tabPlay) {
                    container = document.createElement('div');
                    container.id = 'play-lobbies-list';
                    container.style.cssText = 'padding: 16px;';
                    tabPlay.appendChild(container);
                } else {
                    return;
                }
            }
        }

        try {
            const res = await fetch(getApi() + '/api/lobbies');
            const data = await res.json();
            const me = getUid();
            const isAdmin = ADMINS.includes(me);

            const newStr = JSON.stringify(data);
            if (newStr === lastDataStr) return; // Ничего не изменилось - не перерисовываем
            lastDataStr = newStr;

            if (!data || data.length === 0) {
                container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#8a7a9b;">Активных лобби нет.<br>Создай первое!</div>';
                return;
            }

            container.innerHTML = data.map(l => {
                const players = l.players || [];
                const isFull = l.is_full || (players.length >= l.max_players);
                const isMember = players.some(p => Number(p.user_id) === me);
                const isCreator = Number(l.creator_id) === me;
                return renderCard(l, isFull, isMember, isCreator, isAdmin);
            }).join('');

            bindActions(container, me);

        } catch (e) {
            console.warn('Lobby load error:', e);
        }
    }

    function bindActions(container, me) {
        // Убираем старый обработчик, чтобы не дублировался
        if (container._lobbyHandler) {
            container.removeEventListener('click', container._lobbyHandler);
        }

        container._lobbyHandler = async function(e) {
            const btn = e.target.closest('[data-action], [data-admin-delete]');
            if (!btn) return;

            // Вход/Выход
            if (btn.dataset.action) {
                e.preventDefault(); e.stopPropagation();
                const action = btn.dataset.action;
                const lobbyId = btn.dataset.lobbyId;
                const endpoint = action === 'join' ? '/api/join_lobby' : '/api/leave_lobby';
                
                btn.disabled = true;
                btn.textContent = '...';
                
                try {
                    const res = await fetch(getApi() + endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                        body: JSON.stringify({ lobby_id: lobbyId, user_id: me })
                    });
                    const data = await res.json();
                    if (data.error) {
                        alert('Ошибка: ' + data.error);
                    }
                } catch (err) {
                    alert('Ошибка сети: ' + err.message);
                }
                
                lastDataStr = '';
                setTimeout(loadAndRender, 100);
                return;
            }

            // Удаление
            if (btn.dataset.adminDelete) {
                e.preventDefault(); e.stopPropagation();
                const lobbyId = btn.dataset.adminDelete;
                if (!confirm('Удалить лобби #' + lobbyId + '?')) return;
                
                const isAdmin = ADMINS.includes(me);
                const endpoint = isAdmin ? '/api/admin/lobby/delete' : '/api/close_lobby';
                const body = isAdmin ? { admin_id: me, lobby_id: lobbyId } : { user_id: me, lobby_id: lobbyId };

                btn.disabled = true;
                await fetch(getApi() + endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                    body: JSON.stringify(body)
                });
                lastDataStr = '';
                setTimeout(loadAndRender, 100);
            }
        };

        container.addEventListener('click', container._lobbyHandler);
    }

    // ===== МОДАЛКА СОЗДАНИЯ =====
    function openCreateModal() {
        const me = getUid();
        let selMode = '5x5';
        let selMap = 'Sandstone';

        // Проверка: есть ли уже лобби у игрока
        fetch(getApi() + '/api/lobbies')
            .then(r => r.json())
            .then(data => {
                const myLobby = data.find(l => Number(l.creator_id) === me);
                if (myLobby) {
                    alert('У тебя уже есть лобби #' + myLobby.lobby_id + '. Удали его, чтобы создать новое.');
                    return;
                }

                // Создаем модалку
                const overlay = document.createElement('div');
                overlay.className = 'lobby-modal-overlay';
                overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;';

                overlay.innerHTML = `
                    <div style="background:#150a20;border:1px solid #a855f7;border-radius:16px;padding:20px;width:100%;max-width:400px;">
                        <h3 style="color:#fff;margin:0 0 16px 0;text-align:center;">Создать лобби</h3>
                        <div style="margin-bottom:16px;">
                            <div style="color:#8a7a9b;font-size:12px;margin-bottom:8px;">Режим</div>
                            <div id="modal-modes" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
                        </div>
                        <div style="margin-bottom:20px;">
                            <div style="color:#8a7a9b;font-size:12px;margin-bottom:8px;">Карта</div>
                            <div id="modal-maps" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
                        </div>
                        <div style="display:flex;gap:10px;">
                            <button id="modal-cancel" style="flex:1;padding:10px;background:#333;color:#fff;border:none;border-radius:8px;cursor:pointer;">Отмена</button>
                            <button id="modal-confirm" style="flex:1;padding:10px;background:#a855f7;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Создать</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);

                function renderModalOpts() {
                    document.getElementById('modal-modes').innerHTML = MODES.map(m => 
                        `<button class="modal-opt" data-m="${m}" style="background:${m===selMode?'#a855f7':'#333'};color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">${m}</button>`
                    ).join('');
                    document.getElementById('modal-maps').innerHTML = MAPS.map(m => 
                        `<button class="modal-opt" data-p="${m}" style="background:${m===selMap?'#a855f7':'#333'};color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">${m}</button>`
                    ).join('');

                    overlay.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { selMode = b.dataset.m; renderModalOpts(); });
                    overlay.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { selMap = b.dataset.p; renderModalOpts(); });
                }
                renderModalOpts();

                document.getElementById('modal-cancel').onclick = () => overlay.remove();
                document.getElementById('modal-confirm').onclick = async () => {
                    await fetch(getApi() + '/api/create_lobby', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                        body: JSON.stringify({ creator_id: me, mode: selMode, map: selMap })
                    });
                    overlay.remove();
                    lastDataStr = '';
                    loadAndRender();
                };
            })
            .catch(e => alert('Ошибка: ' + e.message));
    }

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    function init() {
        // Ищем контейнер
        container = document.getElementById('play-lobbies-list');
        if (!container) {
            const tabPlay = document.getElementById('tab-play');
            if (tabPlay) {
                container = document.createElement('div');
                container.id = 'play-lobbies-list';
                container.style.cssText = 'padding: 16px;';
                tabPlay.appendChild(container);
            }
        }

        if (!container) {
            setTimeout(init, 500);
            return;
        }

        // Добавляем кнопку "Создать лобби" перед контейнером
        if (!document.getElementById('lobby-create-btn')) {
            const createBtn = document.createElement('button');
            createBtn.id = 'lobby-create-btn';
            createBtn.textContent = '+ Создать лобби';
            createBtn.style.cssText = 'width:100%;padding:12px;margin-bottom:16px;background:rgba(168,85,247,0.15);border:1px solid #a855f7;border-radius:12px;color:#fff;font-weight:bold;font-size:14px;cursor:pointer;';
            createBtn.onclick = openCreateModal;
            container.parentNode.insertBefore(createBtn, container);
        }

        loadAndRender();
        setInterval(() => {
            const tabPlay = document.getElementById('tab-play');
            if (tabPlay && tabPlay.classList.contains('active')) {
                loadAndRender();
            }
        }, 5000);
    }

    window.addEventListener('load', function() {
        setTimeout(init, 1000);
    });

    window.reloadLobbyList = loadAndRender;
})();
