// Уровень из ELO (как в database.py)
function levelFromElo(elo) {
    if (!elo) elo = 0;
    if (elo <= 500) return 1;
    if (elo <= 750) return 2;
    if (elo <= 900) return 3;
    if (elo <= 1050) return 4;
    if (elo <= 1200) return 5;
    if (elo <= 1300) return 6;
    if (elo <= 1530) return 7;
    if (elo <= 1750) return 8;
    if (elo <= 2000) return 9;
    return 10;
}

// ==== SVG-ИКОНКИ ДЛЯ КЛАНОВ ====
const C_ICONS = {
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>',
    crown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 18l1.5-9 4.5 4 3-6 3 6 4.5-4L21 18z"/><path d="M3 18h18"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 3l2.9 6.3 6.6.6-5 4.7 1.5 6.7L12 17.9 6 21.3l1.5-6.7-5-4.7 6.6-.6z"/></svg>',
    door: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/><path d="M10 17l-5-5 5-5"/><path d="M16 12H5"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M21 12a8 8 0 0 1-8 8H6l-3 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M5 12.5l5 5 9-11"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 5v14M5 12h14"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>'
};

function cSvg(name, size) {
    const s = size || 16;
    return `<span style="display:inline-flex;align-items:center;justify-content:center;width:${s}px;height:${s}px;vertical-align:middle;">${C_ICONS[name] || ''}</span>`;
}

// ==== КЛАНЫ ====
let myClanCache = null;

