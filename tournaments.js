// ==== ТУРНИРЫ v5 — без SVG и эмодзи ====
console.log('=== v5 START ===');

let tnFilter = 'all';
let tnList = [];
let tnCurrentTid = null;
let tnCurrentTournament = null;
let tnHistoryStack = [];

// ============ ОТКРЫТИЕ / ЗАКРЫТИЕ ============
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
        if (prev === 'list') tnShowList(true);
        else if (prev.screen === 'details') tnShowDetails(prev.tid, true);
    } else {
        closeTournamentsModal();
    }
}

// ============ СПИСОК ТУРНИРОВ ============
async function tnShowList(isBack) {
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
        if (t.description) {
            html += '<div class="tn-card-desc">' + escapeHtml(t.description) + '</div>';
        }
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
            const tid = parseInt(card.dataset.tid);
            tnShowDetails(tid);
        });
    });
}

// ============ ДЕТАЛИ ТУРНИРА ============
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
        tnRenderDetails(t, teams || []);
    } catch (e) {
        console.error('Ошибка деталей:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}

function tnRenderDetails(t, teams) {
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

    // Баннер
    html += '<div class="tn-banner" ' + bannerStyle + '>';
    html += '<div class="tn-banner-overlay">';
    html += '<div class="tn-banner-title">' + escapeHtml(t.name) + '</div>';
    html += '<div class="tn-banner-sub">' + statusText + '</div>';
    html += '</div>';
    html += '</div>';

    // Информация
    html += '<div class="tn-section">';
    html += '<div class="tn-section-title">Информация</div>';
    html += '<div class="tn-info-grid">';
    html += '<div class="tn-info-item"><div class="tn-info-label">Режим</div><div class="tn-info-value">' + escapeHtml(t.mode) + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Карта</div><div class="tn-info-value">' + escapeHtml(t.map) + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Формат</div><div class="tn-info-value">' + (t.match_format || '—').toUpperCase() + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Макс. команд</div><div class="tn-info-value">' + t.max_teams + '</div></div>';
    html += '<div class="tn-info-item"><div class="tn-info-label">Мин. игроков</div><div class="tn-info-value">' + t.min_players + '</div></div>';
    html += '</div>';
    html += '</div>';

    // Приз
    let prizeText = t.prize_text || '—';
    if (!t.prize_text) {
        if (t.prize_type === 'coins') prizeText = t.prize_value + ' монет';
        else if (t.prize_type === 'vip') prizeText = 'VIP на ' + t.prize_value + ' дн.';
        else if (t.prize_type === 'elo') prizeText = '+' + t.prize_value + ' ELO';
    }
    html += '<div class="tn-section">';
    html += '<div class="tn-section-title">Приз</div>';
    html += '<div class="tn-info-item"><div class="tn-info-value prize">' + escapeHtml(prizeText) + '</div></div>';
    html += '</div>';

    // Даты
    html += '<div class="tn-section">';
    html += '<div class="tn-section-title">Даты</div>';
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

    // Кнопка правил
    if (t.rules) {
        html += '<div class="tn-section">';
        html += '<button class="tn-rules-btn" id="tn-open-rules">Правила турнира</button>';
        html += '</div>';
    }

    // Кнопка регистрации
    if (t.status === 'registration') {
        html += '<button class="tn-register-btn" id="tn-register-btn">Зарегистрировать команду</button>';
    }

    // Команды
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
            html += '</div>';
            html += '</div>';
        });
        html += '</div>';
    }
    html += '</div>';

    body.innerHTML = html;

    // Обработчики
    body.querySelectorAll('.tn-team-card[data-team-id]').forEach(function(card) {
        card.addEventListener('click', function() {
            console.log('Клик по команде id=' + card.dataset.teamId);
        });
    });

    const regBtn = document.getElementById('tn-register-btn');
    if (regBtn) regBtn.addEventListener('click', function() {
        console.log('Регистрация (шаг 3)');
    });

    const rulesBtn = document.getElementById('tn-open-rules');
    if (rulesBtn) rulesBtn.addEventListener('click', function() {
        console.log('Правила (шаг 4)');
    });
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
function tnInitHandlers() {
    const openBtn = document.getElementById('btn-open-tournaments');
    if (openBtn) openBtn.addEventListener('click', openTournamentsModal);

    const closeBtn = document.getElementById('tn-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeTournamentsModal);

    const backBtn = document.getElementById('tn-back-btn');
    if (backBtn) backBtn.addEventListener('click', tnBack);

    document.querySelectorAll('.tn-filter').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tn-filter').forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            tnFilter = btn.dataset.filter;
            tnRenderList(tnList);
        });
    });

    console.log('=== v5 обработчики навешены ===');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tnInitHandlers);
} else {
    tnInitHandlers();
}

window.tnInitHandlers = tnInitHandlers;
console.log('=== v5 DONE ===');
