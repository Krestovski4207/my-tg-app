// ==== АДМИН-ПАНЕЛЬ (без SVG, без эмодзи) ====
let adminStats = null;

async function checkAdminAccess() {
    if (!tgUser) return false;
    try {
        const res = await apiGet('/api/admin/check?tg_id=' + tgUser.id);
        return res.is_admin === true;
    } catch (e) {
        return false;
    }
}

async function initAdmin() {
    const tryShow = async () => {
        const hasAccess = await checkAdminAccess();
        if (!hasAccess) return;
        const tab = document.querySelector('.tab-btn.admin-tab');
        if (tab) tab.style.display = 'flex';
    };
    await tryShow();
    setInterval(tryShow, 3000);
}

async function loadAdminHome() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        adminStats = await apiGet('/api/admin/stats?tg_id=' + tgUser.id);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        return;
    }
    container.innerHTML = `
        <div class="section-head centered"><div class="section-title">Админ-панель</div></div>
        <div class="admin-stats">
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.users}</div><div class="admin-stat-label">Игроков</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.matches}</div><div class="admin-stat-label">Матчей</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.clans}</div><div class="admin-stat-label">Кланов</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.tickets}</div><div class="admin-stat-label">Тикетов</div></div>
            <div class="admin-stat-card"><div class="admin-stat-value">${adminStats.active_24h}</div><div class="admin-stat-label">Активных 24ч</div></div>
        </div>
        <div class="section-head centered"><div class="section-title">Разделы</div></div>
        <div class="admin-grid">
            <button class="admin-tile" data-action="users"><span>Игроки</span></button>
            <button class="admin-tile" data-action="clans"><span>Кланы</span></button>
            <button class="admin-tile" data-action="tournaments"><span>Турниры</span></button>
            <button class="admin-tile" data-action="chats"><span>Чаты</span></button>
            <button class="admin-tile" data-action="tickets"><span>Тикеты</span></button>
            <button class="admin-tile" data-action="logs"><span>Логи</span></button>
            <button class="admin-tile" data-action="promos"><span>Промокоды</span></button>
            <button class="admin-tile" data-action="seasons"><span>Сезоны</span></button>
            <button class="admin-tile" data-action="admins"><span>Админы</span></button>
        </div>
    `;
    container.querySelectorAll('.admin-tile').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'users') showAdminUsers();
            else if (action === 'clans') showAdminClans();
            else if (action === 'tournaments' && typeof showAdminTournaments === 'function') showAdminTournaments();
            else if (action === 'chats') showAdminChats();
            else if (action === 'tickets') showAdminTickets();
            else if (action === 'logs') showAdminLogs();
            else if (action === 'promos') showAdminPromos();
            else if (action === 'seasons') showAdminSeasons();
            else if (action === 'admins') showAdminAdmins();
        });
    });
}

