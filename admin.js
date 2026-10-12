// ==== АДМИН-ПАНЕЛЬ ====
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
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) return;

    const tab = document.querySelector('.tab-btn.admin-tab');
    if (tab) tab.style.display = 'flex';

    loadAdminHome();
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
        <div class="section-head centered">
            <div class="section-title">⚙️ Админ-панель</div>
        </div>

        <div class="admin-stats">
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.users}</div>
                <div class="admin-stat-label">Игроков</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.matches}</div>
                <div class="admin-stat-label">Матчей</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.clans}</div>
                <div class="admin-stat-label">Кланов</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.tickets}</div>
                <div class="admin-stat-label">Тикетов</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.active_24h}</div>
                <div class="admin-stat-label">Активных 24ч</div>
            </div>
        </div>

        <div class="section-head centered">
            <div class="section-title">Разделы</div>
        </div>

        <div class="admin-grid">
            <button class="admin-tile" data-action="users">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="8" r="4"/>
                    <path d="M2 21c0-4 3.5-6 7-6s7 2 7 6"/>
                    <circle cx="18" cy="9" r="2.5"/>
                    <path d="M15.5 21c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4"/>
                </svg>
                <span>Игроки</span>
            </button>

            <button class="admin-tile" data-action="clans">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/>
                </svg>
                <span>Кланы</span>
            </button>

            <button class="admin-tile" data-action="chats">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a8 8 0 0 1-8 8H6l-3 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/>
                </svg>
                <span>Чаты</span>
            </button>

            <button class="admin-tile" data-action="tickets">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z"/>
                    <path d="M13 5v2M13 11v2M13 17v2"/>
                </svg>
                <span>Тикеты</span>
            </button>

            <button class="admin-tile" data-action="logs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                    <path d="M8 13h8M8 17h8M8 9h2"/>
                </svg>
                <span>Логи</span>
            </button>

            <button class="admin-tile" data-action="promos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 12a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4z"/>
                    <path d="M13 5v2M13 11v2M13 17v2"/>
                </svg>
                <span>Промокоды</span>
            </button>

            <button class="admin-tile" data-action="seasons">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <span>Сезоны</span>
            </button>
        </div>
    `;

    container.querySelectorAll('.admin-tile').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'users') showAdminUsers();
            else if (action === 'clans') showAdminClans();
            else if (action === 'chats') showAdminChats();
            else if (action === 'tickets') showAdminTickets();
            else if (action === 'logs') showAdminLogs();
            else if (action === 'promos') showAdminPromos();
            else if (action === 'seasons') showAdminSeasons();
            else showToast('⚠ Раздел в разработке');
        });
    });
}

// ==== ИГРОКИ ====
async function showAdminUsers() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="admin-back">← Назад</button>
            <div class="section-title">👥 Игроки</div>
            <div style="width:60px;"></div>
        </div>
        <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="admin-user-search" placeholder="Ник / ID / player_id..." autocomplete="off">
        </div>
        <div id="admin-user-results">
            <div class="map-empty">Введи запрос</div>
        </div>
    `;

    document.getElementById('admin-back').addEventListener('click', loadAdminHome);

    const input = document.getElementById('admin-user-search');
    let searchTimer = null;
    input.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => doAdminUserSearch(input.value.trim()), 300);
    });
    input.focus();
}

