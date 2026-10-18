// ==========================================
// НОВАЯ СИСТЕМА ЛОББИ (ШАГ 1: ТОЛЬКО РЕНДЕР)
// ==========================================
(function() {
    'use strict';
    if (window.__lobbyNewFinal) return;
    window.__lobbyNewFinal = true;

    const API_KEY = 'lumafaceit_secret_e8jd90jd19dd7dk';
    const ADMINS = [6999358439, 1135455373, 8863307702, 1244969288, 7938171818, 6372817931, 8594288119];

    function getApi() { return window.API_URL || (typeof getApiUrl === 'function' ? getApiUrl() : ''); }
    function getUid() { return window.tgUser ? window.tgUser.id : (typeof getUserId === 'function' ? getUserId() : null); }

    // ===== ФУНКЦИЯ РЕНДЕРА КАРТОЧКИ (НОВЫЙ ДИЗАЙН) =====
    function renderCard(l, isFull, isMember, isCreator, isAdmin) {
        const API = getApi();
        const players = l.players || [];
        const maxPlayers = l.max_players || 10;
        const half = Math.ceil(maxPlayers / 2);
        const ctPlayers = players.slice(0, half);
        const tPlayers = players.slice(half, maxPlayers);

        // Генерация игрока
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

        // Кнопки
        let btnHtml = '';
        if (isMember) {
            btnHtml = `<button class="lobby-btn-red" data-lobby-id="${l.lobby_id}" data-action="leave">Выйти</button>`;
        } else {
            btnHtml = `<button class="lobby-btn-purple ${isFull ? 'disabled' : ''}" data-lobby-id="${l.lobby_id}" data-action="join" ${isFull ? 'disabled' : ''}>${isFull ? 'Заполнено' : 'Войти'}</button>`;
        }
        if (isCreator || isAdmin) {
            btnHtml += `<button class="lobby-btn-del" data-admin-delete="${l.lobby_id}" title="Удалить">✕</button>`;
        }

        // Статус
        let status = '';
        if (isFull) status = `<span class="lobby-status-full">ЗАПОЛНЕНО</span>`;
        else if (players.length >= maxPlayers - 1) status = `<span class="lobby-status-almost">ПОЧТИ ПОЛНОЕ</span>`;

        // Прогресс
        let progressHtml = '<div class="lobby-progress">';
        for (let i = 0; i < maxPlayers; i++) {
            progressHtml += `<div class="lobby-progress-seg ${i < players.length ? 'filled' : ''}"></div>`;
        }
        progressHtml += '</div>';

        return `
            <div class="lobby-card-glass ${isFull ? 'full' : ''}">
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

    // ===== ЗАГРУЗКА И ОТРИСОВКА СПИСКА =====
    
    let lastData = null;

    async function loadAndRender() {
        let container = document.getElementById('play-lobbies-list') 
                     || document.querySelector('.lobbies-grid') 
                     || document.querySelector('#tab-play .lobby-list');
        
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

        try {
            const res = await fetch(getApi() + '/api/lobbies');
            const data = await res.json();
            const me = getUid();
            const isAdmin = ADMINS.includes(me);

            // Если данные не изменились — ничего не перерисовываем (нет мигания)
            const jsonStr = JSON.stringify(data);
            if (lastData === jsonStr) return;
            lastData = jsonStr;

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

            // Обработчики кнопок
            container.querySelectorAll('[data-action]').forEach(btn => {
                btn.onclick = async (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const action = btn.dataset.action;
                    const lobbyId = btn.dataset.lobbyId;
                    const endpoint = action === 'join' ? '/api/join_lobby' : '/api/leave_lobby';
                    
                    btn.disabled = true;
                    await fetch(getApi() + endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                        body: JSON.stringify({ lobby_id: lobbyId, user_id: me })
                    });
                    lastData = null; // Сбрасываем кэш, чтобы обновилось
                    loadAndRender();
                };
            });

            // Обработчики удаления
            container.querySelectorAll('[data-admin-delete]').forEach(btn => {
                btn.onclick = async (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const lobbyId = btn.dataset.adminDelete;
                    if (!confirm('Удалить лобби #' + lobbyId + '?')) return;
                    
                    const isAdmin = ADMINS.includes(me);
                    const endpoint = isAdmin ? '/api/admin/lobby/delete' : '/api/close_lobby';
                    const body = isAdmin 
                        ? { admin_id: me, lobby_id: lobbyId } 
                        : { user_id: me, lobby_id: lobbyId };

                    await fetch(getApi() + endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                        body: JSON.stringify(body)
                    });
                    lastData = null;
                    loadAndRender();
                };
            });

        } catch (e) {
            // Если ошибка — не показываем, оставляем старый список
            console.warn('Lobby load error:', e);
        }
    }

// ===== ИНИЦИАЛИЗАЦИЯ =====
    window.addEventListener('load', function() {
        setTimeout(function() {
            loadAndRender();
            // Автообновление каждые 3 секунды (только если вкладка Играть активна)
            setInterval(function() {
                const tabPlay = document.getElementById('tab-play');
                if (tabPlay && tabPlay.classList.contains('active')) {
                    loadAndRender();
                }
            }, 5000);
        }, 1000);
    });

    // Экспортируем функцию, если пригодится
    window.reloadLobbyList = loadAndRender;
})();