// ==== ИГРОКИ ====
async function showAdminUsers() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Игроки</div><div style="width:60px;"></div></div>
        <div class="search-wrap"><span class="search-icon">🔍</span><input type="text" class="search-input" id="admin-user-search" placeholder="Ник / ID / player_id..." autocomplete="off"></div>
        <div id="admin-user-results"><div class="map-empty">Введи запрос</div></div>
    `;
    document.getElementById('admin-back').addEventListener('click', loadAdminHome);
    const input = document.getElementById('admin-user-search');
    let t = null;
    input.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => doAdminUserSearch(input.value.trim()), 300); });
    input.focus();
}

function userFlags(u) {
    let html = '';
    if (u.is_banned) html += `<span class="adm-flag ban">BAN</span>`;
    if (u.is_verified) html += `<span class="adm-flag ok">V</span>`;
    if (u.is_vip) html += `<span class="adm-flag vip">VIP</span>`;
    if (u.is_pro) html += `<span class="adm-flag pro">PRO</span>`;
    return html;
}

async function doAdminUserSearch(q) {
    const container = document.getElementById('admin-user-results');
    if (!container) return;
    if (!q) { container.innerHTML = '<div class="map-empty">Введи запрос</div>'; return; }
    container.innerHTML = '<div class="map-empty">Поиск...</div>';
    try {
        const users = await apiGet('/api/admin/user/search?tg_id=' + tgUser.id + '&q=' + encodeURIComponent(q));
        if (!users || users.length === 0) { container.innerHTML = '<div class="map-empty">Никого не найдено</div>'; return; }
        let html = '';
        users.forEach(u => {
            const av = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
            const at = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();
            html += `<div class="admin-user-card" data-uid="${u.user_id}"><div class="admin-user-avatar" ${av}>${at}</div><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(u.nickname || '—')} ${userFlags(u)}</div><div class="admin-user-sub">ID: ${u.user_id} · ELO ${u.elo} · ${u.coins || 0}</div></div></div>`;
        });
        container.innerHTML = html;
        container.querySelectorAll('.admin-user-card').forEach(c => c.addEventListener('click', () => showAdminUserEdit(parseInt(c.dataset.uid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка поиска</div>'; }
}

async function showAdminUserEdit(userId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    let u;
    try { u = await apiGet('/api/admin/user/get?tg_id=' + tgUser.id + '&target_id=' + userId); }
    catch (e) { container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>'; return; }
    const av = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
    const at = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-user-back">← Назад</button><div class="section-title">Редактирование</div><div style="width:60px;"></div></div>
        <div class="admin-user-header">
            <div class="admin-user-avatar big" ${av}>${at}</div>
            <div class="admin-user-nick big">${escapeHtml(u.nickname || '—')}</div>
            <div class="admin-user-sub">ID: ${u.user_id} · ${escapeHtml(u.player_id || '—')}</div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">Коины</div>
            <div class="admin-row"><div class="admin-value" id="admin-coins-value">${u.coins || 0}</div></div>
            <div class="admin-row">
                <button class="admin-btn" data-coins="100">+100</button>
                <button class="admin-btn" data-coins="1000">+1000</button>
                <button class="admin-btn" data-coins="10000">+10k</button>
                <button class="admin-btn danger" data-coins="-1000">-1000</button>
            </div>
            <div class="admin-row"><input type="number" class="admin-input" id="admin-coins-input" placeholder="Своё число"><button class="admin-btn primary" id="admin-coins-custom">Выдать</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">ELO</div>
            <div class="admin-row"><div class="admin-value" id="admin-elo-value">${u.elo}</div></div>
            <div class="admin-row"><input type="number" class="admin-input" id="admin-elo-input" placeholder="Новое ELO" value="${u.elo}"><button class="admin-btn primary" id="admin-elo-set">Установить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">Статусы</div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_verified ? 'active' : ''}" data-flag="verified">Галочка</button><button class="admin-btn flag-btn ${u.is_vip ? 'active' : ''}" data-flag="vip">VIP</button></div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_pro ? 'active' : ''}" data-flag="pro">PRO</button><button class="admin-btn flag-btn ${u.is_media ? 'active' : ''}" data-flag="media">Media</button></div>
            <div class="admin-row"><button class="admin-btn flag-btn ${u.is_gal ? 'active' : ''}" data-flag="gal">GAL</button><button class="admin-btn flag-btn ${u.is_banned ? 'active danger' : ''}" data-flag="banned">Бан</button></div>
        </div>
    `;
    document.getElementById('admin-user-back').addEventListener('click', showAdminUsers);
    container.querySelectorAll('[data-coins]').forEach(btn => btn.addEventListener('click', () => adminGiveCoins(userId, parseInt(btn.dataset.coins))));
    document.getElementById('admin-coins-custom').addEventListener('click', () => {
        const v = document.getElementById('admin-coins-input').value.trim();
        if (!v) return showToast('Введи число');
        adminGiveCoins(userId, parseInt(v));
    });
    document.getElementById('admin-elo-set').addEventListener('click', () => {
        const v = document.getElementById('admin-elo-input').value.trim();
        if (!v) return showToast('Введи ELO');
        adminSetElo(userId, parseInt(v));
    });
    container.querySelectorAll('.flag-btn').forEach(btn => btn.addEventListener('click', () => {
        const flag = btn.dataset.flag;
        const wasActive = btn.classList.contains('active');
        adminSetFlag(userId, flag, !wasActive);
    }));
}

async function adminGiveCoins(targetId, amount) {
    try {
        const res = await apiPost('/api/admin/user/give_coins', { admin_id: tgUser.id, target_id: targetId, amount });
        if (res.error) return showToast(res.error);
        const el = document.getElementById('admin-coins-value');
        if (el) el.textContent = res.coins;
        showToast((amount >= 0 ? '+' : '') + amount);
    } catch (e) { showToast('Ошибка'); }
}

async function adminSetElo(targetId, elo) {
    try {
        const res = await apiPost('/api/admin/user/set_elo', { admin_id: tgUser.id, target_id: targetId, elo });
        if (res.error) return showToast(res.error);
        const el = document.getElementById('admin-elo-value');
        if (el) el.textContent = elo;
        showToast('ELO: ' + elo);
    } catch (e) { showToast('Ошибка'); }
}