async function loadClan() {
    const container = document.getElementById('clan-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    if (!tgUser) {
        container.innerHTML = '<div class="map-empty">Открой через Telegram</div>';
        return;
    }

    try {
        const res = await apiGet('/api/clan/my?tg_id=' + tgUser.id);
        myClanCache = res.clan ? res : null;
        if (res.clan) {
            renderMyClan(res);
        } else {
            renderNoClan();
        }
    } catch (e) {
        console.error('Ошибка клана:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

function renderNoClan() {
    const container = document.getElementById('clan-content');
    container.innerHTML = `
        <div class="clan-empty">
            <div class="clan-empty-icon">${cSvg('shield', 64)}</div>
            <div class="clan-empty-title">Ты пока не в клане</div>
            <div class="clan-empty-text">
                Клан — это команда игроков с общим тегом и составом.<br>
                Вступи в существующий или создай свой.
            </div>
            <button class="btn-primary" id="clan-find-btn">${cSvg('search', 16)} Найти клан</button>
            <button class="btn-secondary" id="clan-create-btn">${cSvg('plus', 16)} Создать клан за 3500 монет</button>
        </div>
    `;
    document.getElementById('clan-find-btn').addEventListener('click', showClanList);
    document.getElementById('clan-create-btn').addEventListener('click', showClanCreate);
}

function renderMyClan(data) {
    const container = document.getElementById('clan-content');
    const c = data.clan;
    const members = data.members || [];

    const isLeader = c.role === 'leader';
    const isCoLeader = c.role === 'co_leader';
    const canKick = isLeader || isCoLeader;
    const canApprove = isLeader || isCoLeader;

    let membersHtml = '';
    members.forEach(m => {
        const roleIcon = m.role === 'leader' ? cSvg('crown', 12) : (m.role === 'co_leader' ? cSvg('star', 12) : '');
        const roleText = m.role === 'leader' ? 'Лидер' : (m.role === 'co_leader' ? 'Солидер' : 'Участник');
        const canKickThis = canKick && m.user_id !== tgUser.id && m.role !== 'leader' &&
                            !(isCoLeader && m.role === 'co_leader');

        membersHtml += `
            <div class="clan-member" data-uid="${m.user_id}">
                <div class="avatar-with-level"><div class="clan-member-avatar" ${m.avatar_url ? 'style="background-image:url(' + m.avatar_url + ')"' : ''}>
                    ${m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase()}
                </div><div class="level-badge-avatar-small">${levelSvg(levelFromElo(m.elo), 20)}</div></div>
                <div class="clan-member-info">
                    <div class="clan-member-nick">${roleIcon} ${escapeHtml(m.nickname)}</div>
                    <div class="clan-member-role">${roleText}</div>
                </div>
                <div class="clan-member-elo">${m.elo}</div>
                ${canKickThis ? `<button class="clan-kick-btn" data-uid="${m.user_id}">${cSvg('close', 12)}</button>` : ''}
            </div>
        `;
    });

    container.innerHTML = `
        <div class="clan-card">
            <div class="clan-header">
                <div class="clan-logo">${cSvg('shield', 52)}</div>
                <div class="clan-name">${escapeHtml(c.name)}</div>
                <div class="clan-tag">[${escapeHtml(c.tag)}]</div>
            </div>
            <div class="clan-meta">
                <div class="clan-meta-item">
                    <span class="clan-meta-label">Участников</span>
                    <span class="clan-meta-value">${c.members_count}</span>
                </div>
                <div class="clan-meta-item">
                    <span class="clan-meta-label">Роль</span>
                    <span class="clan-meta-value">${isLeader ? 'Лидер' : (isCoLeader ? 'Солидер' : 'Участник')}</span>
                </div>
            </div>
            ${c.description ? `<div class="clan-description">${escapeHtml(c.description)}</div>` : ''}
            ${canApprove ? `<button class="btn-secondary" id="clan-apps-btn">${cSvg('mail', 14)} Заявки <span id="clan-apps-count"></span></button>` : ''}
            <button class="btn-secondary" id="clan-chat-btn">${cSvg('chat', 14)} Чат клана</button>
            <button class="btn-secondary" id="clan-all-btn">${cSvg('search', 14)} Все кланы</button>
            ${isLeader ? `<button class="btn-danger" id="clan-delete-btn">${cSvg('trash', 14)} Удалить клан</button>` : ''}
            <button class="btn-secondary" id="clan-leave-btn">
                ${isLeader ? cSvg('crown', 14) + ' Покинуть (передать солидеру)' : cSvg('door', 14) + ' Покинуть клан'}
            </button>
        </div>
        <div class="section-head centered">
            <div class="section-title">Состав</div>
        </div>
        <div class="clan-members">${membersHtml}</div>
    `;

    document.getElementById('clan-leave-btn').addEventListener('click', clanLeave);

    const delBtn = document.getElementById('clan-delete-btn');
    if (delBtn) delBtn.addEventListener('click', clanDelete);

    const appsBtn = document.getElementById('clan-apps-btn');
    if (appsBtn) appsBtn.addEventListener('click', showApplications);

    const allBtn = document.getElementById('clan-all-btn');
    if (allBtn) allBtn.addEventListener('click', showClanList);

    const chatBtn = document.getElementById('clan-chat-btn');
    if (chatBtn) chatBtn.addEventListener('click', () => openClanChat(c.clan_id));

    container.querySelectorAll('.clan-kick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            clanKick(parseInt(btn.dataset.uid));
        });
    });

    container.querySelectorAll('.clan-member[data-uid]').forEach(el => {
        el.addEventListener('click', (e) => {
            if (e.target.closest('.clan-kick-btn')) return;
            const uid = parseInt(el.dataset.uid);
            if (typeof openModal === 'function') openModal(uid);
        });
    });

    if (canApprove) loadAppsCount();
}

async function loadAppsCount() {
    try {
        const apps = await apiGet('/api/clan/applications?tg_id=' + tgUser.id);
        const el = document.getElementById('clan-apps-count');
        if (el && apps && apps.length > 0) {
            el.textContent = '(' + apps.length + ')';
            el.style.color = '#ff9d2e';
        }
    } catch (e) {}
}