async function doAdminUserSearch(q) {
    const container = document.getElementById('admin-user-results');
    if (!container) return;

    if (!q) {
        container.innerHTML = '<div class="map-empty">Введи запрос</div>';
        return;
    }

    container.innerHTML = '<div class="map-empty">Поиск...</div>';

    try {
        const users = await apiGet('/api/admin/user/search?tg_id=' + tgUser.id + '&q=' + encodeURIComponent(q));
        if (!users || users.length === 0) {
            container.innerHTML = '<div class="map-empty">Никого не найдено</div>';
            return;
        }

        let html = '';
        users.forEach(u => {
            const avatarStyle = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
            const avatarText = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();
            const flags = [];
            if (u.is_banned) flags.push('🚫');
            if (u.is_verified) flags.push('✅');
            if (u.is_vip) flags.push('⭐');
            if (u.is_pro) flags.push('👑');

            html += `
                <div class="admin-user-card" data-uid="${u.user_id}">
                    <div class="admin-user-avatar" ${avatarStyle}>${avatarText}</div>
                    <div class="admin-user-info">
                        <div class="admin-user-nick">${escapeHtml(u.nickname || '—')} ${flags.join(' ')}</div>
                        <div class="admin-user-sub">ID: ${u.user_id} · ELO ${u.elo} · ${u.coins || 0} 🪙</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        container.querySelectorAll('.admin-user-card').forEach(card => {
            card.addEventListener('click', () => showAdminUserEdit(parseInt(card.dataset.uid)));
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка поиска</div>';
    }
}

async function showAdminUserEdit(userId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    let u;
    try {
        u = await apiGet('/api/admin/user/get?tg_id=' + tgUser.id + '&target_id=' + userId);
    } catch (e) {
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        return;
    }

    const avatarStyle = u.avatar_url ? 'style="background-image:url(' + u.avatar_url + ')"' : '';
    const avatarText = u.avatar_url ? '' : (u.nickname || '?').charAt(0).toUpperCase();

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="admin-user-back">← Назад</button>
            <div class="section-title">Редактирование</div>
            <div style="width:60px;"></div>
        </div>

        <div class="admin-user-header">
            <div class="admin-user-avatar big" ${avatarStyle}>${avatarText}</div>
            <div class="admin-user-nick big">${escapeHtml(u.nickname || '—')}</div>
            <div class="admin-user-sub">ID: ${u.user_id} · ${escapeHtml(u.player_id || '—')}</div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">💰 Коины</div>
            <div class="admin-row">
                <div class="admin-value" id="admin-coins-value">${u.coins || 0}</div>
            </div>
            <div class="admin-row">
                <button class="admin-btn" data-coins="100">+100</button>
                <button class="admin-btn" data-coins="1000">+1000</button>
                <button class="admin-btn" data-coins="10000">+10k</button>
                <button class="admin-btn danger" data-coins="-1000">-1000</button>
            </div>
            <div class="admin-row">
                <input type="number" class="admin-input" id="admin-coins-input" placeholder="Своё число">
                <button class="admin-btn primary" id="admin-coins-custom">💰 Выдать</button>
            </div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">🎯 ELO</div>
            <div class="admin-row">
                <div class="admin-value" id="admin-elo-value">${u.elo}</div>
            </div>
            <div class="admin-row">
                <input type="number" class="admin-input" id="admin-elo-input" placeholder="Новое ELO" value="${u.elo}">
                <button class="admin-btn primary" id="admin-elo-set">🎯 Установить</button>
            </div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">🏅 Статусы</div>
            <div class="admin-row">
                <button class="admin-btn flag-btn ${u.is_verified ? 'active' : ''}" data-flag="verified">✅ Галочка</button>
                <button class="admin-btn flag-btn ${u.is_vip ? 'active' : ''}" data-flag="vip">⭐ VIP</button>
            </div>
            <div class="admin-row">
                <button class="admin-btn flag-btn ${u.is_pro ? 'active' : ''}" data-flag="pro">👑 PRO</button>
                <button class="admin-btn flag-btn ${u.is_media ? 'active' : ''}" data-flag="media">📸 Media</button>
            </div>
            <div class="admin-row">
                <button class="admin-btn flag-btn ${u.is_gal ? 'active' : ''}" data-flag="gal">💎 GAL</button>
                <button class="admin-btn flag-btn ${u.is_banned ? 'active danger' : ''}" data-flag="banned">🚫 Бан</button>
            </div>
        </div>
    `;

    document.getElementById('admin-user-back').addEventListener('click', showAdminUsers);

    container.querySelectorAll('[data-coins]').forEach(btn => {
        btn.addEventListener('click', async () => {
            const amount = parseInt(btn.dataset.coins);
            await adminGiveCoins(userId, amount);
        });
    });

    document.getElementById('admin-coins-custom').addEventListener('click', async () => {
        const v = document.getElementById('admin-coins-input').value.trim();
        if (!v) return showToast('⚠ Введи число');
        await adminGiveCoins(userId, parseInt(v));
    });

    document.getElementById('admin-elo-set').addEventListener('click', async () => {
        const v = document.getElementById('admin-elo-input').value.trim();
        if (!v) return showToast('⚠ Введи ELO');
        await adminSetElo(userId, parseInt(v));
    });

    container.querySelectorAll('.flag-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const flag = btn.dataset.flag;
            const wasActive = btn.classList.contains('active');
            await adminSetFlag(userId, flag, !wasActive);
        });
    });
}

