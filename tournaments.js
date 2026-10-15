// ==== ТУРНИРЫ (игровой код) ====
console.log('=== tournaments.js START ===');

let tnFilter = 'all';
let tnList = [];
let tnCurrentTid = null;
let tnCurrentTournament = null;
let tnCurrentTeamId = null;
let tnHistoryStack = [];
let tnBracketZoom = 1;

function openTournamentsModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;
    modal.classList.add('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    tnHistoryStack = [];
    tnShowList();
}

function closeTournamentsModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;
    modal.classList.remove('active');
}

function tnHeader(title, subtitle, showBack) {
    document.getElementById('tn-title').textContent = title;
    document.getElementById('tn-subtitle').textContent = subtitle || '';
    const backBtn = document.getElementById('tn-back-btn');
    if (backBtn) backBtn.style.display = showBack ? 'flex' : 'none';
    const filters = document.getElementById('tn-filters');
    if (filters) filters.style.display = 'none';
}

function tnBack() {
    if (tnHistoryStack.length > 0) {
        const prev = tnHistoryStack.pop();
        if (prev === 'list') tnShowList();
        else if (prev.screen === 'details') tnShowDetails(prev.tid, true);
    } else {
        closeTournamentsModal();
    }
}

async function tnShowList() {
    tnHeader('Турниры', 'Выбери турнир', false);
    const filters = document.getElementById('tn-filters');
    if (filters) filters.style.display = 'flex';
    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';
    try {
        const list = await apiGet('/api/tournaments/list');
        tnList = list || [];
        tnRenderList(list || []);
    } catch (e) {
        console.error('Ошибка:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}

function tnRenderList(list) {
    const body = document.getElementById('tn-body');
    let filtered = list;
    if (tnFilter !== 'all') {
        filtered = list.filter(function(t) { return t.status === tnFilter; });
    }
    if (!filtered || filtered.length === 0) {
        body.innerHTML = '<div class="tn-empty">Турниров пока нет</div>';
        return;
    }
    let html = '';
    filtered.forEach(function(t) {
        let statusText = t.status;
        if (t.status === 'registration') statusText = 'Регистрация';
        else if (t.status === 'closed') statusText = 'Регистрация закрыта';
        else if (t.status === 'active') statusText = 'Идёт';
        else if (t.status === 'finished') statusText = 'Завершён';
        let startDate = (t.start_date || '').substring(0, 16).replace('T', ' ');
        let teamsCount = t.teams_count || 0;
        let fmt = t.match_format ? t.match_format.toUpperCase() : '';
        html += '<div class="tn-card" data-tid="' + t.id + '">';
        html += '<div class="tn-card-head">';
        html += '<div class="tn-card-title">' + escapeHtml(t.name) + '</div>';
        html += '<div class="tn-status ' + t.status + '">' + statusText + '</div>';
        html += '</div>';
        if (t.description) html += '<div class="tn-card-desc">' + escapeHtml(t.description) + '</div>';
        html += '<div class="tn-card-meta">';
        html += '<span>' + t.mode + '</span>';
        html += '<span>' + escapeHtml(t.map) + '</span>';
        if (fmt) html += '<span>' + fmt + '</span>';
        html += '</div>';
        html += '<div class="tn-card-footer">';
        html += '<span>' + (startDate || 'Дата не указана') + '</span>';
        html += '<span class="tn-card-teams">' + teamsCount + '/' + t.max_teams + '</span>';
        html += '</div>';
        html += '</div>';
    });
    body.innerHTML = html;
    body.querySelectorAll('.tn-card[data-tid]').forEach(function(card) {
        card.addEventListener('click', function() {
            tnShowDetails(parseInt(card.dataset.tid));
        });
    });
}

async function tnShowDetails(tid, isBack) {
    tnCurrentTid = tid;
    if (!isBack) tnHistoryStack.push('list');
    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';
    try {
        const t = await apiGet('/api/tournament/' + tid);
        const teams = await apiGet('/api/tournament/' + tid + '/teams?status=approved');
        tnCurrentTournament = t;
        tnHeader(t.name, 'ID #' + tid, true);
        await tnRenderDetails(t, teams || []);
    } catch (e) {
        console.error('Ошибка деталей:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}

async function tnRenderDetails(t, teams) {
    const body = document.getElementById('tn-body');
    let statusText = t.status;
    if (t.status === 'registration') statusText = 'Регистрация открыта';
    else if (t.status === 'closed') statusText = 'Регистрация закрыта';
    else if (t.status === 'active') statusText = 'Идёт';
    else if (t.status === 'finished') statusText = 'Завершён';
    let startDate = (t.start_date || '').substring(0, 16).replace('T', ' ');
    let deadline = (t.reg_deadline || '').substring(0, 16).replace('T', ' ');
    let bannerStyle = t.banner_url ? 'style="background-image:url(\'' + t.banner_url + '\')"' : '';
    let html = '';
    html += '<div class="tn-banner" ' + bannerStyle + '>';
    html += '<div class="tn-banner-overlay">';
    html += '<div class="tn-banner-title">' + escapeHtml(t.name) + '</div>';
    html += '<div class="tn-banner-sub">' + statusText + '</div>';
    html += '</div></div>';
    html += '<div class="tn-section"><div class="tn-section-title">Информация</div>';
    html += '<div class="tn-info-grid">';
    html += '<div class="tn-info-item"><div class="tn-info-label">Режим</div><div class="tn-info-value">' + escapeHtml(t.mode) + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Карта</div><div class="tn-info-value">' + escapeHtml(t.map) + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Формат</div><div class="tn-info-value">' + (t.match_format || '—').toUpperCase() + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Макс. команд</div><div class="tn-info-value">' + t.max_teams + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Мин. игроков</div><div class="tn-info-value">' + t.min_players + '</div></div>';
    html += '</div></div>';
    let prizeText = t.prize_text || '—';
    if (!t.prize_text) {
        if (t.prize_type === 'coins') prizeText = t.prize_value + ' монет';
        else if (t.prize_type === 'vip') prizeText = 'VIP на ' + t.prize_value + ' дн.';
        else if (t.prize_type === 'elo') prizeText = '+' + t.prize_value + ' ELO';
    }
    html += '<div class="tn-section"><div class="tn-section-title">Приз</div>';
    html += '<div class="tn-info-item"><div class="tn-info-value prize">' + escapeHtml(prizeText) + '</div></div></div>';
    html += '<div class="tn-section"><div class="tn-section-title">Даты</div>';
    html += '<div class="tn-info-grid">';
    html += '<div class="tn-info-item"><div class="tn-info-label">Начало</div><div class="tn-info-value">' + (startDate || '—') + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Дедлайн</div><div class="tn-info-value">' + (deadline || '—') + '</div></div>';
    html += '</div></div>';
    if (t.description) {
        html += '<div class="tn-section"><div class="tn-section-title">Описание</div>';
        html += '<div class="tn-rules-body">' + escapeHtml(t.description) + '</div></div>';
    }
    if (t.rules) {
        html += '<div class="tn-section"><button class="tn-rules-btn" id="tn-open-rules">Правила турнира</button></div>';
    }
    if (t.status === 'registration') {
        html += '<button class="tn-register-btn" id="tn-register-btn">Зарегистрировать команду</button>';
    }
    if (t.status === 'active' || t.status === 'finished') {
        html += '<div class="tn-section"><div style="display:flex;gap:8px;">';
        html += '<button class="tn-rules-btn" id="tn-open-bracket" style="flex:1;">Сетка</button>';
        html += '<button class="tn-rules-btn" id="tn-open-history" style="flex:1;">История</button>';
        html += '</div></div>';
    }
    let myMatchesHtml = '';
    if (typeof trRenderMyMatchesBlock === 'function') {
        try {
            myMatchesHtml = await trRenderMyMatchesBlock(t.id);
        } catch (e) {
            console.error('Ошибка my matches:', e);
        }
    }
    html += myMatchesHtml;
    html += '<div class="tn-section">';
    html += '<div class="tn-section-title">Участники (' + teams.length + '/' + t.max_teams + ')</div>';
    if (teams.length === 0) {
        html += '<div class="tn-empty" style="padding:20px;">Пока никто не зарегистрирован</div>';
    } else {
        html += '<div class="tn-teams-list">';
        teams.forEach(function(team) {
            let logoText = (team.tag || '?').substring(0, 2).toUpperCase();
            let logoStyle = team.logo_url ? 'style="background-image:url(\'' + team.logo_url + '\')"' : '';
            html += '<div class="tn-team-card" data-team-id="' + team.id + '">';
            html += '<div class="tn-team-logo" ' + logoStyle + '>' + (team.logo_url ? '' : logoText) + '</div>';
            html += '<div class="tn-team-info">';
            html += '<div class="tn-team-name">[' + escapeHtml(team.tag) + '] ' + escapeHtml(team.name) + '</div>';
            html += '<div class="tn-team-cap">Капитан: ' + escapeHtml(team.captain_game_nick) + '</div>';
            html += '</div></div>';
        });
        html += '</div>';
    }
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.tn-team-card[data-team-id]').forEach(function(card) {
        card.addEventListener('click', function() {
            tnShowTeam(parseInt(card.dataset.teamId));
        });
    });
    const regBtn = document.getElementById('tn-register-btn');
    if (regBtn) regBtn.addEventListener('click', function() { tnShowRegister(t.id); });
    const rulesBtn = document.getElementById('tn-open-rules');
    if (rulesBtn) rulesBtn.addEventListener('click', function() { tnShowRules(t.id); });
    const bracketBtn = document.getElementById('tn-open-bracket');
    if (bracketBtn) bracketBtn.addEventListener('click', function() { tnShowBracket(t.id); });
    const historyBtn = document.getElementById('tn-open-history');
    if (historyBtn) historyBtn.addEventListener('click', function() { tnShowHistory(t.id); });
    body.querySelectorAll('[data-tr-submit]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            trOpenSubmitForm(parseInt(btn.dataset.trSubmit));
        });
    });
    body.querySelectorAll('[data-tr-view-details]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            trOpenMatchDetails(parseInt(btn.dataset.trViewDetails));
        });
    });
}

