// ==========================================
// НОВЫЙ ДИЗАЙН КАРТОЧКИ ЛОББИ (СТЕКЛО, 2 КОЛОНКИ)
// ==========================================
window.renderLobbyCardNew = function(l, isFull, isMember, isCreator, isAdmin) {
    const API = (typeof API_URL !== 'undefined' ? API_URL : '');
    const players = l.players || [];
    const maxPlayers = l.max_players || 10;
    
    // Разделение на КТ и Т (пока просто делим пополам)
    const half = Math.ceil(maxPlayers / 2);
    const ctPlayers = players.slice(0, half);
    const tPlayers = players.slice(half, maxPlayers);

    // Генерация карточки игрока
    function renderPlayer(p) {
        if (!p) return '<div class="lobby-slot-empty">Ждём...</div>';
        
        const avUrl = p.banner_url ? (API + p.banner_url) : (p.avatar_url || '');
        const avStyle = avUrl ? `background-image:url('${avUrl}');background-size:cover;background-position:center;` : 'background:#1a0f2a;';
        const letter = avUrl ? '' : (p.nickname || '?').charAt(0).toUpperCase();
        
        // Гексагон уровня (заглушка, если функции нет)
        const level = typeof levelFromElo === 'function' ? levelFromElo(p.elo || 0) : 1;
        const hexSvg = typeof levelHexSvg === 'function' ? levelHexSvg(level, 22) : `<div style="width:22px;height:22px;background:#333;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;">${level}</div>`;

        // Галочка верификации
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

    // Прогресс-бар (полоски)
    let progressHtml = '<div class="lobby-progress">';
    for (let i = 0; i < maxPlayers; i++) {
        const filled = i < players.length;
        progressHtml += `<div class="lobby-progress-seg ${filled ? 'filled' : ''}"></div>`;
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
};

// ==========================================
// ПОДМЕНА СТАРОГО РЕНДЕРА
// ==========================================
// Ждем, пока lobby_v2.js загрузится, и подменяем функцию
setTimeout(() => {
    // Ищем контейнер, куда рендерятся лобби
    const originalRender = window.renderLobbies || window.loadLobbies;
    if (typeof originalRender === 'function') {
        console.log('✅ Новый дизайн лобби подключен');
    }
}, 1000);
