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

// ==== ЕСЛИ НЕТ КЛАНА ====
function renderNoClan() {
    const container = document.getElementById('clan-content');
    container.innerHTML = `
        <div class="clan-empty">
            <div class="clan-empty-icon">🛡</div>
            <div class="clan-empty-title">Ты пока не в клане</div>
            <div class="clan-empty-text">
                Клан — это команда игроков с общим тегом и составом.<br>
                Вступи в существующий или создай свой.
            </div>
            <button class="btn-primary" id="clan-find-btn">🔍 Найти клан</button>
            <button class="btn-secondary" id="clan-create-btn">➕ Создать клан за 3500 🪙</button>
        </div>
    `;
    document.getElementById('clan-find-btn').addEventListener('click', showClanList);
    document.getElementById('clan-create-btn').addEventListener('click', showClanCreate);
}

// ==== МОЙ КЛАН ====
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
        const roleIcon = m.role === 'leader' ? '👑' : (m.role === 'co_leader' ? '⭐' : '');
        const roleText = m.role === 'leader' ? 'Лидер' : (m.role === 'co_leader' ? 'Солидер' : 'Участник');
        const canKickThis = canKick && m.user_id !== tgUser.id && m.role !== 'leader' &&
                            !(isCoLeader && m.role === 'co_leader');

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
                ${canKickThis ? `<button class="clan-kick-btn" data-uid="${m.user_id}">✕</button>` : ''}
            </div>
        `;
    });

    container.innerHTML = `
        <div class="clan-card">
            <div class="clan-header">
                <div class="clan-logo">🛡</div>
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
            ${canApprove ? `<button class="btn-secondary" id="clan-apps-btn">📨 Заявки <span id="clan-apps-count"></span></button>` : ''}
            <button class="btn-secondary" id="clan-all-btn">🔍 Все кланы</button>
            ${isLeader ? `<button class="btn-danger" id="clan-delete-btn">🗑 Удалить клан</button>` : ''}
            <button class="btn-secondary" id="clan-leave-btn">
                ${isLeader ? '👑 Покинуть (передать солидеру)' : '🚪 Покинуть клан'}
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

