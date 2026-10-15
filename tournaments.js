// ==== SVG-ИКОНКИ ====
const T_ICONS = {
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v7a6 6 0 0 1-12 0z"/><path d="M9 21h6"/><path d="M12 16v5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3.5-6 7-6s7 2 7 6"/><circle cx="18" cy="9" r="2.5"/><path d="M15.5 21c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M1 6l8-4 6 4 8-4v18l-8 4-6-4-8 4z"/><path d="M9 2v20M15 4v20"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M20 12a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 5v2M13 11v2M13 17v2"/></svg>',
    scroll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 5v14M5 12h14"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M5 12.5l5 5 9-11"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%;"><path d="M6 4l14 8-14 8z"/></svg>',
    zoomIn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>',
    zoomOut: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35M8 11h6"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/></svg>'
};

function tSvg(name, size) {
    const s = size || 16;
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + s + 'px;height:' + s + 'px;">' + (T_ICONS[name] || '') + '</span>';
}

// ==== СОСТОЯНИЕ ====
let tourneyState = {
    currentScreen: 'list',   // list | details | register | bracket | history | team | rules
    currentTournamentId: null,
    currentTournament: null,
    currentTeamId: null,
    currentBracketTeamId: null,
    currentFilter: 'all',
    teamsCache: [],
    historyStack: []
};

// ==== ОТКРЫТИЕ / ЗАКРЫТИЕ ====
function openTournamentsModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;
    modal.classList.add('active');
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    tourneyState.historyStack = [];
    showTourneyList();
}

function closeTournamentsModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;
    modal.classList.remove('active');
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function tnSetHeader(title, subtitle, showBack) {
    document.getElementById('tn-title').textContent = title;
    document.getElementById('tn-subtitle').textContent = subtitle || '';
    const backBtn = document.getElementById('tn-back-btn');
    if (backBtn) backBtn.style.display = showBack ? 'flex' : 'none';
    const filters = document.getElementById('tn-filters');
    if (filters) filters.style.display = 'none';
}

function tnGoBack() {
    if (tourneyState.historyStack.length > 0) {
        const prev = tourneyState.historyStack.pop();
        if (prev.screen === 'list') showTourneyList(true);
        else if (prev.screen === 'details') showTourneyDetails(prev.tid, true);
        else if (prev.screen === 'bracket') showTourneyBracket(prev.tid, true);
        else if (prev.screen === 'history') showTourneyHistory(prev.tid, true);
        else if (prev.screen === 'team') showTourneyTeam(prev.teamId, true);
    } else {
        closeTournamentsModal();
    }
}

// ==== СПИСОК ТУРНИРОВ ====
async function showTourneyList(isBack) {
    tourneyState.currentScreen = 'list';
    if (!isBack) tourneyState.historyStack = [];
    tnSetHeader('Турниры', 'Выбери турнир', false);

    const filters = document.getElementById('tn-filters');
    if (filters) filters.style.display = 'flex';

    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';

    try {
        const list = await apiGet('/api/tournaments/list');
        renderTourneyList(list || []);
    } catch (e) {
        console.error('Ошибка турниров:', e);
        body.innerHTML = '<div class="tn-empty">' + tSvg('trophy', 60) + '<div>Ошибка загрузки</div></div>';
    }
}