async function adminSetFlag(targetId, flag, value) {
    try {
        const res = await apiPost('/api/admin/user/set_flag', { admin_id: tgUser.id, target_id: targetId, flag, value: value ? 1 : 0 });
        if (res.error) return showToast(res.error);
        showToast((value ? 'Включено: ' : 'Отключено: ') + flag);
        const btn = document.querySelector(`.flag-btn[data-flag="${flag}"]`);
        if (btn) {
            btn.classList.toggle('active', value);
            if (flag === 'banned' && value) btn.classList.add('danger');
            else if (flag === 'banned') btn.classList.remove('danger');
        }
    } catch (e) { showToast('Ошибка'); }
}

// ==== КЛАНЫ ====
async function showAdminClans() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const clans = await apiGet('/api/admin/clans/list?tg_id=' + tgUser.id);
        if (!clans || clans.length === 0) {
            container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Кланы</div><div style="width:60px;"></div></div><div class="map-empty">Кланов нет</div>`;
            document.getElementById('admin-back').addEventListener('click', loadAdminHome);
            return;
        }
        let html = '';
        clans.forEach(c => {
            html += `<div class="admin-user-card" data-clan-id="${c.clan_id}"><div class="admin-user-info"><div class="admin-user-nick">[${escapeHtml(c.tag)}] ${escapeHtml(c.name)}</div><div class="admin-user-sub">${c.members_count} участников · Лидер: ${escapeHtml(c.creator_nick || '—')}</div></div></div>`;
        });
        container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Кланы (${clans.length})</div><div style="width:60px;"></div></div><div>${html}</div>`;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        container.querySelectorAll('[data-clan-id]').forEach(c => c.addEventListener('click', () => showAdminClanEdit(parseInt(c.dataset.clanId))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function showAdminClanEdit(clanId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    let data;
    try { data = await apiGet('/api/admin/clan/get?tg_id=' + tgUser.id + '&clan_id=' + clanId); }
    catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; return; }
    const c = data.clan;
    const members = data.members || [];
    let mHtml = '';
    members.forEach(m => {
        const roleText = m.role === 'leader' ? 'Лидер' : (m.role === 'co_leader' ? 'Солидер' : 'Участник');
        mHtml += `<div class="admin-user-card" data-uid="${m.user_id}"><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(m.nickname)}</div><div class="admin-user-sub">${roleText} · ELO ${m.elo}</div></div></div>`;
    });
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-clan-back">← Назад</button><div class="section-title">Редактирование</div><div style="width:60px;"></div></div>
        <div class="admin-section">
            <div class="admin-section-title">Основное</div>
            <div class="admin-row"><input type="text" class="admin-input" id="adm-clan-name" placeholder="Название" value="${escapeHtml(c.name)}" maxlength="24"></div>
            <div class="admin-row"><input type="text" class="admin-input" id="adm-clan-tag" placeholder="Тег" value="${escapeHtml(c.tag)}" maxlength="5"></div>
            <div class="admin-row"><textarea class="admin-input" id="adm-clan-desc" placeholder="Описание" rows="2" maxlength="150" style="resize:none;">${escapeHtml(c.description || '')}</textarea></div>
            <div class="admin-row"><button class="admin-btn primary" id="adm-clan-save">Сохранить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">Лидер</div>
            <div class="admin-row"><input type="number" class="admin-input" id="adm-clan-new-leader" placeholder="ID нового лидера"><button class="admin-btn primary" id="adm-clan-leader-btn">Назначить</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">Действия</div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-clan-clear-chat">Очистить чат</button></div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-clan-delete">Удалить клан</button></div>
        </div>
        <div class="section-head centered"><div class="section-title">Состав (${members.length})</div></div>
        <div>${mHtml}</div>
    `;
    document.getElementById('admin-clan-back').addEventListener('click', showAdminClans);
    document.getElementById('adm-clan-save').addEventListener('click', async () => {
        const name = document.getElementById('adm-clan-name').value.trim();
        const tag = document.getElementById('adm-clan-tag').value.trim();
        const description = document.getElementById('adm-clan-desc').value.trim();
        try {
            const res = await apiPost('/api/admin/clan/edit', { admin_id: tgUser.id, clan_id: clanId, name, tag, description });
            if (res.error) return showToast(res.error);
            showToast('Сохранено');
        } catch (e) { showToast('Ошибка'); }
    });
    document.getElementById('adm-clan-leader-btn').addEventListener('click', async () => {
        const v = document.getElementById('adm-clan-new-leader').value.trim();
        if (!v) return showToast('Введи ID');
        try {
            const res = await apiPost('/api/admin/clan/set_leader', { admin_id: tgUser.id, clan_id: clanId, new_leader_id: parseInt(v) });
            if (res.error) return showToast(res.error);
            showToast('Лидер обновлён');
            showAdminClanEdit(clanId);
        } catch (e) { showToast('Ошибка'); }
    });
    document.getElementById('adm-clan-clear-chat').addEventListener('click', async () => {
        if (!confirm('Удалить все сообщения клана?')) return;
        try {
            const res = await apiPost('/api/admin/clan/clear_chat', { admin_id: tgUser.id, clan_id: clanId });
            if (res.error) return showToast(res.error);
            showToast('Очищено');
        } catch (e) { showToast('Ошибка'); }
    });
    document.getElementById('adm-clan-delete').addEventListener('click', async () => {
        if (!confirm('Удалить клан?') || !confirm('Точно?')) return;
        try {
            const res = await apiPost('/api/admin/clan/delete', { admin_id: tgUser.id, clan_id: clanId });
            if (res.error) return showToast(res.error);
            showToast('Удалено');
            showAdminClans();
        } catch (e) { showToast('Ошибка'); }
    });
    container.querySelectorAll('[data-uid]').forEach(el => el.addEventListener('click', () => showAdminUserEdit(parseInt(el.dataset.uid))));
}

// ==== ЧАТЫ ====
async function showAdminChats() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Чаты</div><div style="width:60px;"></div></div>
        <div class="admin-section">
            <div class="admin-section-title">Глобальный чат</div>
            <div class="admin-row"><button class="admin-btn" id="adm-gchat-view">Открыть</button></div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-gchat-24">За 24 часа</button><button class="admin-btn danger" id="adm-gchat-all">Очистить всё</button></div>
        </div>
        <div class="admin-section">
            <div class="admin-section-title">Чаты кланов</div>
            <div class="admin-row"><button class="admin-btn danger" id="adm-cchat-24">За 24 часа</button><button class="admin-btn danger" id="adm-cchat-all">Очистить все</button></div>
        </div>
    `;
    document.getElementById('admin-back').addEventListener('click', loadAdminHome);
    document.getElementById('adm-gchat-view').addEventListener('click', showAdminGlobalChatView);
    document.getElementById('adm-gchat-24').addEventListener('click', async () => { if (confirm('Удалить за 24ч?')) adminClearGlobalChat('24h'); });
    document.getElementById('adm-gchat-all').addEventListener('click', async () => { if (confirm('Удалить всё?') && confirm('Точно?')) adminClearGlobalChat('all'); });
    document.getElementById('adm-cchat-24').addEventListener('click', async () => { if (confirm('Удалить за 24ч?')) adminClearClanChats('24h'); });
    document.getElementById('adm-cchat-all').addEventListener('click', async () => { if (confirm('Удалить всё?') && confirm('Точно?')) adminClearClanChats('all'); });
}

async function adminClearGlobalChat(mode) {
    try {
        const res = await apiPost('/api/admin/chat/global/clear', { admin_id: tgUser.id, mode });
        if (res.error) return showToast(res.error);
        showToast('Удалено: ' + res.deleted);
    } catch (e) { showToast('Ошибка'); }
}

async function adminClearClanChats(mode) {
    try {
        const res = await apiPost('/api/admin/chat/clans/clear', { admin_id: tgUser.id, mode });
        if (res.error) return showToast(res.error);
        showToast('Удалено: ' + res.deleted);
    } catch (e) { showToast('Ошибка'); }
}

async function showAdminGlobalChatView() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const msgs = await apiGet('/api/admin/chat/global?tg_id=' + tgUser.id + '&limit=100');
        if (!msgs || msgs.length === 0) {
            container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Глобал</div><div style="width:60px;"></div></div><div class="map-empty">Нет</div>`;
            document.getElementById('admin-back').addEventListener('click', showAdminChats);
            return;
        }
        let html = '';
        msgs.forEach(m => {
            const time = (m.created_at || '').substring(5, 16);
            const cls = m.is_deleted ? 'chat-deleted' : '';
            html += `<div class="admin-msg ${cls}" data-mid="${m.id}"><div class="admin-msg-head"><b>${escapeHtml(m.nickname || '—')}</b><span class="admin-msg-time">${time}</span></div><div class="admin-msg-text">${escapeHtml(m.message)}</div>${m.is_deleted ? '<div class="admin-msg-del">удалено</div>' : ''}</div>`;
        });
        container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Глобал (${msgs.length})</div><div style="width:60px;"></div></div><div class="admin-msgs">${html}</div>`;
        document.getElementById('admin-back').addEventListener('click', showAdminChats);
        container.querySelectorAll('.admin-msg[data-mid]').forEach(el => {
            el.addEventListener('dblclick', () => adminDeleteGlobalMsg(parseInt(el.dataset.mid)));
            el.addEventListener('contextmenu', (e) => { e.preventDefault(); adminDeleteGlobalMsg(parseInt(el.dataset.mid)); });
        });
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function adminDeleteGlobalMsg(mid) {
    if (!confirm('Удалить сообщение?')) return;
    try {
        const res = await apiPost('/api/admin/chat/global/delete', { admin_id: tgUser.id, message_id: mid });
        if (res.error) return showToast(res.error);
        showToast('Удалено');
        showAdminGlobalChatView();
    } catch (e) { showToast('Ошибка'); }
}

// ==== ТИКЕТЫ ====
async function showAdminTickets() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const tickets = await apiGet('/api/admin/tickets/list?tg_id=' + tgUser.id + '&status=all');
        if (!tickets || tickets.length === 0) {
            container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Тикеты</div><div style="width:60px;"></div></div><div class="map-empty">Нет</div>`;
            document.getElementById('admin-back').addEventListener('click', loadAdminHome);
            return;
        }
        let html = '';
        tickets.forEach(t => {
            const statusCls = t.status === 'new' ? 'new' : 'replied';
            const statusText = t.status === 'new' ? 'НОВЫЙ' : 'ОТВЕЧЕН';
            const time = (t.created_at || '').substring(5, 16);
            html += `<div class="admin-ticket-card ${statusCls}" data-tid="${t.id}"><div class="admin-ticket-head"><div class="admin-ticket-topic">${escapeHtml(t.topic || '—')}</div><div class="admin-ticket-status ${statusCls}">${statusText}</div></div><div class="admin-ticket-meta">#${t.id} · ${escapeHtml(t.first_name || '—')} · ${time}</div><div class="admin-ticket-msg">${escapeHtml(t.message || '—')}</div>${t.admin_reply ? `<div class="admin-ticket-reply">${escapeHtml(t.admin_reply)}</div>` : ''}</div>`;
        });
        container.innerHTML = `<div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Тикеты (${tickets.length})</div><div style="width:60px;"></div></div><div>${html}</div>`;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        container.querySelectorAll('[data-tid]').forEach(c => c.addEventListener('click', () => showAdminTicketReply(parseInt(c.dataset.tid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function showAdminTicketReply(ticketId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    let t;
    try {
        const list = await apiGet('/api/admin/tickets/list?tg_id=' + tgUser.id + '&status=all');
        t = (list || []).find(x => x.id === ticketId);
        if (!t) throw new Error('not found');
    } catch (e) { container.innerHTML = '<div class="map-empty">Не найден</div>'; return; }
    container.innerHTML = `
        <div class="section-head"><button class="section-btn" id="admin-back-tk">← Назад</button><div class="section-title">#${t.id}</div><div style="width:60px;"></div></div>
        <div class="admin-section"><div class="admin-section-title">Тема</div><div class="admin-value" style="font-size:15px;">${escapeHtml(t.topic || '—')}</div></div>
        <div class="admin-section"><div class="admin-section-title">От</div><div class="admin-user-sub" style="font-size:12px;">${escapeHtml(t.first_name || '—')} · @${escapeHtml(t.username || '—')} · ID ${t.user_id}</div></div>
        <div class="admin-section"><div class="admin-section-title">Сообщение</div><div class="admin-ticket-msg">${escapeHtml(t.message || '—')}</div></div>
        <div class="admin-section">
            <div class="admin-section-title">Ответ</div>
            <textarea class="admin-input" id="adm-tk-reply" rows="4" maxlength="800" placeholder="Напиши ответ..." style="resize:none;">${escapeHtml(t.admin_reply || '')}</textarea>
            <div class="admin-row" style="margin-top:10px;">
                <button class="admin-btn primary" id="adm-tk-send">Отправить</button>
                <button class="admin-btn danger" id="adm-tk-delete">Удалить</button>
            </div>
        </div>
    `;
    document.getElementById('admin-back-tk').addEventListener('click', showAdminTickets);
    document.getElementById('adm-tk-send').addEventListener('click', async () => {
        const v = document.getElementById('adm-tk-reply').value.trim();
        if (!v) return showToast('Напиши ответ');
        try {
            const res = await apiPost('/api/admin/ticket/reply', { admin_id: tgUser.id, ticket_id: t.id, reply: v });
            if (res.error) return showToast(res.error);
            showToast('Отправлено');
            showAdminTickets();
        } catch (e) { showToast('Ошибка'); }
    });
    document.getElementById('adm-tk-delete').addEventListener('click', async () => {
        if (!confirm('Удалить тикет?')) return;
        try {
            const res = await apiPost('/api/admin/ticket/delete', { admin_id: tgUser.id, ticket_id: t.id });
            if (res.error) return showToast(res.error);
            showToast('Удалено');
            showAdminTickets();
        } catch (e) { showToast('Ошибка'); }
    });
}

// ==== ЛОГИ ====
async function showAdminLogs() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const logs = await apiGet('/api/admin/logs?tg_id=' + tgUser.id + '&limit=100');
        let listHtml = '';
        if (!logs || logs.length === 0) {
            listHtml = '<div class="map-empty">Логов пока нет</div>';
        } else {
            logs.forEach(l => {
                const time = (l.created_at || '').substring(5, 16);
                const target = l.target_id ? ` → ID ${l.target_id}` : '';
                listHtml += `<div class="admin-log-item"><div class="admin-log-head"><span class="admin-log-action">${escapeHtml(l.action)}</span><span class="admin-log-time">${time}</span></div><div class="admin-log-body">${escapeHtml(l.admin_nick || 'ID ' + l.admin_id)}${target}</div>${l.details ? `<div class="admin-log-details">${escapeHtml(l.details)}</div>` : ''}</div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Логи (${logs ? logs.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-row" style="margin-bottom:14px;"><button class="admin-btn danger" id="adm-logs-clear">Очистить логи</button></div>
            <div class="admin-msgs">${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-logs-clear').addEventListener('click', async () => {
            if (!confirm('Очистить все логи?')) return;
            try {
                const res = await apiPost('/api/admin/logs/clear', { admin_id: tgUser.id });
                if (res.error) return showToast(res.error);
                showToast('Удалено: ' + res.deleted);
                showAdminLogs();
            } catch (e) { showToast('Ошибка'); }
        });
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

// ==== ПРОМОКОДЫ ====
async function showAdminPromos() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const promos = await apiGet('/api/admin/promos/list?tg_id=' + tgUser.id);
        let listHtml = '';
        if (!promos || promos.length === 0) {
            listHtml = '<div class="map-empty">Промокодов нет</div>';
        } else {
            promos.forEach(p => {
                const active = p.is_active ? 'active' : '';
                const statusText = p.is_active ? 'Активен' : 'Выключен';
                const rewardText = formatReward(p.reward_type, p.reward_value);
                listHtml += `<div class="admin-promo-card ${active}" data-pid="${p.id}"><div class="admin-promo-head"><div class="admin-promo-code">${escapeHtml(p.code)}</div><div class="admin-promo-status">${statusText}</div></div><div class="admin-promo-meta">${rewardText} · Использован: ${p.uses || 0}/${p.max_uses || '∞'}</div></div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Промокоды (${promos ? promos.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">Создать</div>
                <div class="admin-row"><input type="text" class="admin-input" id="adm-promo-code" placeholder="КОД" maxlength="20" style="text-transform:uppercase;"></div>
                <div class="admin-row">
                    <select class="admin-input" id="adm-promo-type">
                        <option value="coins">Коины</option>
                        <option value="vip">VIP</option>
                        <option value="elo">ELO</option>
                    </select>
                    <input type="number" class="admin-input" id="adm-promo-value" placeholder="Значение">
                </div>
                <div class="admin-row">
                    <input type="number" class="admin-input" id="adm-promo-uses" placeholder="Макс. использований" value="1">
                    <button class="admin-btn primary" id="adm-promo-create">Создать</button>
                </div>
            </div>
            <div class="section-head centered"><div class="section-title">Список</div></div>
            <div>${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-promo-create').addEventListener('click', async () => {
            const code = document.getElementById('adm-promo-code').value.trim().toUpperCase();
            const reward_type = document.getElementById('adm-promo-type').value;
            const reward_value = document.getElementById('adm-promo-value').value.trim();
            const max_uses = document.getElementById('adm-promo-uses').value.trim() || '1';
            if (!code) return showToast('Введи код');
            if (!reward_value) return showToast('Введи значение');
            try {
                const res = await apiPost('/api/admin/promo/create', { admin_id: tgUser.id, code, reward_type, reward_value: parseInt(reward_value), max_uses: parseInt(max_uses) });
                if (res.error) return showToast(res.error);
                showToast('Создан');
                showAdminPromos();
            } catch (e) { showToast('Ошибка'); }
        });
        container.querySelectorAll('.admin-promo-card[data-pid]').forEach(el => {
            el.addEventListener('click', () => showAdminPromoActions(parseInt(el.dataset.pid)));
            el.addEventListener('contextmenu', (e) => { e.preventDefault(); showAdminPromoActions(parseInt(el.dataset.pid)); });
        });
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

function formatReward(type, value) {
    if (type === 'coins') return value + ' коинов';
    if (type === 'vip') return 'VIP на ' + value + ' дн.';
    if (type === 'elo') return '+' + value + ' ELO';
    return type + ' = ' + value;
}

async function showAdminPromoActions(promoId) {
    const action = prompt('Что сделать?\n1 = Вкл/выкл\n2 = Удалить');
    if (!action) return;
    if (action === '1') {
        try {
            const res = await apiPost('/api/admin/promo/toggle', { admin_id: tgUser.id, promo_id: promoId });
            if (res.error) return showToast(res.error);
            showToast(res.is_active ? 'Включён' : 'Выключен');
            showAdminPromos();
        } catch (e) { showToast('Ошибка'); }
    } else if (action === '2') {
        if (!confirm('Удалить промокод?')) return;
        try {
            const res = await apiPost('/api/admin/promo/delete', { admin_id: tgUser.id, promo_id: promoId });
            if (res.error) return showToast(res.error);
            showToast('Удалён');
            showAdminPromos();
        } catch (e) { showToast('Ошибка'); }
    }
}

// ==== СЕЗОНЫ ====
async function showAdminSeasons() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const seasons = await apiGet('/api/admin/seasons/list?tg_id=' + tgUser.id);
        let listHtml = '';
        if (!seasons || seasons.length === 0) {
            listHtml = '<div class="map-empty">Сезонов нет</div>';
        } else {
            seasons.forEach(s => {
                const isActive = s.is_active;
                const cls = isActive ? 'active' : '';
                const statusText = isActive ? 'Активен' : 'Завершён';
                const start = (s.start_date || '').substring(0, 16);
                const end = s.end_date ? (s.end_date || '').substring(0, 16) : '—';
                listHtml += `<div class="admin-season-card ${cls}" data-sid="${s.id}"><div class="admin-season-head"><div class="admin-season-name">${escapeHtml(s.name)}</div><div class="admin-season-status">${statusText}</div></div><div class="admin-season-meta">${start} → ${end} · ${s.players_count || 0} участников</div></div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Сезоны (${seasons ? seasons.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">Создать новый сезон</div>
                <div class="admin-row"><input type="text" class="admin-input" id="adm-season-name" placeholder="Название (Сезон 2)" maxlength="40"><button class="admin-btn primary" id="adm-season-create">Создать</button></div>
                <div style="font-size:11px;color:#9187b8;padding:6px 2px;">Текущий активный сезон будет завершён.</div>
            </div>
            <div class="section-head centered"><div class="section-title">Список</div></div>
            <div>${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-season-create').addEventListener('click', async () => {
            const name = document.getElementById('adm-season-name').value.trim();
            if (!name) return showToast('Введи название');
            if (!confirm('Создать новый сезон? Текущий будет завершён.')) return;
            try {
                const res = await apiPost('/api/admin/season/create', { admin_id: tgUser.id, name });
                if (res.error) return showToast(res.error);
                showToast('Создан');
                showAdminSeasons();
            } catch (e) { showToast('Ошибка'); }
        });
        container.querySelectorAll('.admin-season-card[data-sid]').forEach(el => el.addEventListener('click', () => showAdminSeasonDetail(parseInt(el.dataset.sid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function showAdminSeasonDetail(seasonId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const seasons = await apiGet('/api/admin/seasons/list?tg_id=' + tgUser.id);
        const s = (seasons || []).find(x => x.id === seasonId);
        if (!s) throw new Error('not found');
        const stats = await apiGet('/api/admin/season/stats?tg_id=' + tgUser.id + '&season_id=' + seasonId + '&limit=50');
        const isActive = s.is_active;
        let statsHtml = '';
        if (!stats || stats.length === 0) {
            statsHtml = '<div class="map-empty">Нет данных за сезон</div>';
        } else {
            stats.forEach((p, i) => {
                let medal = '#' + (i + 1);
                if (i === 0) medal = '1st';
                else if (i === 1) medal = '2nd';
                else if (i === 2) medal = '3rd';
                statsHtml += `<div class="admin-user-card" data-uid="${p.user_id}"><div class="admin-user-avatar">${medal}</div><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(p.nickname || '—')}</div><div class="admin-user-sub">ELO ${p.elo} · ${p.wins || 0}W / ${p.losses || 0}L</div></div></div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-season-back">← Назад</button><div class="section-title">${escapeHtml(s.name)}</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">Информация</div>
                <div class="admin-row"><div class="admin-value" style="font-size:14px;">${isActive ? 'Активен' : 'Завершён'}</div></div>
                <div class="admin-user-sub" style="padding:6px 2px;">Начат: ${(s.start_date || '').substring(0, 16)}<br>${s.end_date ? 'Закончен: ' + (s.end_date || '').substring(0, 16) : 'Не завершён'}<br>Участников: ${s.players_count || 0}</div>
            </div>
            <div class="admin-section">
                <div class="admin-section-title">Действия</div>
                ${isActive ? `<div class="admin-row"><button class="admin-btn danger" id="adm-season-end">Завершить сезон</button></div>` : `<div class="admin-row"><button class="admin-btn primary" id="adm-season-activate">Сделать активным</button></div>`}
                <div class="admin-row"><button class="admin-btn danger" id="adm-season-delete">Удалить сезон</button></div>
            </div>
            <div class="section-head centered"><div class="section-title">Топ игроков (${stats ? stats.length : 0})</div></div>
            <div>${statsHtml}</div>
        `;
        document.getElementById('admin-season-back').addEventListener('click', showAdminSeasons);
        const endBtn = document.getElementById('adm-season-end');
        if (endBtn) endBtn.addEventListener('click', async () => {
            if (!confirm('Завершить сезон?')) return;
            try {
                const res = await apiPost('/api/admin/season/end', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast(res.error);
                showToast('Завершён');
                showAdminSeasonDetail(seasonId);
            } catch (e) { showToast('Ошибка'); }
        });
        const actBtn = document.getElementById('adm-season-activate');
        if (actBtn) actBtn.addEventListener('click', async () => {
            if (!confirm('Активировать этот сезон? Текущий будет завершён.')) return;
            try {
                const res = await apiPost('/api/admin/season/activate', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast(res.error);
                showToast('Активирован');
                showAdminSeasonDetail(seasonId);
            } catch (e) { showToast('Ошибка'); }
        });
        document.getElementById('adm-season-delete').addEventListener('click', async () => {
            if (!confirm('Удалить сезон?') || !confirm('Точно?')) return;
            try {
                const res = await apiPost('/api/admin/season/delete', { admin_id: tgUser.id, season_id: seasonId });
                if (res.error) return showToast(res.error);
                showToast('Удалён');
                showAdminSeasons();
            } catch (e) { showToast('Ошибка'); }
        });
        container.querySelectorAll('[data-uid]').forEach(el => el.addEventListener('click', () => showAdminUserEdit(parseInt(el.dataset.uid))));
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

// ==== АДМИНЫ ====
async function showAdminAdmins() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const list = await apiGet('/api/admin/list?tg_id=' + tgUser.id);
        let listHtml = '';
        if (!list || list.length === 0) {
            listHtml = '<div class="map-empty">Админов нет</div>';
        } else {
            list.forEach(a => {
                const av = a.avatar_url ? 'style="background-image:url(' + a.avatar_url + ')"' : '';
                const at = a.avatar_url ? '' : (a.nickname || '?').charAt(0).toUpperCase();
                const superMark = a.is_super ? ' SUPER' : '';
                const removeBtn = a.is_super ? '' : `<button class="admin-btn danger" data-remove="${a.user_id}" style="flex:0 0 auto;padding:8px 12px;font-size:12px;">X</button>`;
                listHtml += `<div class="admin-user-card" style="cursor:default;"><div class="admin-user-avatar" ${av}>${at}</div><div class="admin-user-info"><div class="admin-user-nick">${escapeHtml(a.nickname || 'ID ' + a.user_id)}${superMark}</div><div class="admin-user-sub">ID: ${a.user_id}</div></div>${removeBtn}</div>`;
            });
        }
        container.innerHTML = `
            <div class="section-head"><button class="section-btn" id="admin-back">← Назад</button><div class="section-title">Админы (${list ? list.length : 0})</div><div style="width:60px;"></div></div>
            <div class="admin-section">
                <div class="admin-section-title">Выдать админку</div>
                <div class="admin-row"><input type="number" class="admin-input" id="adm-new-admin-id" placeholder="Telegram ID игрока"><button class="admin-btn primary" id="adm-add-admin">Выдать</button></div>
                <div style="font-size:11px;color:#9187b8;padding:6px 2px;">ID можно узнать из профиля игрока.</div>
            </div>
            <div class="section-head centered"><div class="section-title">Список</div></div>
            <div>${listHtml}</div>
        `;
        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        document.getElementById('adm-add-admin').addEventListener('click', async () => {
            const v = document.getElementById('adm-new-admin-id').value.trim();
            if (!v) return showToast('Введи ID');
            if (!confirm('Выдать админку игроку ' + v + '?')) return;
            try {
                const res = await apiPost('/api/admin/add', { tg_id: tgUser.id, target_id: parseInt(v) });
                if (res.error) return showToast(res.error);
                showToast('Админка выдана');
                showAdminAdmins();
            } catch (e) { showToast('Ошибка'); }
        });
        container.querySelectorAll('[data-remove]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const targetId = parseInt(btn.dataset.remove);
                if (!confirm('Забрать админку у ' + targetId + '?')) return;
                try {
                    const res = await apiPost('/api/admin/remove', { tg_id: tgUser.id, target_id: targetId });
                    if (res.error) return showToast(res.error);
                    showToast('Админка забрана');
                    showAdminAdmins();
                } catch (e) { showToast('Ошибка'); }
            });
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

// Алиас для main-start.js
async function loadAdmin() {
    return loadAdminHome();
}
