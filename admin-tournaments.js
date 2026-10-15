// ==== АДМИНКА ТУРНИРОВ ====
console.log('=== admin-tournaments.js START ===');

let atList = [];
let atCurrentId = null;
let atCurrentTournament = null;
let atTeams = [];
let atMatches = [];

async function showAdminTournaments() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const list = await apiGet('/api/admin/tournaments/list?tg_id=' + tgUser.id);
        atList = list || [];
        let html = '';
        html += '<div class="section-head"><button class="section-btn" id="at-back">' + svg('back', 14) + ' Назад</button><div class="section-title">' + svg('trophy', 16) + ' Турниры</div><div style="width:60px;"></div></div>';
        html += '<button class="admin-btn primary" id="at-create" style="width:100%;margin-bottom:14px;padding:14px;">' + svg('plus', 16) + ' Создать турнир</button>';
        if (atList.length === 0) {
            html += '<div class="map-empty">Турниров пока нет</div>';
        } else {
            atList.forEach(function(t) {
                let statusText = t.status;
                if (t.status === 'registration') statusText = 'Регистрация';
                else if (t.status === 'closed') statusText = 'Регистрация закрыта';
                else if (t.status === 'active') statusText = 'Идёт';
                else if (t.status === 'finished') statusText = 'Завершён';
                html += '<div class="admin-user-card" data-at-id="' + t.id + '">';
                html += '<div class="admin-user-info"><div class="admin-user-nick">' + svg('trophy', 14) + ' ' + escapeHtml(t.name) + '</div>';
                html += '<div class="admin-user-sub">' + statusText + ' · ' + t.mode + ' · ' + escapeHtml(t.map) + ' · ' + t.teams_count + '/' + t.max_teams + '</div></div>';
                html += '<button class="admin-btn primary" data-at-edit="' + t.id + '" style="padding:8px 14px;font-size:12px;flex:0 0 auto;">' + svg('target', 14) + ' Управление</button></div>';
            });
        }
        container.innerHTML = html;
        document.getElementById('at-back').addEventListener('click', loadAdminHome);
        document.getElementById('at-create').addEventListener('click', showAdminTournamentCreate);
        container.querySelectorAll('[data-at-edit]').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                showAdminTournamentManage(parseInt(btn.dataset.atEdit));
            });
        });
        container.querySelectorAll('[data-at-id]').forEach(function(card) {
            card.addEventListener('click', function(e) {
                if (e.target.closest('[data-at-edit]')) return;
                showAdminTournamentManage(parseInt(card.dataset.atId));
            });
        });
    } catch (e) {
        console.error('Ошибка:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

function showAdminTournamentCreate() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    let html = '';
    html += '<div class="section-head"><button class="section-btn" id="atc-back">' + svg('back', 14) + ' Назад</button><div class="section-title">' + svg('plus', 16) + ' Новый турнир</div><div style="width:60px;"></div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('edit', 14) + ' Название *</div><div class="admin-row"><input type="text" class="admin-input" id="atc-name" placeholder="LUMA CUP #3" maxlength="40"></div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('scroll', 14) + ' Описание</div><div class="admin-row"><textarea class="admin-input" id="atc-desc" placeholder="Описание..." rows="3" style="resize:none;"></textarea></div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('users', 14) + ' Режим *</div><div style="display:flex;gap:6px;flex-wrap:wrap;">';
    ['1x1','2x2','3x3','4x4','5x5'].forEach(function(v) {
        html += '<button type="button" class="admin-btn ' + (v === '5x5' ? 'primary' : '') + ' atc-mode" data-val="' + v + '">' + v + '</button>';
    });
    html += '</div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('map', 14) + ' Карта *</div><div style="display:flex;gap:6px;flex-wrap:wrap;">';
    ['Sandstone','Province','Rust','Prison','Hanami','Random','All maps'].forEach(function(v) {
        html += '<button type="button" class="admin-btn ' + (v === 'Sandstone' ? 'primary' : '') + ' atc-map" data-val="' + v + '">' + v + '</button>';
    });
    html += '</div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('grid', 14) + ' Формат матчей *</div><div style="display:flex;gap:6px;flex-wrap:wrap;">';
    ['bo1','bo3','bo5','bo7'].forEach(function(v) {
        html += '<button type="button" class="admin-btn ' + (v === 'bo3' ? 'primary' : '') + ' atc-format" data-val="' + v + '">' + v.toUpperCase() + '</button>';
    });
    html += '</div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('users', 14) + ' Команды *</div><div class="admin-row"><input type="number" class="admin-input" id="atc-max-teams" placeholder="Макс. команд" value="8"><input type="number" class="admin-input" id="atc-min-players" placeholder="Мин. игроков" value="5"></div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('gift', 14) + ' Приз *</div><div class="admin-row"><input type="text" class="admin-input" id="atc-prize-text" placeholder="50 000 монет + PRO на месяц"></div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('scroll', 14) + ' Правила</div><div class="admin-row"><textarea class="admin-input" id="atc-rules" placeholder="1. ОБЩИЕ ПОЛОЖЕНИЯ..." rows="6" style="resize:none;"></textarea></div><div class="admin-row"><button type="button" class="admin-btn" id="atc-fill-rules">Загрузить шаблон</button></div></div>';
    html += '<div class="admin-section"><div class="admin-section-title">' + svg('calendar', 14) + ' Даты</div><div class="admin-row"><input type="text" class="admin-input" id="atc-start-date" placeholder="2026-10-20 18:00"><input type="text" class="admin-input" id="atc-reg-deadline" placeholder="2026-10-19 23:59"></div></div>';
    html += '<button class="admin-btn primary" id="atc-submit" style="width:100%;padding:16px;font-size:15px;margin-top:10px;">' + svg('check', 16) + ' Создать турнир</button>';
    container.innerHTML = html;

    let selectedMode = '5x5';
    let selectedMap = 'Sandstone';
    let selectedFormat = 'bo3';

    container.querySelectorAll('.atc-mode').forEach(function(btn) {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.atc-mode').forEach(function(b) { b.classList.remove('primary'); });
            btn.classList.add('primary'); selectedMode = btn.dataset.val;
        });
    });
    container.querySelectorAll('.atc-map').forEach(function(btn) {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.atc-map').forEach(function(b) { b.classList.remove('primary'); });
            btn.classList.add('primary'); selectedMap = btn.dataset.val;
        });
    });
    container.querySelectorAll('.atc-format').forEach(function(btn) {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.atc-format').forEach(function(b) { b.classList.remove('primary'); });
            btn.classList.add('primary'); selectedFormat = btn.dataset.val;
        });
    });

    document.getElementById('atc-fill-rules').addEventListener('click', function() {
        const template = '1. ОБЩИЕ ПОЛОЖЕНИЯ\nТурнир проходит в формате ' + selectedMode + ' на карте ' + selectedMap + '.\nФормат матчей: ' + selectedFormat.toUpperCase() + '.\n\n2. РЕГИСТРАЦИЯ\n• Капитан подаёт заявку через Mini App.\n• Указываются игровой ID и ник каждого игрока.\n• Один игровой ID — только одна команда.\n\n3. СОСТАВ\n• Замены до старта турнира.\n• После старта состав фиксирован.\n\n4. МАТЧИ\n• Опоздание более 10 минут = техническое поражение.\n\n5. ДИСЦИПЛИНА\n• Читы = бан.\n• Токсичность = предупреждение → бан.';
        document.getElementById('atc-rules').value = template;
    });
    document.getElementById('atc-back').addEventListener('click', showAdminTournaments);

    document.getElementById('atc-submit').addEventListener('click', async function() {
        const name = document.getElementById('atc-name').value.trim();
        const description = document.getElementById('atc-desc').value.trim();
        const maxTeams = parseInt(document.getElementById('atc-max-teams').value) || 8;
        const minPlayers = parseInt(document.getElementById('atc-min-players').value) || 5;
        const prizeText = document.getElementById('atc-prize-text').value.trim();
        const rules = document.getElementById('atc-rules').value.trim();
        const startDate = document.getElementById('atc-start-date').value.trim();
        const regDeadline = document.getElementById('atc-reg-deadline').value.trim();

        if (!name) return showToast('Введи название');
        if (!prizeText) return showToast('Введи приз');
        if (maxTeams < 2) return showToast('Мин. 2 команды');
        if (minPlayers < 1) return showToast('Мин. 1 игрок');

        const btn = document.getElementById('atc-submit');
        btn.disabled = true; btn.textContent = 'Создание...';

        try {
            const res = await apiPost('/api/admin/tournament/create', {
                admin_id: tgUser.id,
                name: name, description: description,
                mode: selectedMode, map: selectedMap, match_format: selectedFormat,
                bracket_type: 'single',
                max_teams: maxTeams, min_players: minPlayers,
                prize_type: 'custom', prize_value: 0, prize_text: prizeText,
                rules: rules,
                start_date: startDate || null,
                reg_deadline: regDeadline || null,
                is_seasonal: 0
            });
            if (res.error) { showToast(res.error); btn.disabled = false; btn.textContent = 'Создать турнир'; return; }
            showToast('Турнир создан!');
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            showAdminTournaments();
        } catch (e) {
            console.error('Ошибка:', e);
            showToast('Ошибка');
            btn.disabled = false; btn.textContent = 'Создать турнир';
        }
    });
}