async function adminGiveCoins(targetId, amount) {
    try {
        const res = await apiPost('/api/admin/user/give_coins', {
            admin_id: tgUser.id,
            target_id: targetId,
            amount: amount
        });
        if (res.error) return showToast('⚠ ' + res.error);
        const el = document.getElementById('admin-coins-value');
        if (el) el.textContent = res.coins;
        showToast((amount >= 0 ? '+' : '') + amount + ' 🪙');
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

async function adminSetElo(targetId, elo) {
    try {
        const res = await apiPost('/api/admin/user/set_elo', {
            admin_id: tgUser.id,
            target_id: targetId,
            elo: elo
        });
        if (res.error) return showToast('⚠ ' + res.error);
        const el = document.getElementById('admin-elo-value');
        if (el) el.textContent = elo;
        showToast('✅ ELO: ' + elo);
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

async function adminSetFlag(targetId, flag, value) {
    try {
        const res = await apiPost('/api/admin/user/set_flag', {
            admin_id: tgUser.id,
            target_id: targetId,
            flag: flag,
            value: value ? 1 : 0
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast((value ? '✅ Включено: ' : '❌ Отключено: ') + flag);
        const btn = document.querySelector(`.flag-btn[data-flag="${flag}"]`);
        if (btn) {
            btn.classList.toggle('active', value);
            if (flag === 'banned' && value) btn.classList.add('danger');
            else if (flag === 'banned') btn.classList.remove('danger');
        }
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

// ==== КЛАНЫ ====
async function showAdminClans() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const clans = await apiGet('/api/admin/clans/list?tg_id=' + tgUser.id);

        if (!clans || clans.length === 0) {
            container.innerHTML = `
                <div class="section-head">
                    <button class="section-btn" id="admin-back">← Назад</button>
                    <div class="section-title">🛡 Кланы</div>
                    <div style="width:60px;"></div>
                </div>
                <div class="map-empty">Кланов нет</div>
            `;
            document.getElementById('admin-back').addEventListener('click', loadAdminHome);
            return;
        }

        let listHtml = '';
        clans.forEach(c => {
            listHtml += `
                <div class="admin-user-card" data-clan-id="${c.clan_id}">
                    <div class="admin-user-avatar">🛡</div>
                    <div class="admin-user-info">
                        <div class="admin-user-nick">[${escapeHtml(c.tag)}] ${escapeHtml(c.name)}</div>
                        <div class="admin-user-sub">${c.members_count} участников · Лидер: ${escapeHtml(c.creator_nick || '—')}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="section-head">
                <button class="section-btn" id="admin-back">← Назад</button>
                <div class="section-title">🛡 Кланы (${clans.length})</div>
                <div style="width:60px;"></div>
            </div>
            <div>${listHtml}</div>
        `;

        document.getElementById('admin-back').addEventListener('click', loadAdminHome);
        container.querySelectorAll('[data-clan-id]').forEach(card => {
            card.addEventListener('click', () => showAdminClanEdit(parseInt(card.dataset.clanId)));
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

async function showAdminClanEdit(clanId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    let data;
    try {
        data = await apiGet('/api/admin/clan/get?tg_id=' + tgUser.id + '&clan_id=' + clanId);
    } catch (e) {
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        return;
    }

    const c = data.clan;
    const members = data.members || [];

    let membersHtml = '';
    members.forEach(m => {
        const roleText = m.role === 'leader' ? '👑 Лидер' : (m.role === 'co_leader' ? '⭐ Солидер' : 'Участник');
        membersHtml += `
            <div class="admin-user-card" data-uid="${m.user_id}">
                <div class="admin-user-avatar">${m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase()}</div>
                <div class="admin-user-info">
                    <div class="admin-user-nick">${escapeHtml(m.nickname)}</div>
                    <div class="admin-user-sub">${roleText} · ELO ${m.elo}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="admin-clan-back">← Назад</button>
            <div class="section-title">Редактирование клана</div>
            <div style="width:60px;"></div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">🛡 Основное</div>
            <div class="admin-row">
                <input type="text" class="admin-input" id="adm-clan-name" placeholder="Название" value="${escapeHtml(c.name)}" maxlength="24">
            </div>
            <div class="admin-row">
                <input type="text" class="admin-input" id="adm-clan-tag" placeholder="Тег" value="${escapeHtml(c.tag)}" maxlength="5">
            </div>
            <div class="admin-row">
                <textarea class="admin-input" id="adm-clan-desc" placeholder="Описание" rows="2" maxlength="150" style="resize:none;">${escapeHtml(c.description || '')}</textarea>
            </div>
            <div class="admin-row">
                <button class="admin-btn primary" id="adm-clan-save">💾 Сохранить</button>
            </div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">👑 Лидер</div>
            <div class="admin-row">
                <input type="number" class="admin-input" id="adm-clan-new-leader" placeholder="ID нового лидера">
                <button class="admin-btn primary" id="adm-clan-leader-btn">Назначить</button>
            </div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">💬 Чат клана</div>
            <div class="admin-row">
                <button class="admin-btn danger" id="adm-clan-clear-chat">🗑 Очистить чат клана</button>
            </div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">🗑 Удалить клан</div>
            <div class="admin-row">
                <button class="admin-btn danger" id="adm-clan-delete">🗑 Удалить клан</button>
            </div>
        </div>

        <div class="section-head centered">
            <div class="section-title">Состав (${members.length})</div>
        </div>
        <div>${membersHtml}</div>
    `;

    document.getElementById('admin-clan-back').addEventListener('click', showAdminClans);

    document.getElementById('adm-clan-save').addEventListener('click', async () => {
        const name = document.getElementById('adm-clan-name').value.trim();
        const tag = document.getElementById('adm-clan-tag').value.trim();
        const description = document.getElementById('adm-clan-desc').value.trim();
        try {
            const res = await apiPost('/api/admin/clan/edit', {
                admin_id: tgUser.id,
                clan_id: clanId,
                name, tag, description
            });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('✅ Сохранено');
        } catch (e) {
            showToast('⚠ Ошибка');
        }
    });

    document.getElementById('adm-clan-leader-btn').addEventListener('click', async () => {
        const v = document.getElementById('adm-clan-new-leader').value.trim();
        if (!v) return showToast('⚠ Введи ID');
        try {
            const res = await apiPost('/api/admin/clan/set_leader', {
                admin_id: tgUser.id,
                clan_id: clanId,
                new_leader_id: parseInt(v)
            });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('👑 Лидер обновлён');
            showAdminClanEdit(clanId);
        } catch (e) {
            showToast('⚠ Ошибка');
        }
    });

    document.getElementById('adm-clan-clear-chat').addEventListener('click', async () => {
        if (!confirm('Удалить все сообщения этого клана?')) return;
        try {
            const res = await apiPost('/api/admin/clan/clear_chat', {
                admin_id: tgUser.id,
                clan_id: clanId
            });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('🧹 Чат клана очищен');
        } catch (e) {
            showToast('⚠ Ошибка');
        }
    });

    document.getElementById('adm-clan-delete').addEventListener('click', async () => {
        if (!confirm('Удалить клан?')) return;
        if (!confirm('Точно? Все участники будут исключены.')) return;
        try {
            const res = await apiPost('/api/admin/clan/delete', {
                admin_id: tgUser.id,
                clan_id: clanId
            });
            if (res.error) return showToast('⚠ ' + res.error);
            showToast('🗑 Клан удалён');
            showAdminClans();
        } catch (e) {
            showToast('⚠ Ошибка');
        }
    });

    container.querySelectorAll('[data-uid]').forEach(el => {
        el.addEventListener('click', () => showAdminUserEdit(parseInt(el.dataset.uid)));
    });
}

// ==== ЧАТЫ ====
async function showAdminChats() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = `
        <div class="section-head">
            <button class="section-btn" id="admin-back">← Назад</button>
            <div class="section-title">💬 Чаты</div>
            <div style="width:60px;"></div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">🌍 Глобальный чат</div>
            <div class="admin-row">
                <button class="admin-btn" id="adm-gchat-view">👁 Открыть</button>
            </div>
            <div class="admin-row">
                <button class="admin-btn danger" id="adm-gchat-24">🧹 За 24 часа</button>
                <button class="admin-btn danger" id="adm-gchat-all">🗑 Очистить всё</button>
            </div>
        </div>

        <div class="admin-section">
            <div class="admin-section-title">🛡 Чаты кланов</div>
            <div class="admin-row">
                <button class="admin-btn danger" id="adm-cchat-24">🧹 За 24 часа</button>
                <button class="admin-btn danger" id="adm-cchat-all">🗑 Очистить все</button>
            </div>
        </div>
    `;

    document.getElementById('admin-back').addEventListener('click', loadAdminHome);

    document.getElementById('adm-gchat-view').addEventListener('click', showAdminGlobalChatView);

    document.getElementById('adm-gchat-24').addEventListener('click', async () => {
        if (!confirm('Удалить сообщения глобального чата за 24 часа?')) return;
        await adminClearGlobalChat('24h');
    });

    document.getElementById('adm-gchat-all').addEventListener('click', async () => {
        if (!confirm('Удалить ВСЕ сообщения глобального чата?')) return;
        if (!confirm('Точно? Отменить нельзя.')) return;
        await adminClearGlobalChat('all');
    });

    document.getElementById('adm-cchat-24').addEventListener('click', async () => {
        if (!confirm('Удалить сообщения всех клановых чатов за 24 часа?')) return;
        await adminClearClanChats('24h');
    });

    document.getElementById('adm-cchat-all').addEventListener('click', async () => {
        if (!confirm('Удалить ВСЕ сообщения клановых чатов?')) return;
        if (!confirm('Точно? Отменить нельзя.')) return;
        await adminClearClanChats('all');
    });
}

async function adminClearGlobalChat(mode) {
    try {
        const res = await apiPost('/api/admin/chat/global/clear', {
            admin_id: tgUser.id,
            mode: mode
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('🧹 Удалено: ' + res.deleted);
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

async function adminClearClanChats(mode) {
    try {
        const res = await apiPost('/api/admin/chat/clans/clear', {
            admin_id: tgUser.id,
            mode: mode
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('🧹 Удалено: ' + res.deleted);
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

async function showAdminGlobalChatView() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const msgs = await apiGet('/api/admin/chat/global?tg_id=' + tgUser.id + '&limit=100');

        if (!msgs || msgs.length === 0) {
            container.innerHTML = `
                <div class="section-head">
                    <button class="section-btn" id="admin-back">← Назад</button>
                    <div class="section-title">🌍 Глобал чат</div>
                    <div style="width:60px;"></div>
                </div>
                <div class="map-empty">Сообщений нет</div>
            `;
            document.getElementById('admin-back').addEventListener('click', showAdminChats);
            return;
        }

        let listHtml = '';
        msgs.forEach(m => {
            const time = (m.created_at || '').substring(5, 16);
            const cls = m.is_deleted ? 'chat-deleted' : '';
            listHtml += `
                <div class="admin-msg ${cls}" data-mid="${m.id}">
                    <div class="admin-msg-head">
                        <b>${escapeHtml(m.nickname || '—')}</b>
                        <span class="admin-msg-time">${time}</span>
                    </div>
                    <div class="admin-msg-text">${escapeHtml(m.message)}</div>
                    ${m.is_deleted ? '<div class="admin-msg-del">удалено</div>' : ''}
                </div>
            `;
        });

        container.innerHTML = `
            <div class="section-head">
                <button class="section-btn" id="admin-back">← Назад</button>
                <div class="section-title">🌍 Глобал (${msgs.length})</div>
                <div style="width:60px;"></div>
            </div>
            <div class="admin-msgs">${listHtml}</div>
        `;

        document.getElementById('admin-back').addEventListener('click', showAdminChats);
        container.querySelectorAll('.admin-msg[data-mid]').forEach(el => {
            el.addEventListener('dblclick', () => adminDeleteGlobalMsg(parseInt(el.dataset.mid)));
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                adminDeleteGlobalMsg(parseInt(el.dataset.mid));
            });
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка</div>';
    }
}

async function adminDeleteGlobalMsg(mid) {
    if (!confirm('Удалить это сообщение?')) return;
    try {
        const res = await apiPost('/api/admin/chat/global/delete', {
            admin_id: tgUser.id,
            message_id: mid
        });
        if (res.error) return showToast('⚠ ' + res.error);
        showToast('🗑 Удалено');
        showAdminGlobalChatView();
    } catch (e) {
        showToast('⚠ Ошибка');
    }
}

// ==== Заглушки ====
function showAdminTickets() { showToast('⚠ Раздел «Тикеты» — в разработке'); }
function showAdminLogs() { showToast('⚠ Раздел «Логи» — в разработке'); }
function showAdminPromos() { showToast('⚠ Раздел «Промокоды» — в разработке'); }
function showAdminSeasons() { showToast('⚠ Раздел «Сезоны» — в разработке'); }