function renderTourneyList(list) {
    const body = document.getElementById('tn-body');
    const filter = tourneyState.currentFilter;

    let filtered = list;
    if (filter !== 'all') filtered = list.filter(t => t.status === filter);

    if (!filtered || filtered.length === 0) {
        body.innerHTML = '<div class="tn-empty">' + tSvg('trophy', 60) + '<div>Турниров пока нет</div></div>';
        return;
    }

    let html = '';
    filtered.forEach(t => {
        const statusText = {
            'registration': 'Регистрация',
            'closed': 'Регистрация закрыта',
            'active': 'Идёт',
            'finished': 'Завершён'
        }[t.status] || t.status;

        const startDate = (t.start_date || '').substring(0, 16).replace('T', ' ');
        const teamsCount = t.teams_count || 0;

        html += '<div class="tn-card" data-tid="' + t.id + '">';
        html += '<div class="tn-card-head">';
        html += '<div class="tn-card-title">' + tSvg('trophy', 18) + escapeHtml(t.name) + '</div>';
        html += '<div class="tn-status ' + t.status + '">' + statusText + '</div>';
        html += '</div>';

        if (t.description) {
            html += '<div class="tn-card-desc">' + escapeHtml(t.description) + '</div>';
        }

        html += '<div class="tn-card-meta">';
        html += '<span>' + tSvg('users', 12) + ' ' + t.mode + '</span>';
        html += '<span>' + tSvg('map', 12) + ' ' + escapeHtml(t.map) + '</span>';
        if (t.match_format) html += '<span>' + tSvg('grid', 12) + ' ' + t.match_format.toUpperCase() + '</span>';
        html += '</div>';

        html += '<div class="tn-card-footer">';
        html += '<span>' + (startDate || 'Дата не указана') + '</span>';
        html += '<span class="tn-card-teams">' + tSvg('users', 13) + ' ' + teamsCount + '/' + t.max_teams + '</span>';
        html += '</div>';
        html += '</div>';
    });

    body.innerHTML = html;

    body.querySelectorAll('.tn-card[data-tid]').forEach(card => {
        card.addEventListener('click', () => {
            const tid = parseInt(card.dataset.tid);
            showTourneyDetails(tid);
        });
    });
}

// ==== ФИЛЬТРЫ ====
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tn-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tn-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tourneyState.currentFilter = btn.dataset.filter;
            showTourneyList(true);
        });
    });

    const backBtn = document.getElementById('tn-back-btn');
    if (backBtn) backBtn.addEventListener('click', tnGoBack);

    const closeBtn = document.getElementById('tn-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeTournamentsModal);

    const openBtn = document.getElementById('btn-open-tournaments');
    if (openBtn) openBtn.addEventListener('click', openTournamentsModal);
});