async function showApplications() {
    const container = document.getElementById('clan-content');
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const apps = await apiGet('/api/clan/applications?tg_id=' + tgUser.id);

        if (!apps || apps.length === 0) {
            container.innerHTML = `
                <div class="clan-empty">
                    <div class="clan-empty-icon">${cSvg('inbox', 64)}</div>
                    <div class="clan-empty-title">Заявок нет</div>
                    <div class="clan-empty-text">Пока никто не хочет вступить в твой клан.</div>
                    <button class="btn-secondary" id="clan-back-btn">${cSvg('back', 14)} Назад</button>
                </div>
            `;
            document.getElementById('clan-back-btn').addEventListener('click', loadClan);
            return;
        }

        let listHtml = '';
        apps.forEach(a => {
            listHtml += `
                <div class="clan-member" data-uid="${a.user_id}">
                    <div class="avatar-with-level"><div class="clan-member-avatar" ${a.avatar_url ? 'style="background-image:url(' + a.avatar_url + ')"' : ''}>
                        ${a.avatar_url ? '' : (a.nickname || '?').charAt(0).toUpperCase()}
                    </div><div class="level-badge-avatar-small">${levelSvg(levelFromElo(a.elo), 20)}</div></div>
                    <div class="clan-member-info">
                        <div class="clan-member-nick">${escapeHtml(a.nickname)}</div>
                        <div class="clan-member-role">ELO ${a.elo}</div>
                    </div>
                    <button class="clan-approve-btn" data-uid="${a.user_id}">${cSvg('check', 14)}</button>
                    <button class="clan-reject-btn" data-uid="${a.user_id}">${cSvg('close', 14)}</button>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="section-head centered"><div class="section-title">Заявки (${apps.length})</div></div>
            <div class="clan-members">${listHtml}</div>
            <button class="btn-secondary" id="clan-back-btn" style="margin-top:16px;">${cSvg('back', 14)} Назад</button>
        `;

        document.getElementById('clan-back-btn').addEventListener('click', loadClan);
        container.querySelectorAll('.clan-approve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                appAction('approve', parseInt(btn.dataset.uid));
            });
        });
        container.querySelectorAll('.clan-reject-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                appAction('reject', parseInt(btn.dataset.uid));
            });
        });
        container.querySelectorAll('.clan-member[data-uid]').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('.clan-approve-btn') || e.target.closest('.clan-reject-btn')) return;
                const uid = parseInt(el.dataset.uid);
                if (typeof openModal === 'function') openModal(uid);
            });
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

async function appAction(action, targetId) {
    try {
        const res = await apiPost('/api/clan/applications/' + action, {
            user_id: tgUser.id,
            target_id: targetId
        });
        if (res.error) return showToast(res.error);
        showToast(action === 'approve' ? 'Принят в клан' : 'Отклонён');
        await showApplications();
    } catch (e) {
        console.error(e);
        showToast('Ошибка');
    }
}

let allClansCache = [];