async function showAdminTournamentManage(tid) {
    atCurrentId = tid;
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const t = await apiGet('/api/tournament/' + tid);
        const teams = await apiGet('/api/tournament/' + tid + '/teams');
        const matches = await apiGet('/api/tournament/' + tid + '/bracket');
        atCurrentTournament = t;
        atTeams = teams || [];
        atMatches = matches || [];

        let statusText = t.status;
        if (t.status === 'registration') statusText = 'Регистрация открыта';
        else if (t.status === 'closed') statusText = 'Регистрация закрыта';
        else if (t.status === 'active') statusText = 'Идёт';
        else if (t.status === 'finished') statusText = 'Завершён';

        const pendingTeams = atTeams.filter(function(x) { return x.status === 'pending'; });
        const approvedTeams = atTeams.filter(function(x) { return x.status === 'approved'; });

        let html = '';
        html += '<div class="section-head"><button class="section-btn" id="atm-back">' + svg('back', 14) + ' Назад</button><div class="section-title">' + svg('target', 16) + ' Управление</div><div style="width:60px;"></div></div>';
        html += '<div class="admin-section"><div class="admin-section-title">' + svg('trophy', 14) + ' ' + escapeHtml(t.name) + '</div>';
        html += '<div class="admin-user-sub" style="padding:4px 0;">Статус: ' + statusText + '</div>';
        html += '<div class="admin-user-sub" style="padding:4px 0;">' + t.mode + ' · ' + escapeHtml(t.map) + ' · ' + (t.match_format || '').toUpperCase() + '</div>';
        html += '<div class="admin-user-sub" style="padding:4px 0;">Команд: ' + approvedTeams.length + '/' + t.max_teams + ' · Заявок: ' + pendingTeams.length + '</div></div>';

        html += '<div class="admin-section"><div class="admin-section-title">' + svg('target', 14) + ' Управление статусом</div><div class="admin-row" style="flex-wrap:wrap;gap:6px;">';
        if (t.status === 'registration') html += '<button class="admin-btn danger" id="atm-close-reg">' + svg('stop', 14) + ' Закрыть регистрацию</button>';
        if (t.status === 'closed') {
            html += '<button class="admin-btn primary" id="atm-open-reg">' + svg('play', 14) + ' Открыть регистрацию</button>';
            html += '<button class="admin-btn primary" id="atm-gen-bracket">' + svg('refresh', 14) + ' Сгенерировать сетку</button>';
        }
        if (t.status === 'active' || t.status === 'finished') html += '<button class="admin-btn" id="atm-view-bracket">' + svg('grid', 14) + ' Открыть сетку</button>';
        if (t.status === 'active') html += '<button class="admin-btn danger" id="atm-finish">' + svg('stop', 14) + ' Завершить турнир</button>';
        html += '</div></div>';

        if (pendingTeams.length > 0) {
            html += '<div class="admin-section"><div class="admin-section-title">' + svg('inbox', 14) + ' Заявки (' + pendingTeams.length + ')</div>';
            pendingTeams.forEach(function(team) {
                html += '<div class="admin-user-card" style="margin-bottom:8px;"><div class="admin-user-info">';
                html += '<div class="admin-user-nick">' + svg('users', 14) + ' [' + escapeHtml(team.tag) + '] ' + escapeHtml(team.name) + '</div>';
                html += '<div class="admin-user-sub">Капитан: ' + escapeHtml(team.captain_game_nick) + ' · ' + escapeHtml(team.captain_telegram) + '</div></div></div>';
                html += '<div style="display:flex;gap:6px;margin-bottom:14px;">';
                html += '<button class="admin-btn primary" data-atm-approve="' + team.id + '" style="flex:1;">' + svg('check', 14) + ' Принять</button>';
                html += '<button class="admin-btn danger" data-atm-reject="' + team.id + '" style="flex:1;">' + svg('close', 14) + ' Отклонить</button>';
                html += '<button class="admin-btn" data-atm-view-team="' + team.id + '" style="flex:0 0 auto;">' + svg('users', 14) + '</button></div>';
            });
            html += '</div>';
        }

        if (approvedTeams.length > 0) {
            html += '<div class="admin-section"><div class="admin-section-title">' + svg('check', 14) + ' Одобренные (' + approvedTeams.length + ')</div>';
            approvedTeams.forEach(function(team) {
                html += '<div class="admin-user-card" style="margin-bottom:8px;"><div class="admin-user-info">';
                html += '<div class="admin-user-nick">' + svg('check', 14) + ' [' + escapeHtml(team.tag) + '] ' + escapeHtml(team.name) + '</div>';
                html += '<div class="admin-user-sub">Капитан: ' + escapeHtml(team.captain_game_nick) + '</div></div>';
                html += '<button class="admin-btn danger" data-atm-delete-team="' + team.id + '" style="padding:8px 12px;font-size:12px;flex:0 0 auto;">' + svg('trash', 14) + '</button></div>';
            });
            html += '</div>';
        }

        if (atMatches.length > 0) {
            html += '<div class="admin-section"><div class="admin-section-title">' + svg('grid', 14) + ' Матчи (' + atMatches.length + ')</div>';
            atMatches.forEach(function(m) {
                let aName = m.team_a_name ? '[' + (m.team_a_tag || '?') + '] ' + m.team_a_name : 'TBD';
                let bName = m.team_b_name ? '[' + (m.team_b_tag || '?') + '] ' + m.team_b_name : 'TBD';
                let statusLabel = m.status === 'finished' ? 'Завершён' : (m.team_a_id && m.team_b_id ? 'Можно играть' : 'Ожидание');
                let scoreText = m.status === 'finished' ? m.score_a + ' : ' + m.score_b : '— : —';
                html += '<div class="admin-user-card" style="margin-bottom:8px;"><div class="admin-user-info">';
                html += '<div class="admin-user-nick">' + svg('grid', 14) + ' Раунд ' + m.round + ' · ' + statusLabel + '</div>';
                html += '<div class="admin-user-sub">' + escapeHtml(aName) + ' ' + scoreText + ' ' + escapeHtml(bName) + '</div></div>';
                if (m.team_a_id && m.team_b_id && m.status !== 'finished') {
                    html += '<button class="admin-btn primary" data-atm-set-score="' + m.id + '" style="padding:8px 12px;font-size:12px;flex:0 0 auto;">' + svg('edit', 14) + ' Счёт</button>';
                }
                html += '</div>';
            });
            html += '</div>';
        }

        html += '<div class="admin-section"><div class="admin-section-title">' + svg('alert', 14) + ' Опасное</div>';
        html += '<div class="admin-row"><button class="admin-btn danger" id="atm-delete">' + svg('trash', 14) + ' Удалить турнир</button></div></div>';

        container.innerHTML = html;

        document.getElementById('atm-back').addEventListener('click', showAdminTournaments);
        const closeReg = document.getElementById('atm-close-reg');
        if (closeReg) closeReg.addEventListener('click', function() { atmCloseReg(tid); });
        const openReg = document.getElementById('atm-open-reg');
        if (openReg) openReg.addEventListener('click', function() { atmOpenReg(tid); });
        const genBracket = document.getElementById('atm-gen-bracket');
        if (genBracket) genBracket.addEventListener('click', function() { atmGenerateBracket(tid); });
        const finishBtn = document.getElementById('atm-finish');
        if (finishBtn) finishBtn.addEventListener('click', function() { atmFinish(tid); });
        const deleteBtn = document.getElementById('atm-delete');
        if (deleteBtn) deleteBtn.addEventListener('click', function() { atmDelete(tid); });

        const viewBracket = document.getElementById('atm-view-bracket');
        if (viewBracket) viewBracket.addEventListener('click', function() {
            const modal = document.getElementById('tournament-modal');
            if (modal) modal.classList.add('active');
            setTimeout(function() {
                if (typeof tnShowBracket === 'function') {
                    tnShowBracket(tid);
                } else {
                    showToast('Функция сетки не загружена');
                }
            }, 150);
        });

        container.querySelectorAll('[data-atm-approve]').forEach(function(btn) {
            btn.addEventListener('click', function() { atmApproveTeam(parseInt(btn.dataset.atmApprove), tid); });
        });
        container.querySelectorAll('[data-atm-reject]').forEach(function(btn) {
            btn.addEventListener('click', function() { atmRejectTeam(parseInt(btn.dataset.atmReject), tid); });
        });
        container.querySelectorAll('[data-atm-delete-team]').forEach(function(btn) {
            btn.addEventListener('click', function() { atmDeleteTeam(parseInt(btn.dataset.atmDeleteTeam), tid); });
        });
        container.querySelectorAll('[data-atm-view-team]').forEach(function(btn) {
            btn.addEventListener('click', function() { atmViewTeam(parseInt(btn.dataset.atmViewTeam)); });
        });
        container.querySelectorAll('[data-atm-set-score]').forEach(function(btn) {
            btn.addEventListener('click', function() { atmSetScore(parseInt(btn.dataset.atmSetScore), tid); });
        });
    } catch (e) {
        console.error('Ошибка:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

async function atmApproveTeam(teamId, tid) {
    try {
        const res = await apiPost('/api/admin/tournament/team/approve', { admin_id: tgUser.id, team_id: teamId });
        if (res.error) return showToast(res.error);
        showToast('Принято');
        showAdminTournamentManage(tid);
    } catch (e) { showToast('Ошибка'); }
}

async function atmRejectTeam(teamId, tid) {
    if (!confirm('Отклонить команду?')) return;
    try {
        const res = await apiPost('/api/admin/tournament/team/reject', { admin_id: tgUser.id, team_id: teamId });
        if (res.error) return showToast(res.error);
        showToast('Отклонено');
        showAdminTournamentManage(tid);
    } catch (e) { showToast('Ошибка'); }
}

async function atmDeleteTeam(teamId, tid) {
    if (!confirm('Удалить команду?')) return;
    try {
        const res = await apiPost('/api/admin/tournament/team/delete', { admin_id: tgUser.id, team_id: teamId });
        if (res.error) return showToast(res.error);
        showToast('Удалено');
        showAdminTournamentManage(tid);
    } catch (e) { showToast('Ошибка'); }
}

async function atmViewTeam(teamId) {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';
    try {
        const team = await apiGet('/api/tournament/team/' + teamId);
        if (!team || team.error) { container.innerHTML = '<div class="map-empty">Не найдена</div>'; return; }
        let html = '';
        html += '<div class="section-head"><button class="section-btn" id="atm-team-back">' + svg('back', 14) + ' Назад</button><div class="section-title">' + svg('users', 16) + ' ' + escapeHtml(team.name) + '</div><div style="width:60px;"></div></div>';
        html += '<div class="admin-section"><div class="admin-section-title">' + svg('crown', 14) + ' Капитан</div><div class="admin-user-sub">' + escapeHtml(team.captain_game_nick) + ' · ' + escapeHtml(team.captain_telegram) + '</div></div>';
        html += '<div class="admin-section"><div class="admin-section-title">' + svg('users', 14) + ' Состав</div>';
        (team.players || []).forEach(function(p) {
            let roleLabel = p.role === 'captain' ? 'Капитан' : 'Игрок';
            let roleIcon = p.role === 'captain' ? svg('crown', 12) : svg('users', 12);
            html += '<div class="admin-user-card" style="margin-bottom:6px;"><div class="admin-user-info"><div class="admin-user-nick">' + roleIcon + ' ' + escapeHtml(p.game_nick) + '</div><div class="admin-user-sub">ID: ' + escapeHtml(p.game_id) + ' · ' + roleLabel + '</div></div></div>';
        });
        html += '</div>';
        container.innerHTML = html;
        document.getElementById('atm-team-back').addEventListener('click', function() {
            showAdminTournamentManage(atCurrentId);
        });
    } catch (e) { container.innerHTML = '<div class="map-empty">Ошибка</div>'; }
}

async function atmCloseReg(tid) {
    if (!confirm('Закрыть регистрацию?')) return;
    try {
        const res = await apiPost('/api/admin/tournament/close_registration', { admin_id: tgUser.id, tournament_id: tid });
        if (res.error) return showToast(res.error);
        showToast('Регистрация закрыта');
        showAdminTournamentManage(tid);
    } catch (e) { showToast('Ошибка'); }
}

async function atmOpenReg(tid) {
    try {
        const res = await apiPost('/api/admin/tournament/edit', { admin_id: tgUser.id, tournament_id: tid, status: 'registration' });
        if (res.error) return showToast(res.error);
        showToast('Регистрация открыта');
        showAdminTournamentManage(tid);
    } catch (e) { showToast('Ошибка'); }
}

async function atmGenerateBracket(tid) {
    if (!confirm('Сгенерировать сетку?')) return;
    try {
        const res = await apiPost('/api/admin/tournament/generate_bracket', { admin_id: tgUser.id, tournament_id: tid });
        if (res.error) return showToast(res.error);
        showToast('Сетка создана: ' + res.matches + ' матчей');
        showAdminTournamentManage(tid);
    } catch (e) { showToast('Ошибка'); }
}

async function atmFinish(tid) {
    const winnerId = prompt('ID команды-победителя (или Cancel):');
    if (winnerId === null) return;
    if (!confirm('Завершить турнир?')) return;
    try {
        const res = await apiPost('/api/admin/tournament/finish', {
            admin_id: tgUser.id, tournament_id: tid,
            winner_team_id: winnerId ? parseInt(winnerId) : null
        });
        if (res.error) return showToast(res.error);
        showToast('Турнир завершён');
        showAdminTournamentManage(tid);
    } catch (e) { showToast('Ошибка'); }
}

async function atmDelete(tid) {
    if (!confirm('Удалить турнир?') || !confirm('Точно?')) return;
    try {
        const res = await apiPost('/api/admin/tournament/delete', { admin_id: tgUser.id, tournament_id: tid });
        if (res.error) return showToast(res.error);
        showToast('Удалено');
        showAdminTournaments();
    } catch (e) { showToast('Ошибка'); }
}

async function atmSetScore(matchId, tid) {
    const scoreA = prompt('Счёт команды A:');
    if (scoreA === null) return;
    const scoreB = prompt('Счёт команды B:');
    if (scoreB === null) return;
    const a = parseInt(scoreA); const b = parseInt(scoreB);
    if (isNaN(a) || isNaN(b)) return showToast('Введи числа');
    if (a === b) return showToast('Нельзя ничья');
    try {
        const res = await apiPost('/api/admin/tournament/match/set_score', {
            admin_id: tgUser.id, match_id: matchId, score_a: a, score_b: b
        });
        if (res.error) return showToast(res.error);
        showToast('Счёт сохранён');
        showAdminTournamentManage(tid);
    } catch (e) { showToast('Ошибка'); }
}

function closeAdmin() {
    const modal = document.getElementById('tournament-modal');
    if (modal) modal.classList.remove('active');
}

console.log('=== admin-tournaments.js DONE ===');