// ==== ДЕТАЛИ ТУРНИРА ====
async function showTourneyDetails(tid, isBack) {
    tourneyState.currentScreen = 'details';
    tourneyState.currentTournamentId = tid;

    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';

    try {
        const t = await apiGet('/api/tournament/' + tid);
        const teams = await apiGet('/api/tournament/' + tid + '/teams?status=approved');

        tourneyState.currentTournament = t;
        tourneyState.teamsCache = teams || [];

        tnSetHeader(t.name, 'ID #' + tid, true);

        renderTourneyDetails(t, teams || []);
    } catch (e) {
        console.error('Ошибка турнира:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}

function renderTourneyDetails(t, teams) {
    const body = document.getElementById('tn-body');

    const statusText = {
        'registration': 'Регистрация открыта',
        'closed': 'Регистрация закрыта',
        'active': 'Идёт',
        'finished': 'Завершён'
    }[t.status] || t.status;

    const startDate = (t.start_date || '').substring(0, 16).replace('T', ' ');
    const deadline = (t.reg_deadline || '').substring(0, 16).replace('T', ' ');

    const bannerStyle = t.banner_url ? 'style="background-image:url(\'' + t.banner_url + '\')"' : '';

    let html = '';

    // Баннер
    html += '<div class="tn-banner" ' + bannerStyle + '>';
    html += '<div class="tn-banner-overlay">';
    html += '<div class="tn-banner-title">' + escapeHtml(t.name) + '</div>';
    html += '<div class="tn-banner-sub">' + statusText + '</div>';
    html += '</div>';
    html += '</div>';

    // Информация
    html += '<div class="tn-section">';
    html += '<div class="tn-section-title">' + tSvg('scroll', 14) + ' Информация</div>';
    html += '<div class="tn-info-grid">';
    html += '<div class="tn-info-item"><div class="tn-info-label">Режим</div><div class="tn-info-value">' + escapeHtml(t.mode) + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Карта</div><div class="tn-info-value">' + escapeHtml(t.map) + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Формат</div><div class="tn-info-value">' + (t.match_format || '—').toUpperCase() + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Сетка</div><div class="tn-info-value">' + (t.bracket_type === 'single' ? 'Single Elim' : t.bracket_type === 'double' ? 'Double Elim' : 'Группы') + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Макс. команд</div><div class="tn-info-value">' + t.max_teams + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Мин. игроков</div><div class="tn-info-value">' + t.min_players + '</div></div>';
    html += '</div>';
    html += '</div>';

    // Приз
    const prizeText = t.prize_text || (t.prize_type === 'coins' ? (t.prize_value + ' монет') : t.prize_type === 'vip' ? ('VIP на ' + t.prize_value + ' дн.') : t.prize_type === 'elo' ? ('+' + t.prize_value + ' ELO') : '—');
    html += '<div class="tn-section">';
    html += '<div class="tn-section-title">' + tSvg('gift', 14) + ' Приз</div>';
    html += '<div class="tn-info-item"><div class="tn-info-value prize">' + tSvg('trophy', 16) + ' ' + escapeHtml(prizeText) + '</div></div>';
    html += '</div>';

    // Даты
    html += '<div class="tn-section">';
    html += '<div class="tn-section-title">' + tSvg('calendar', 14) + ' Даты</div>';
    html += '<div class="tn-info-grid">';
    html += '<div class="tn-info-item"><div class="tn-info-label">Начало</div><div class="tn-info-value">' + (startDate || '—') + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Дедлайн</div><div class="tn-info-value">' + (deadline || '—') + '</div></div>';
    html += '</div>';
    html += '</div>';

    // Описание
    if (t.description) {
        html += '<div class="tn-section">';
        html += '<div class="tn-section-title">Описание</div>';
        html += '<div class="tn-rules-body">' + escapeHtml(t.description) + '</div>';
        html += '</div>';
    }

    // Правила
    if (t.rules) {
        html += '<div class="tn-section">';
        html += '<button class="tn-rules-btn" id="tn-open-rules">';
        html += '<span>' + tSvg('scroll', 14) + ' Правила турнира</span>';
        html += tSvg('back', 14);
        html += '</button>';
        html += '</div>';
    }

    // Кнопка регистрации
    if (t.status === 'registration') {
        html += '<button class="tn-register-btn" id="tn-register-btn">' + tSvg('plus', 16) + ' Зарегистрировать команду</button>';
    }

    // Кнопки сетки и истории (если уже стартовал)
    if (t.status === 'active' || t.status === 'finished') {
        html += '<div class="tn-section">';
        html += '<div style="display:flex;gap:8px;">';
        html += '<button class="tn-rules-btn" id="tn-open-bracket" style="flex:1;">' + tSvg('grid', 14) + ' Сетка</button>';
        html += '<button class="tn-rules-btn" id="tn-open-history" style="flex:1;">' + tSvg('history', 14) + ' История</button>';
        html += '</div>';
        html += '</div>';
    }

    // Команды
    html += '<div class="tn-section">';
    html += '<div class="tn-section-title">' + tSvg('users', 14) + ' Участники (' + teams.length + '/' + t.max_teams + ')</div>';
    if (teams.length === 0) {
        html += '<div class="tn-empty" style="padding:20px;">Пока никто не зарегистрирован</div>';
    } else {
        html += '<div class="tn-teams-list">';
        teams.forEach(team => {
            const logoStyle = team.logo_url ? 'style="background-image:url(\'' + team.logo_url + '\')"' : '';
            const logoText = team.logo_url ? '' : (team.tag || '?').substring(0, 2).toUpperCase();
            html += '<div class="tn-team-card" data-team-id="' + team.id + '">';
            html += '<div class="tn-team-logo" ' + logoStyle + '>' + logoText + '</div>';
            html += '<div class="tn-team-info">';
            html += '<div class="tn-team-name">[' + escapeHtml(team.tag) + '] ' + escapeHtml(team.name) + '</div>';
            html += '<div class="tn-team-cap">Капитан: ' + escapeHtml(team.captain_game_nick) + ' · ' + escapeHtml(team.captain_telegram) + '</div>';
            html += '</div>';
            html += '<span class="tn-team-approved">' + tSvg('check', 18) + '</span>';
            html += '</div>';
        });
        html += '</div>';
    }
    html += '</div>';

    body.innerHTML = html;

    // Обработчики
    body.querySelectorAll('.tn-team-card[data-team-id]').forEach(card => {
        card.addEventListener('click', () => {
            const teamId = parseInt(card.dataset.teamId);
            showTourneyTeam(teamId);
        });
    });

    const regBtn = document.getElementById('tn-register-btn');
    if (regBtn) regBtn.addEventListener('click', () => showTourneyRegister(t.id));

    const rulesBtn = document.getElementById('tn-open-rules');
    if (rulesBtn) rulesBtn.addEventListener('click', () => showTourneyRules(t.id));

    const bracketBtn = document.getElementById('tn-open-bracket');
    if (bracketBtn) bracketBtn.addEventListener('click', () => showTourneyBracket(t.id));

    const historyBtn = document.getElementById('tn-open-history');
    if (historyBtn) historyBtn.addEventListener('click', () => showTourneyHistory(t.id));
}

// ==== ПРАВИЛА ====
function showTourneyRules(tid) {
    const t = tourneyState.currentTournament;
    if (!t) return;
    tourneyState.currentScreen = 'rules';
    tourneyState.historyStack.push({ screen: 'details', tid: tid });

    tnSetHeader('Правила', t.name, true);

    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-section"><div class="tn-rules-body">' + escapeHtml(t.rules || 'Правила не заданы') + '</div></div>';
}

// ==== СОСТАВ КОМАНДЫ ====
async function showTourneyTeam(teamId, isBack) {
    tourneyState.currentScreen = 'team';
    tourneyState.currentTeamId = teamId;

    if (!isBack) tourneyState.historyStack.push({ screen: 'details', tid: tourneyState.currentTournamentId });

    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';

    try {
        const team = await apiGet('/api/tournament/team/' + teamId);
        if (!team || team.error) {
            body.innerHTML = '<div class="tn-empty">Команда не найдена</div>';
            return;
        }

        tnSetHeader(team.name, '[' + team.tag + ']', true);

        const logoStyle = team.logo_url ? 'style="background-image:url(\'' + team.logo_url + '\')"' : '';
        const logoText = team.logo_url ? '' : (team.tag || '?').substring(0, 2).toUpperCase();

        let html = '';
        html += '<div class="tn-section" style="text-align:center;">';
        html += '<div style="width:80px;height:80px;margin:0 auto 12px;border-radius:16px;background:linear-gradient(135deg,#a855f7,#7c3aed);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;border:1px solid rgba(192,132,252,0.3);"' + (team.logo_url ? ' ' + logoStyle : '') + '>' + logoText + '</div>';
        html += '<div style="font-size:18px;font-weight:700;color:#f0e9ff;">' + escapeHtml(team.name) + ' <span style="color:#c084fc;">[' + escapeHtml(team.tag) + ']</span></div>';
        html += '<div style="font-size:12px;color:#8b7fb8;margin-top:6px;">Капитан: ' + escapeHtml(team.captain_game_nick) + ' · ' + escapeHtml(team.captain_telegram) + '</div>';
        html += '</div>';

        html += '<div class="tn-section">';
        html += '<div class="tn-section-title">' + tSvg('users', 14) + ' Состав (' + (team.players || []).length + ')</div>';
        html += '<div class="tn-teams-list">';
        (team.players || []).forEach(p => {
            const roleIcon = p.role === 'captain' ? tSvg('trophy', 12) + ' ' : '';
            const roleLabel = p.role === 'captain' ? 'Капитан' : 'Игрок';
            html += '<div class="tn-team-card" style="cursor:default;">';
            html += '<div class="tn-team-logo">' + (p.game_nick || '?').substring(0, 2).toUpperCase() + '</div>';
            html += '<div class="tn-team-info">';
            html += '<div class="tn-team-name">' + roleIcon + escapeHtml(p.game_nick) + '</div>';
            html += '<div class="tn-team-cap">ID: ' + escapeHtml(p.game_id) + ' · ' + roleLabel + '</div>';
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
        html += '</div>';

        body.innerHTML = html;
    } catch (e) {
        console.error('Ошибка команды:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}

// ==== РЕГИСТРАЦИЯ ====
function showTourneyRegister(tid) {
    tourneyState.currentScreen = 'register';
    tourneyState.historyStack.push({ screen: 'details', tid: tid });

    const t = tourneyState.currentTournament;
    if (!t) return;

    tnSetHeader('Регистрация команды', t.name, true);

    const body = document.getElementById('tn-body');

    // Сколько игроков нужно (не считая капитана)
    const minPlayers = t.min_players || 1;
    const extraPlayers = Math.max(0, minPlayers - 1);

    let playersHtml = '';
    for (let i = 0; i < extraPlayers; i++) {
        playersHtml += '<div class="tn-player-block">';
        playersHtml += '<div class="tn-player-title">' + tSvg('users', 12) + ' Игрок ' + (i + 2) + '</div>';
        playersHtml += '<div class="tn-field"><label class="tn-label">Игровой ID <span class="req">*</span></label><input class="tn-input" data-player-idx="' + i + '" data-field="game_id" placeholder="Например: 123456" maxlength="30"></div>';
        playersHtml += '<div class="tn-field" style="margin-bottom:0;"><label class="tn-label">Игровой ник <span class="req">*</span></label><input class="tn-input" data-player-idx="' + i + '" data-field="game_nick" placeholder="Ник в игре" maxlength="30"></div>';
        playersHtml += '</div>';
    }

    let html = '<div class="tn-form">';

    // Логотип
    html += '<div class="tn-logo-upload" id="tn-logo-upload">';
    html += '<div class="tn-logo-preview" id="tn-logo-preview">' + tSvg('upload', 32) + '</div>';
    html += '<div class="tn-logo-hint">Нажми чтобы загрузить логотип<br>PNG/JPG · необязательно</div>';
    html += '<input type="file" id="tn-logo-input" accept="image/*" style="display:none;">';
    html += '</div>';

    // Название
    html += '<div class="tn-field"><label class="tn-label">Название команды <span class="req">*</span></label>';
    html += '<input class="tn-input" id="tn-team-name" placeholder="Team Liquid" maxlength="24">';
    html += '<div class="tn-hint">3-24 символа</div></div>';

    // Тег
    html += '<div class="tn-field"><label class="tn-label">Тег команды <span class="req">*</span></label>';
    html += '<input class="tn-input" id="tn-team-tag" placeholder="TLQ" maxlength="5" style="text-transform:uppercase;">';
    html += '<div class="tn-hint">2-5 символов, латиница и цифры</div></div>';

    // Капитан
    html += '<div class="tn-player-block">';
    html += '<div class="tn-player-title">' + tSvg('trophy', 12) + ' Капитан (ты)</div>';
    html += '<div class="tn-field"><label class="tn-label">Игровой ID <span class="req">*</span></label><input class="tn-input" id="tn-captain-id" placeholder="Твой ID в игре" maxlength="30"></div>';
    html += '<div class="tn-field"><label class="tn-label">Игровой ник <span class="req">*</span></label><input class="tn-input" id="tn-captain-nick" placeholder="Твой ник в игре" maxlength="30"></div>';
    html += '<div class="tn-field" style="margin-bottom:0;"><label class="tn-label">Твой Telegram <span class="req">*</span></label><input class="tn-input" id="tn-captain-tg" placeholder="@username" maxlength="32"></div>';
    html += '<div class="tn-hint">Для связи админа с капитаном команды</div>';
    html += '</div>';

    // Игроки
    html += playersHtml;

    // Чекбоксы
    html += '<div class="tn-check"><input type="checkbox" id="tn-agree-data"><label for="tn-agree-data">Подтверждаю правильность данных. Игровые ники совпадают с никами в игре.</label></div>';
    html += '<div class="tn-check"><input type="checkbox" id="tn-agree-rules"><label for="tn-agree-rules">Согласен с правилами турнира.</label></div>';

    // Кнопка
    html += '<button class="tn-submit-btn" id="tn-submit-register">Зарегистрировать</button>';
    html += '</div>';

    body.innerHTML = html;

    // Логотип
    const logoUpload = document.getElementById('tn-logo-upload');
    const logoInput = document.getElementById('tn-logo-input');
    let logoFile = null;

    logoUpload.addEventListener('click', () => logoInput.click());
    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 500 * 1024) {
            showToast('Логотип: максимум 500 KB');
            logoInput.value = '';
            return;
        }
        logoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const preview = document.getElementById('tn-logo-preview');
            preview.style.backgroundImage = 'url(' + ev.target.result + ')';
            preview.innerHTML = '';
        };
        reader.readAsDataURL(file);
    });

    // Кнопка регистрации
    document.getElementById('tn-submit-register').addEventListener('click', async () => {
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
        if (!agreeData) return showToast('Подтверди правильность данных');
        if (!agreeRules) return showToast('Согласись с правилами');

        // Собираем игроков
        const players = [];
        const extras = document.querySelectorAll('[data-player-idx]');
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
            // Логотип: пока без загрузки — оставляем null
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
            if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            showTourneyDetails(tid);
        } catch (e) {
            console.error('Ошибка регистрации:', e);
            showToast('Ошибка отправки');
            btn.disabled = false;
            btn.textContent = 'Зарегистрировать';
        }
    });
}

// ==== СЕТКА ====
async function showTourneyBracket(tid, isBack) {
    tourneyState.currentScreen = 'bracket';

    if (!isBack) tourneyState.historyStack.push({ screen: 'details', tid: tid });

    tnSetHeader('Сетка', tourneyState.currentTournament ? tourneyState.currentTournament.name : '', true);

    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';

    try {
        const matches = await apiGet('/api/tournament/' + tid + '/bracket');
        renderTourneyBracket(tid, matches || []);
    } catch (e) {
        console.error('Ошибка сетки:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки сетки</div>';
    }
}

function renderTourneyBracket(tid, matches) {
    const body = document.getElementById('tn-body');

    if (!matches || matches.length === 0) {
        body.innerHTML = '<div class="tn-empty">' + tSvg('grid', 60) + '<div>Сетка ещё не сгенерирована</div></div>';
        return;
    }

    // Группируем по раундам
    const byRound = {};
    matches.forEach(m => {
        if (!byRound[m.round]) byRound[m.round] = [];
        byRound[m.round].push(m);
    });

    const rounds = Object.keys(byRound).sort((a, b) => a - b);
    const maxRound = Math.max(...rounds.map(Number));

    let roundNames = {};
    rounds.forEach(r => {
        const rn = parseInt(r);
        const matchesLeft = byRound[r].length;
        if (matchesLeft === 1) roundNames[r] = 'Финал';
        else if (matchesLeft === 2) roundNames[r] = '1/2';
        else if (matchesLeft === 4) roundNames[r] = '1/4';
        else if (matchesLeft === 8) roundNames[r] = '1/8';
        else if (matchesLeft === 16) roundNames[r] = '1/16';
        else roundNames[r] = 'Раунд ' + r;
    });

    let html = '<div class="tn-bracket-wrap" id="tn-bracket-wrap">';
    html += '<div class="tn-bracket-canvas" id="tn-bracket-canvas">';
    html += '<div class="tn-bracket-rounds">';

    rounds.forEach(r => {
        html += '<div class="tn-bracket-round">';
        html += '<div class="tn-bracket-round-title">' + (roundNames[r] || 'Раунд ' + r) + '</div>';

        byRound[r].forEach(m => {
            const aWon = m.winner_id && m.team_a_id && m.winner_id === m.team_a_id;
            const bWon = m.winner_id && m.team_b_id && m.winner_id === m.team_b_id;

            html += '<div class="tn-match ' + (aWon ? 'winner-a' : '') + (bWon ? 'winner-b' : '') + '" data-match-id="' + m.id + '" data-team-a="' + (m.team_a_id || '') + '" data-team-b="' + (m.team_b_id || '') + '">';

            // Team A
            const aName = m.team_a_name ? '[' + (m.team_a_tag || '?') + '] ' + m.team_a_name : '';
            html += '<div class="tn-match-team ' + (aWon ? 'winner' : (m.status === 'finished' ? 'loser' : '')) + '">';
            html += '<span class="tn-match-team-name">' + (aName ? escapeHtml(aName) : '<span class="tn-match-empty">TBD</span>') + '</span>';
            html += '<span class="tn-match-score">' + (m.status === 'finished' ? m.score_a : '—') + '</span>';
            html += '</div>';

            // Team B
            const bName = m.team_b_name ? '[' + (m.team_b_tag || '?') + '] ' + m.team_b_name : '';
            html += '<div class="tn-match-team ' + (bWon ? 'winner' : (m.status === 'finished' ? 'loser' : '')) + '">';
            html += '<span class="tn-match-team-name">' + (bName ? escapeHtml(bName) : '<span class="tn-match-empty">TBD</span>') + '</span>';
            html += '<span class="tn-match-score">' + (m.status === 'finished' ? m.score_b : '—') + '</span>';
            html += '</div>';

            html += '</div>';
        });

        html += '</div>';
    });

    html += '</div>'; // rounds
    html += '</div>'; // canvas
    html += '<div class="tn-bracket-controls">';
    html += '<button class="tn-zoom-btn" id="tn-zoom-out">' + tSvg('zoomOut', 16) + '</button>';
    html += '<div class="tn-zoom-level" id="tn-zoom-level">100%</div>';
    html += '<button class="tn-zoom-btn" id="tn-zoom-in">' + tSvg('zoomIn', 16) + '</button>';
    html += '<button class="tn-zoom-btn" id="tn-zoom-reset">' + tSvg('reset', 16) + '</button>';
    html += '</div>';
    html += '</div>';

    body.innerHTML = html;

    // Инициализируем зум и pinch
    if (typeof initBracketZoom === 'function') {
        initBracketZoom();
    }

    // Клик по матчу
    body.querySelectorAll('.tn-match').forEach(m => {
        m.addEventListener('click', () => {
            const matchId = parseInt(m.dataset.matchId);
            const tA = m.dataset.teamA;
            const tB = m.dataset.teamB;
            if (tA && tB) {
                if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
            }
        });
    });
}

// ==== ИСТОРИЯ МАТЧЕЙ ====
async function showTourneyHistory(tid, isBack) {
    tourneyState.currentScreen = 'history';

    if (!isBack) tourneyState.historyStack.push({ screen: 'details', tid: tid });

    tnSetHeader('История матчей', tourneyState.currentTournament ? tourneyState.currentTournament.name : '', true);

    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';

    try {
        const data = await apiGet('/api/tournament/' + tid + '/matches');
        const matches = (data.matches || []).filter(m => m.status === 'finished');
        const t = data.tournament || tourneyState.currentTournament || {};

        if (matches.length === 0) {
            body.innerHTML = '<div class="tn-empty">' + tSvg('history', 60) + '<div>Матчей пока нет</div></div>';
            return;
        }

        // Раунды
        let roundNames = {};
        const byRound = {};
        matches.forEach(m => {
            if (!byRound[m.round]) byRound[m.round] = [];
            byRound[m.round].push(m);
        });
        Object.keys(byRound).forEach(r => {
            const cnt = byRound[r].length;
            if (cnt === 1) roundNames[r] = 'Финал';
            else if (cnt === 2) roundNames[r] = '1/2';
            else if (cnt === 4) roundNames[r] = '1/4';
            else if (cnt === 8) roundNames[r] = '1/8';
            else roundNames[r] = 'Раунд ' + r;
        });

        let html = '';
        matches.sort((a, b) => a.round - b.round || a.match_index - b.match_index).forEach(m => {
            const roundName = roundNames[m.round] || ('Раунд ' + m.round);
            const aWon = m.winner_id && m.team_a_id && m.winner_id === m.team_a_id;
            const bWon = m.winner_id && m.team_b_id && m.winner_id === m.team_b_id;
            const aName = m.team_a_name ? '[' + (m.team_a_tag || '?') + '] ' + m.team_a_name : 'TBD';
            const bName = m.team_b_name ? '[' + (m.team_b_tag || '?') + '] ' + m.team_b_name : 'TBD';
            const date = (m.finished_at || '').substring(0, 16).replace('T', ' ');

            html += '<div class="tn-history-item" data-tid="' + m.id + '">';
            html += '<div class="tn-history-round">' + roundName + ' · ' + ((t.match_format || 'bo3').toUpperCase()) + ' · ' + escapeHtml(t.map || '—') + '</div>';
            html += '<div class="tn-history-teams">';
            html += '<div class="tn-history-team ' + (aWon ? 'winner' : '') + '">' + escapeHtml(aName) + '</div>';
            html += '<div class="tn-history-score">' + m.score_a + ' : ' + m.score_b + '</div>';
            html += '<div class="tn-history-team right ' + (bWon ? 'winner' : '') + '">' + escapeHtml(bName) + '</div>';
            html += '</div>';
            html += '<div class="tn-history-meta">';
            html += '<span>' + (date || '—') + '</span>';
            html += '<span>Раунд ' + m.round + '</span>';
            html += '</div>';
            html += '</div>';
        });

        body.innerHTML = html;
    } catch (e) {
        console.error('Ошибка истории:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}