async function showClanList() {
    const container = document.getElementById('clan-content');
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const clans = await apiGet('/api/clan/list?limit=50');
        allClansCache = clans || [];
        renderClanList('');
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

function renderClanList(filter) {
    const container = document.getElementById('clan-content');
    const q = (filter || '').trim().toLowerCase();

    const filtered = q
        ? allClansCache.filter(c => c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q))
        : allClansCache;

    const backLabel = cSvg('back', 14) + ' ' + (myClanCache && myClanCache.clan ? 'К моему клану' : 'Назад');

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="search-wrap">
                <span class="search-icon">🔍</span>
                <input type="text" class="search-input" id="clan-search-input" placeholder="Поиск по названию или тегу..." value="${escapeHtml(filter || '')}" autocomplete="off">
            </div>
            <div class="section-head centered"><div class="section-title">Все кланы</div></div>
            <div class="map-empty">${q ? 'Ничего не найдено' : 'Кланов пока нет'}</div>
            <button class="btn-secondary" id="clan-back-btn" style="margin-top:16px;">${backLabel}</button>
        `;
        document.getElementById('clan-back-btn').addEventListener('click', loadClan);
        const si = document.getElementById('clan-search-input');
        if (si) {
            si.addEventListener('input', (e) => renderClanList(e.target.value));
            si.focus();
        }
        return;
    }

    let listHtml = '';
    filtered.forEach((c, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1);
        listHtml += `
            <div class="clan-list-item" data-clan-id="${c.clan_id}">
                <div class="clan-list-rank">${medal}</div>
                <div class="clan-list-logo">${cSvg('shield', 26)}</div>
                <div class="clan-list-info">
                    <div class="clan-list-name">[${escapeHtml(c.tag)}] ${escapeHtml(c.name)}</div>
                    <div class="clan-list-sub">${c.members_count} участников · Лидер: ${escapeHtml(c.creator_nick || '—')}</div>
                </div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input type="text" class="search-input" id="clan-search-input" placeholder="Поиск по названию или тегу..." value="${escapeHtml(filter || '')}" autocomplete="off">
        </div>
        <div class="section-head centered"><div class="section-title">Все кланы (${filtered.length})</div></div>
        <div class="clan-list">${listHtml}</div>
        <button class="btn-secondary" id="clan-back-btn" style="margin-top:16px;">${backLabel}</button>
    `;

    const si = document.getElementById('clan-search-input');
    if (si) si.addEventListener('input', (e) => renderClanList(e.target.value));
    document.getElementById('clan-back-btn').addEventListener('click', loadClan);
    container.querySelectorAll('.clan-list-item').forEach(item => {
        item.addEventListener('click', () => viewClan(parseInt(item.dataset.clanId)));
    });
}

async function viewClan(clanId) {
    const container = document.getElementById('clan-content');
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const data = await apiGet('/api/clan/info?clan_id=' + clanId);
        const c = data.clan;
        const members = data.members || [];

        let membersHtml = '';
        members.forEach(m => {
            const roleIcon = m.role === 'leader' ? cSvg('crown', 12) : (m.role === 'co_leader' ? cSvg('star', 12) : '');
            const roleText = m.role === 'leader' ? 'Лидер' : (m.role === 'co_leader' ? 'Солидер' : 'Участник');
            membersHtml += `
                <div class="clan-member" data-uid="${m.user_id}">
                    <div class="clan-member-avatar" ${m.avatar_url ? 'style="background-image:url(' + m.avatar_url + ')"' : ''}>
                        ${m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase()}
                    </div>
                    <div class="clan-member-info">
                        <div class="clan-member-nick">${roleIcon} ${escapeHtml(m.nickname)}</div>
                        <div class="clan-member-role">${roleText}</div>
                    </div>
                    <div class="clan-member-elo">${m.elo}</div>
                </div>
            `;
        });

        const amIMember = myClanCache && myClanCache.clan && myClanCache.clan.clan_id === clanId;
        const inAnyClan = myClanCache && myClanCache.clan;

        let actionBtn = '';
        if (!amIMember) {
            if (inAnyClan) {
                actionBtn = '<button class="btn-secondary" disabled>Ты уже в другом клане</button>';
            } else {
                let applied = false;
                try {
                    const ar = await apiGet('/api/clan/my_application?tg_id=' + tgUser.id + '&clan_id=' + clanId);
                    applied = ar.applied;
                } catch (e) {}
                actionBtn = applied
                    ? '<button class="btn-secondary" disabled>Заявка отправлена</button>'
                    : `<button class="btn-primary" id="clan-join-btn">${cSvg('mail', 14)} Подать заявку</button>`;
            }
        }

        const backLabel = inAnyClan ? cSvg('back', 14) + ' К моему клану' : cSvg('back', 14) + ' К списку кланов';
        const backAction = inAnyClan ? loadClan : showClanList;

        container.innerHTML = `
            <div class="clan-card">
                <div class="clan-header">
                    <div class="clan-logo">${cSvg('shield', 52)}</div>
                    <div class="clan-name">${escapeHtml(c.name)}</div>
                    <div class="clan-tag">[${escapeHtml(c.tag)}]</div>
                </div>
                <div class="clan-meta">
                    <div class="clan-meta-item">
                        <span class="clan-meta-label">Участников</span>
                        <span class="clan-meta-value">${c.members_count}</span>
                    </div>
                </div>
                ${c.description ? `<div class="clan-description">${escapeHtml(c.description)}</div>` : ''}
                ${actionBtn}
            </div>
            <div class="section-head centered"><div class="section-title">Состав</div></div>
            <div class="clan-members">${membersHtml}</div>
            <button class="btn-secondary" id="clan-back-btn" style="margin-top:16px;">${backLabel}</button>
        `;

        document.getElementById('clan-back-btn').addEventListener('click', backAction);
        const jb = document.getElementById('clan-join-btn');
        if (jb) jb.addEventListener('click', () => clanApply(clanId));

        container.querySelectorAll('.clan-member[data-uid]').forEach(el => {
            el.addEventListener('click', () => {
                const uid = parseInt(el.dataset.uid);
                if (typeof openModal === 'function') openModal(uid);
            });
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

function showClanCreate() {
    const container = document.getElementById('clan-content');
    container.innerHTML = `
        <div class="section-head centered"><div class="section-title">Создать клан</div></div>
        <div class="card wide-card">
            <div class="clan-cost">Стоимость: <b>3500 монет</b></div>
            <div class="form-group">
                <label class="form-label">Название (3-24)</label>
                <input type="text" class="form-input" id="clan-name-input" maxlength="24" placeholder="LUMA ESPORTS">
            </div>
            <div class="form-group">
                <label class="form-label">Тег (2-5, латиница/цифры)</label>
                <input type="text" class="form-input" id="clan-tag-input" maxlength="5" placeholder="LME">
            </div>
            <div class="form-group">
                <label class="form-label">Описание (до 150)</label>
                <textarea class="form-input" id="clan-desc-input" rows="3" maxlength="150" placeholder="Сбор сильнейших игроков..."></textarea>
            </div>
            <button class="btn-primary" id="clan-create-submit">${cSvg('plus', 14)} Создать клан</button>
            <button class="btn-secondary" id="clan-back-btn">${cSvg('back', 14)} Назад</button>
        </div>
    `;
    document.getElementById('clan-back-btn').addEventListener('click', loadClan);
    document.getElementById('clan-create-submit').addEventListener('click', clanCreate);
}

async function clanCreate() {
    const name = document.getElementById('clan-name-input').value.trim();
    const tag = document.getElementById('clan-tag-input').value.trim();
    const description = document.getElementById('clan-desc-input').value.trim();

    if (name.length < 3 || name.length > 24) return showToast('Название: 3-24 символа');
    if (tag.length < 2 || tag.length > 5) return showToast('Тег: 2-5 символов');
    if (!/^[a-zA-Z0-9]+$/.test(tag)) return showToast('Тег: только латиница и цифры');

    const btn = document.getElementById('clan-create-submit');
    btn.disabled = true;
    btn.textContent = 'Создание...';

    try {
        const res = await apiPost('/api/clan/create', {
            creator_id: tgUser.id,
            name: name,
            tag: tag,
            description: description
        });
        if (res.error) {
            showToast(res.error);
            btn.disabled = false;
            btn.innerHTML = cSvg('plus', 14) + ' Создать клан';
            return;
        }
        showToast('Клан создан');
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('Ошибка');
        btn.disabled = false;
        btn.innerHTML = cSvg('plus', 14) + ' Создать клан';
    }
}

async function clanApply(clanId) {
    try {
        const res = await apiPost('/api/clan/apply', {
            clan_id: clanId,
            user_id: tgUser.id
        });
        if (res.error) return showToast(res.error);
        showToast('Заявка отправлена');
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        viewClan(clanId);
    } catch (e) {
        console.error(e);
        showToast('Ошибка');
    }
}

async function clanLeave() {
    if (!confirm('Точно покинуть клан?')) return;
    try {
        const res = await apiPost('/api/clan/leave', { user_id: tgUser.id });
        if (res.error) return showToast(res.error);
        showToast('Ты покинул клан');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('Ошибка');
    }
}

async function clanDelete() {
    if (!confirm('Удалить клан навсегда? Это нельзя отменить.')) return;
    if (!confirm('Точно? Все участники будут исключены.')) return;
    try {
        const res = await apiPost('/api/clan/delete', {
            user_id: tgUser.id,
            clan_id: myClanCache.clan.clan_id
        });
        if (res.error) return showToast(res.error);
        showToast('Клан удалён');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('Ошибка');
    }
}

async function clanKick(targetId) {
    if (!confirm('Кикнуть игрока?')) return;
    try {
        const res = await apiPost('/api/clan/kick', {
            user_id: tgUser.id,
            target_id: targetId
        });
        if (res.error) return showToast(res.error);
        showToast('Игрок кикнут');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('Ошибка');
    }
}

// ==== КЛАНОВЫЙ ЧАТ ====
let clanChatCache = [];
let clanChatLastId = 0;
let clanChatPollTimer = null;
let currentClanChatId = null;

async function openClanChat(clanId) {
    currentClanChatId = clanId;

    const container = document.getElementById('clan-content');
    container.innerHTML = `
        <div class="chat-wrap">
            <div class="section-head centered">
                <div class="section-title">${cSvg('chat', 16)} Чат клана</div>
            </div>
            <div class="chat-messages" id="clan-chat-messages">
                <div class="map-empty">Загрузка...</div>
            </div>
            <div class="chat-input-row">
                <textarea id="clan-chat-input" class="chat-input" placeholder="Написать в чат клана..." maxlength="500" rows="1"></textarea>
                <button id="clan-chat-send" class="chat-send-btn">${cSvg('send', 18)}</button>
            </div>
            <button class="btn-secondary" id="clan-chat-back" style="margin-top:8px;">${cSvg('back', 14)} Назад к клану</button>
        </div>
    `;

    document.getElementById('clan-chat-back').addEventListener('click', () => {
        stopClanChatPolling();
        loadClan();
    });

    document.getElementById('clan-chat-send').addEventListener('click', sendClanChatMessage);
    const input = document.getElementById('clan-chat-input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendClanChatMessage();
        }
    });
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    await loadClanChat();
    startClanChatPolling();
}

async function loadClanChat() {
    if (!currentClanChatId) return;
    const container = document.getElementById('clan-chat-messages');
    if (!container) return;

    try {
        const msgs = await apiGet('/api/clan/chat?clan_id=' + currentClanChatId + '&limit=50');
        clanChatCache = msgs || [];
        clanChatLastId = clanChatCache.length > 0 ? clanChatCache[clanChatCache.length - 1].id : 0;
        renderClanChat();
        container.scrollTop = container.scrollHeight;
    } catch (e) {
        console.error('Ошибка чата клана:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

function renderClanChat() {
    const container = document.getElementById('clan-chat-messages');
    if (!container) return;

    if (!clanChatCache || clanChatCache.length === 0) {
        container.innerHTML = '<div class="map-empty">Сообщений пока нет</div>';
        return;
    }

    let html = '';
    clanChatCache.forEach(m => {
        const isMe = Number(m.user_id) === Number(tgUser.id);
        const avatarStyle = m.avatar_url ? 'style="background-image:url(' + m.avatar_url + ')"' : '';
        const avatarText = m.avatar_url ? '' : (m.nickname || '?').charAt(0).toUpperCase();
        const roleIcon = m.clan_role === 'leader' ? cSvg('crown', 12) + ' ' : (m.clan_role === 'co_leader' ? cSvg('star', 12) + ' ' : '');
        const time = (m.created_at || '').substring(11, 16);

        if (m.is_deleted) {
            html += `
                <div class="chat-msg ${isMe ? 'mine' : ''}">
                    <div class="chat-bubble deleted-bubble"><i>Сообщение удалено</i></div>
                </div>
            `;
            return;
        }

        html += `
            <div class="chat-msg ${isMe ? 'mine' : ''}">
                ${!isMe ? `<div class="chat-avatar" ${avatarStyle} data-uid="${m.user_id}">${avatarText}</div>` : ''}
                <div class="chat-body">
                    ${!isMe ? `<div class="chat-name" data-uid="${m.user_id}">${roleIcon}${escapeHtml(m.nickname)}</div>` : ''}
                    <div class="chat-bubble" data-mid="${m.id}" data-uid="${m.user_id}">
                        <div class="chat-text">${escapeHtml(m.message)}</div>
                        <div class="chat-time">${time}</div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    container.querySelectorAll('[data-uid]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const uid = parseInt(el.dataset.uid);
            if (uid && typeof openModal === 'function') openModal(uid);
        });
    });

    container.querySelectorAll('.chat-bubble').forEach(bubble => {
        let timer = null;
        bubble.addEventListener('touchstart', () => {
            timer = setTimeout(() => {
                const mid = parseInt(bubble.dataset.mid);
                if (confirm('Удалить сообщение?')) deleteClanChatMessage(mid);
            }, 700);
        });
        bubble.addEventListener('touchend', () => clearTimeout(timer));
        bubble.addEventListener('touchmove', () => clearTimeout(timer));
        bubble.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const mid = parseInt(bubble.dataset.mid);
            if (confirm('Удалить сообщение?')) deleteClanChatMessage(mid);
        });
    });
}