// ==== ЗАЯВКИ ====
async function showApplications() {
    const container = document.getElementById('clan-content');
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const apps = await apiGet('/api/clan/applications?tg_id=' + tgUser.id);

        if (!apps || apps.length === 0) {
            container.innerHTML = `
                <div class="clan-empty">
                    <div class="clan-empty-icon">📭</div>
                    <div class="clan-empty-title">Заявок нет</div>
                    <div class="clan-empty-text">Пока никто не хочет вступить в твой клан.</div>
                    <button class="btn-secondary" id="clan-back-btn">← Назад</button>
                </div>
            `;
            document.getElementById('clan-back-btn').addEventListener('click', loadClan);
            return;
        }

        let listHtml = '';
        apps.forEach(a => {
            listHtml += `
                <div class="clan-member" data-uid="${a.user_id}">
                    <div class="clan-member-avatar" ${a.avatar_url ? 'style="background-image:url(' + a.avatar_url + ')"' : ''}>
                        ${a.avatar_url ? '' : (a.nickname || '?').charAt(0).toUpperCase()}
                    </div>
                    <div class="clan-member-info">
                        <div class="clan-member-nick">${escapeHtml(a.nickname)}</div>
                        <div class="clan-member-role">ELO ${a.elo}</div>
                    </div>
                    <button class="clan-approve-btn" data-uid="${a.user_id}">✓</button>
                    <button class="clan-reject-btn" data-uid="${a.user_id}">✕</button>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="section-head centered"><div class="section-title">Заявки (${apps.length})</div></div>
            <div class="clan-members">${listHtml}</div>
            <button class="btn-secondary" id="clan-back-btn" style="margin-top:16px;">← Назад</button>
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
        if (res.error) return showToast('⚠ ' + res.error);
        showToast(action === 'approve' ? '✅ Принят в клан' : '❌ Отклонён');
        await showApplications();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
    }
}

// ==== СПИСОК КЛАНОВ ====
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

    const backLabel = myClanCache && myClanCache.clan ? '← К моему клану' : '← Назад';

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
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
        listHtml += `
            <div class="clan-list-item" data-clan-id="${c.clan_id}">
                <div class="clan-list-rank">${medal}</div>
                <div class="clan-list-logo">🛡</div>
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
    if (si) {
        si.addEventListener('input', (e) => renderClanList(e.target.value));
    }
    document.getElementById('clan-back-btn').addEventListener('click', loadClan);
    container.querySelectorAll('.clan-list-item').forEach(item => {
        item.addEventListener('click', () => viewClan(parseInt(item.dataset.clanId)));
    });
}

// ==== ПРОСМОТР ЧУЖОГО КЛАНА ====
async function viewClan(clanId) {
    const container = document.getElementById('clan-content');
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const data = await apiGet('/api/clan/info?clan_id=' + clanId);
        const c = data.clan;
        const members = data.members || [];

        let membersHtml = '';
        members.forEach(m => {
            const roleIcon = m.role === 'leader' ? '👑' : (m.role === 'co_leader' ? '⭐' : '');
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
                actionBtn = '<button class="btn-secondary" disabled>🚫 Ты уже в другом клане</button>';
            } else {
                let applied = false;
                try {
                    const ar = await apiGet('/api/clan/my_application?tg_id=' + tgUser.id + '&clan_id=' + clanId);
                    applied = ar.applied;
                } catch (e) {}
                actionBtn = applied
                    ? '<button class="btn-secondary" disabled>⏳ Заявка отправлена</button>'
                    : '<button class="btn-primary" id="clan-join-btn">📨 Подать заявку</button>';
            }
        }

        const backLabel = inAnyClan ? '← К моему клану' : '← К списку кланов';
        const backAction = inAnyClan ? loadClan : showClanList;

        container.innerHTML = `
            <div class="clan-card">
                <div class="clan-header">
                    <div class="clan-logo">🛡</div>
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

// ==== СОЗДАНИЕ КЛАНА ====
function showClanCreate() {
    const container = document.getElementById('clan-content');
    container.innerHTML = `
        <div class="section-head centered"><div class="section-title">Создать клан</div></div>
        <div class="card wide-card">
            <div class="clan-cost">Стоимость: <b>3500 🪙</b></div>
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
            <button class="btn-primary" id="clan-create-submit">➕ Создать клан</button>
            <button class="btn-secondary" id="clan-back-btn">← Назад</button>
        </div>
    `;
    document.getElementById('clan-back-btn').addEventListener('click', loadClan);
    document.getElementById('clan-create-submit').addEventListener('click', clanCreate);
}

async function clanCreate() {
    const name = document.getElementById('clan-name-input').value.trim();
    const tag = document.getElementById('clan-tag-input').value.trim();
    const description = document.getElementById('clan-desc-input').value.trim();

    if (name.length < 3 || name.length > 24) return showToast('⚠ Название: 3-24 символа');
    if (tag.length < 2 || tag.length > 5) return showToast('⚠ Тег: 2-5 символов');
    if (!/^[a-zA-Z0-9]+$/.test(tag)) return showToast('⚠ Тег: только латиница и цифры');

    const btn = document.getElementById('clan-create-submit');
    btn.disabled = true;
    btn.textContent = '⏳ Создание...';

    try {
        const res = await apiPost('/api/clan/create', {
            creator_id: tgUser.id,
            name: name,
            tag: tag,
            description: description
        });
        if (res.error) {
            showToast('⚠ ' + res.error);
            btn.disabled = false;
            btn.textContent = '➕ Создать клан';
            return;
        }
        showToast('✅ Клан создан!');
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        await loadClan();
    } catch (e) {
        console.error(e);
        showToast('⚠ Ошибка');
        btn.disabled = false;
        btn.textC