function tnShowRules(tid) {
    const t = tnCurrentTournament;
    if (!t) return;
    tnHistoryStack.push({ screen: 'details', tid: tid });
    tnHeader('Правила', t.name, true);
    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-section"><div class="tn-rules-body">' + escapeHtml(t.rules || 'Правила не заданы') + '</div></div>';
}

async function tnShowTeam(teamId, isBack) {
    tnCurrentTeamId = teamId;
    if (!isBack) tnHistoryStack.push({ screen: 'details', tid: tnCurrentTid });
    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';
    try {
        const team = await apiGet('/api/tournament/team/' + teamId);
        if (!team || team.error) {
            body.innerHTML = '<div class="tn-empty">Команда не найдена</div>';
            return;
        }
        tnHeader(team.name, '[' + team.tag + ']', true);
        let logoText = (team.tag || '?').substring(0, 2).toUpperCase();
        let logoStyle = team.logo_url ? 'style="background-image:url(\'' + team.logo_url + '\')"' : '';
        let html = '';
        html += '<div class="tn-section" style="text-align:center;">';
        html += '<div style="width:80px;height:80px;margin:0 auto 12px;border-radius:16px;background:linear-gradient(135deg,#a855f7,#7c3aed);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;border:1px solid rgba(192,132,252,0.3);"' + (team.logo_url ? ' ' + logoStyle : '') + '>' + (team.logo_url ? '' : logoText) + '</div>';
        html += '<div style="font-size:18px;font-weight:700;color:#f0e9ff;">' + escapeHtml(team.name) + ' <span style="color:#c084fc;">[' + escapeHtml(team.tag) + ']</span></div>';
        html += '<div style="font-size:12px;color:#8b7fb8;margin-top:6px;">Капитан: ' + escapeHtml(team.captain_game_nick) + ' · ' + escapeHtml(team.captain_telegram) + '</div>';
        html += '</div>';
        html += '<div class="tn-section"><div class="tn-section-title">Состав (' + (team.players || []).length + ')</div>';
        html += '<div class="tn-teams-list">';
        (team.players || []).forEach(function(p) {
            let roleLabel = p.role === 'captain' ? 'Капитан' : 'Игрок';
            html += '<div class="tn-team-card" style="cursor:default;">';
            html += '<div class="tn-team-logo">' + (p.game_nick || '?').substring(0, 2).toUpperCase() + '</div>';
            html += '<div class="tn-team-info">';
            html += '<div class="tn-team-name">' + escapeHtml(p.game_nick) + '</div>';
            html += '<div class="tn-team-cap">ID: ' + escapeHtml(p.game_id) + ' · ' + roleLabel + '</div>';
            html += '</div></div>';
        });
        html += '</div></div>';
        body.innerHTML = html;
    } catch (e) {
        console.error('Ошибка команды:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}

function tnShowRegister(tid) {
    tnHistoryStack.push({ screen: 'details', tid: tid });
    const t = tnCurrentTournament;
    if (!t) return;
    tnHeader('Регистрация команды', t.name, true);
    const body = document.getElementById('tn-body');
    const minPlayers = t.min_players || 1;
    const extraPlayers = Math.max(0, minPlayers - 1);
    let playersHtml = '';
    for (let i = 0; i < extraPlayers; i++) {
        playersHtml += '<div class="tn-player-block">';
        playersHtml += '<div class="tn-player-title">Игрок ' + (i + 2) + '</div>';
        playersHtml += '<div class="tn-field"><label class="tn-label">Игровой ID <span class="req">*</span></label><input class="tn-input" data-player-idx="' + i + '" data-field="game_id" placeholder="Например: 123456" maxlength="30"></div>';
        playersHtml += '<div class="tn-field" style="margin-bottom:0;"><label class="tn-label">Игровой ник <span class="req">*</span></label><input class="tn-input" data-player-idx="' + i + '" data-field="game_nick" placeholder="Ник в игре" maxlength="30"></div>';
        playersHtml += '</div>';
    }
    let html = '<div class="tn-form">';
    html += '<div class="tn-field"><label class="tn-label">Название команды <span class="req">*</span></label>';
    html += '<input class="tn-input" id="tn-team-name" placeholder="Team Liquid" maxlength="24">';
    html += '<div class="tn-hint">3-24 символа</div></div>';
    html += '<div class="tn-field"><label class="tn-label">Тег команды <span class="req">*</span></label>';
    html += '<input class="tn-input" id="tn-team-tag" placeholder="TLQ" maxlength="5" style="text-transform:uppercase;">';
    html += '<div class="tn-hint">2-5 символов, латиница и цифры</div></div>';
    html += '<div class="tn-player-block">';
    html += '<div class="tn-player-title">Капитан (ты)</div>';
    html += '<div class="tn-field"><label class="tn-label">Игровой ID <span class="req">*</span></label><input class="tn-input" id="tn-captain-id" placeholder="Твой ID в игре" maxlength="30"></div>';
    html += '<div class="tn-field"><label class="tn-label">Игровой ник <span class="req">*</span></label><input class="tn-input" id="tn-captain-nick" placeholder="Твой ник в игре" maxlength="30"></div>';
    html += '<div class="tn-field" style="margin-bottom:0;"><label class="tn-label">Твой Telegram <span class="req">*</span></label><input class="tn-input" id="tn-captain-tg" placeholder="@username" maxlength="32"></div>';
    html += '<div class="tn-hint">Для связи админа с капитаном</div>';
    html += '</div>';
    html += playersHtml;
    html += '<div class="tn-check"><input type="checkbox" id="tn-agree-data"><label for="tn-agree-data">Подтверждаю правильность данных</label></div>';
    html += '<div class="tn-check"><input type="checkbox" id="tn-agree-rules"><label for="tn-agree-rules">Согласен с правилами</label></div>';
    html += '<button class="tn-submit-btn" id="tn-submit-register">Зарегистрировать</button>';
    html += '</div>';
    body.innerHTML = html;
    document.getElementById('tn-submit-register').addEventListener('click', async function() {
        const name = document.getElementById('tn-team-name').value.trim();
        const tag = document.getElementById('tn-team-tag').value.trim().toUpperCase();
        const captainId = document.getElementById('tn-captain-id').value.trim();
        const captainNick = document.getElementById('tn-captain-nick').value.trim();
        const captainTg = document.getElementById('tn-captain-tg').value.trim();
        const agreeData = document.getElementById('tn-agree-data').checked;
        const agreeRules = document.getElementById('tn-agree-rules').checked;
        if (!name || name.length < 3 || name.length > 24) return showToast('Название: 3-24 символа');
        if (!tag || tag.length < 2 || tag.length > 5) return showToast('Тег: 2-5 символов');
        if (!/^[A-Z0-9]+$/.test(tag)) return showToast('Тег: только латиница и цифры');
        if (!captainId) return showToast('Укажи игровой ID капитана');
        if (!captainNick) return showToast('Укажи игровой ник капитана');
        if (!captainTg) return showToast('Укажи Telegram капитана');
        if (!agreeData) return showToast('Подтверди данные');
        if (!agreeRules) return showToast('Согласись с правилами');
        const players = [];
        for (let i = 0; i < extraPlayers; i++) {
            const pid = document.querySelector('[data-player-idx="' + i + '"][data-field="game_id"]').value.trim();
            const pnick = document.querySelector('[data-player-idx="' + i + '"][data-field="game_nick"]').value.trim();
            if (!pid || !pnick) return showToast('Заполни всех игроков');
            players.push({ game_id: pid, game_nick: pnick });
        }
        const btn = document.getElementById('tn-submit-register');
        btn.disabled = true;
        btn.textContent = 'Отправка...';
        try {
            const res = await apiPost('/api/tournament/register', {
                tournament_id: tid,
                name: name,
                tag: tag,
                logo_url: null,
                captain_id: tgUser.id,
                captain_game_id: captainId,
                captain_game_nick: captainNick,
                captain_telegram: captainTg,
                players: players
            });
            if (res.error) {
                showToast(res.error);
                btn.disabled = false;
                btn.textContent = 'Зарегистрировать';
                return;
            }
            showToast('Заявка отправлена!');
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            tnShowDetails(tid);
        } catch (e) {
            console.error('Ошибка регистрации:', e);
            showToast('Ошибка отправки');
            btn.disabled = false;
            btn.textContent = 'Зарегистрировать';
        }
    });
}

async function tnShowBracket(tid, isBack) {
    if (!isBack) tnHistoryStack.push({ screen: 'details', tid: tid });
    tnHeader('Сетка', tnCurrentTournament ? tnCurrentTournament.name : '', true);
    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';
    try {
        const matches = await apiGet('/api/tournament/' + tid + '/bracket');
        tnRenderBracket(tid, matches || []);
    } catch (e) {
        console.error('Ошибка сетки:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки сетки</div>';
    }
}

function tnRenderBracket(tid, matches) {
    const body = document.getElementById('tn-body');
    if (!matches || matches.length === 0) {
        body.innerHTML = '<div class="tn-empty">Сетка ещё не сгенерирована</div>';
        return;
    }
    const byRound = {};
    matches.forEach(function(m) {
        if (!byRound[m.round]) byRound[m.round] = [];
        byRound[m.round].push(m);
    });
    const rounds = Object.keys(byRound).sort(function(a, b) { return a - b; });
    let roundNames = {};
    rounds.forEach(function(r) {
        const matchesLeft = byRound[r].length;
        if (matchesLeft === 1) roundNames[r] = 'Финал';
        else if (matchesLeft === 2) roundNames[r] = '1/2';
        else if (matchesLeft === 4) roundNames[r] = '1/4';
        else if (matchesLeft === 8) roundNames[r] = '1/8';
        else roundNames[r] = 'Раунд ' + r;
    });
    let html = '<div class="tn-bracket-wrap" id="tn-bracket-wrap">';
    html += '<div class="tn-bracket-canvas" id="tn-bracket-canvas">';
    html += '<div class="tn-bracket-rounds">';
    rounds.forEach(function(r) {
        html += '<div class="tn-bracket-round">';
        html += '<div class="tn-bracket-round-title">' + (roundNames[r] || 'Раунд ' + r) + '</div>';
        byRound[r].forEach(function(m) {
            const aWon = m.winner_id && m.team_a_id && m.winner_id === m.team_a_id;
            const bWon = m.winner_id && m.team_b_id && m.winner_id === m.team_b_id;
            let aName = m.team_a_name ? '[' + (m.team_a_tag || '?') + '] ' + m.team_a_name : 'TBD';
            let bName = m.team_b_name ? '[' + (m.team_b_tag || '?') + '] ' + m.team_b_name : 'TBD';
            html += '<div class="tn-match ' + (aWon ? 'winner-a' : '') + (bWon ? 'winner-b' : '') + '" data-match-id="' + m.id + '">';
            html += '<div class="tn-match-team ' + (aWon ? 'winner' : (m.status === 'finished' ? 'loser' : '')) + '">';
            html += '<span class="tn-match-team-name">' + escapeHtml(aName) + '</span>';
            html += '<span class="tn-match-score">' + (m.status === 'finished' ? m.score_a : '—') + '</span>';
            html += '</div>';
            html += '<div class="tn-match-team ' + (bWon ? 'winner' : (m.status === 'finished' ? 'loser' : '')) + '">';
            html += '<span class="tn-match-team-name">' + escapeHtml(bName) + '</span>';
            html += '<span class="tn-match-score">' + (m.status === 'finished' ? m.score_b : '—') + '</span>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
    });
    html += '</div></div>';
    html += '<div class="tn-bracket-controls">';
    html += '<button class="tn-zoom-btn" id="tn-zoom-out">-</button>';
    html += '<div class="tn-zoom-level" id="tn-zoom-level">100%</div>';
    html += '<button class="tn-zoom-btn" id="tn-zoom-in">+</button>';
    html += '<button class="tn-zoom-btn" id="tn-zoom-reset">Сброс</button>';
    html += '</div></div>';
    body.innerHTML = html;
    tnInitBracketZoom();
}

function tnInitBracketZoom() {
    const canvas = document.getElementById('tn-bracket-canvas');
    if (!canvas) return;
    tnBracketZoom = 1;
    canvas.style.transform = 'scale(1)';
    const zoomIn = document.getElementById('tn-zoom-in');
    const zoomOut = document.getElementById('tn-zoom-out');
    const zoomReset = document.getElementById('tn-zoom-reset');
    const level = document.getElementById('tn-zoom-level');
    function apply() {
        canvas.style.transform = 'scale(' + tnBracketZoom + ')';
        if (level) level.textContent = Math.round(tnBracketZoom * 100) + '%';
    }
    if (zoomIn) zoomIn.addEventListener('click', function() { tnBracketZoom = Math.min(tnBracketZoom * 1.3, 3); apply(); });
    if (zoomOut) zoomOut.addEventListener('click', function() { tnBracketZoom = Math.max(tnBracketZoom / 1.3, 0.3); apply(); });
    if (zoomReset) zoomReset.addEventListener('click', function() { tnBracketZoom = 1; apply(); });
}

async function tnShowHistory(tid, isBack) {
    if (!isBack) tnHistoryStack.push({ screen: 'details', tid: tid });
    tnHeader('История матчей', tnCurrentTournament ? tnCurrentTournament.name : '', true);
    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';
    try {
        const data = await apiGet('/api/tournament/' + tid + '/matches');
        const matches = (data.matches || []).filter(function(m) { return m.status === 'finished'; });
        const t = data.tournament || tnCurrentTournament || {};
        if (matches.length === 0) {
            body.innerHTML = '<div class="tn-empty">Матчей пока нет</div>';
            return;
        }
        let html = '';
        matches.forEach(function(m) {
            let roundName = 'Раунд ' + m.round;
            const aWon = m.winner_id && m.team_a_id && m.winner_id === m.team_a_id;
            const bWon = m.winner_id && m.team_b_id && m.winner_id === m.team_b_id;
            let aName = m.team_a_name ? '[' + (m.team_a_tag || '?') + '] ' + m.team_a_name : 'TBD';
            let bName = m.team_b_name ? '[' + (m.team_b_tag || '?') + '] ' + m.team_b_name : 'TBD';
            let date = (m.finished_at || '').substring(0, 16).replace('T', ' ');
            html += '<div class="tn-history-item" data-match-id="' + m.id + '" style="cursor:pointer;">';
            html += '<div class="tn-history-round">' + roundName + ' · ' + ((t.match_format || 'bo3').toUpperCase()) + ' · ' + escapeHtml(t.map || '—') + '</div>';
            html += '<div class="tn-history-teams">';
            html += '<div class="tn-history-team ' + (aWon ? 'winner' : '') + '">' + escapeHtml(aName) + '</div>';
            html += '<div class="tn-history-score">' + m.score_a + ' : ' + m.score_b + '</div>';
            html += '<div class="tn-history-team right ' + (bWon ? 'winner' : '') + '">' + escapeHtml(bName) + '</div>';
            html += '</div>';
            html += '<div class="tn-history-meta"><span>' + (date || '—') + '</span><span>Нажми для подробностей</span></div>';
            html += '</div>';
        });
        body.innerHTML = html;
        body.querySelectorAll('.tn-history-item[data-match-id]').forEach(function(el) {
            el.addEventListener('click', function() {
                trOpenMatchDetails(parseInt(el.dataset.matchId));
            });
        });
    } catch (e) {
        console.error('Ошибка истории:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}

function tnInitHandlers() {
    const openBtn = document.getElementById('btn-open-tournaments');
    if (openBtn) openBtn.addEventListener('click', openTournamentsModal);
    const closeBtn = document.getElementById('tn-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeTournamentsModal);
    const backBtn = document.getElementById('tn-back-btn');
    if (backBtn) backBtn.addEventListener('click', tnBack);
    document.querySelectorAll('.tn-filter').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tn-filter').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            tnFilter = btn.dataset.filter;
            tnRenderList(tnList);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tnInitHandlers);
} else {
    tnInitHandlers();
}

window.tnInitHandlers = tnInitHandlers;
console.log('=== tournaments.js DONE ===');