async function sendClanChatMessage() {
    const input = document.getElementById('clan-chat-input');
    if (!input || !currentClanChatId) return;
    const text = input.value.trim();
    if (!text) return;
    if (text.length > 500) return showToast('Максимум 500 символов');

    input.value = '';
    input.style.height = 'auto';

    try {
        const res = await apiPost('/api/clan/chat/send', {
            user_id: tgUser.id,
            clan_id: currentClanChatId,
            message: text
        });
        if (res.error) {
            showToast(res.error);
            input.value = text;
            return;
        }
        await loadClanChat();
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    } catch (e) {
        console.error(e);
        showToast('Ошибка отправки');
        input.value = text;
    }
}

async function deleteClanChatMessage(messageId) {
    try {
        const res = await apiPost('/api/clan/chat/delete', {
            user_id: tgUser.id,
            message_id: messageId
        });
        if (res.error) return showToast(res.error);
        showToast('Удалено');
        await loadClanChat();
    } catch (e) {
        console.error(e);
        showToast('Ошибка');
    }
}

function startClanChatPolling() {
    stopClanChatPollingTimer();
    clanChatPollTimer = setInterval(async () => {
        if (!currentClanChatId) return;
        try {
            const msgs = await apiGet('/api/clan/chat?clan_id=' + currentClanChatId + '&limit=50');
            if (!msgs || msgs.length === 0) return;
            const newLastId = msgs[msgs.length - 1].id;
            if (newLastId !== clanChatLastId) {
                clanChatCache = msgs;
                clanChatLastId = newLastId;
                renderClanChat();
                const container = document.getElementById('clan-chat-messages');
                if (container) container.scrollTop = container.scrollHeight;
            }
        } catch (e) {}
    }, 3000);
}

function stopClanChatPollingTimer() {
    if (clanChatPollTimer) {
        clearInterval(clanChatPollTimer);
        clanChatPollTimer = null;
    }
}

function stopClanChatPolling() {
    stopClanChatPollingTimer();
    currentClanChatId = null;
}
