// ==== ТУРНИРЫ — ШАГ 1: Список ====
console.log('=== tournaments.js v2 загружен ===');

// SVG-иконки
const T_ICONS = {
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v7a6 6 0 0 1-12 0z"/><path d="M9 21h6"/><path d="M12 16v5"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3.5-6 7-6s7 2 7 6"/><circle cx="18" cy="9" r="2.5"/><path d="M15.5 21c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M1 6l8-4 6 4 8-4v18l-8 4-6-4-8 4z"/><path d="M9 2v20M15 4v20"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
};

function tSvg(name, size) {
    const s = size || 16;
    return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + s + 'px;height:' + s + 'px;">' + (T_ICONS[name] || '') + '</span>';
}

// Состояние
let tourneyState = {
    currentFilter: 'all',
    list: []
};

function openTournamentsModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;
    modal.classList.add('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    showTourneyList();
}

function closeTournamentsModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;
    modal.classList.remove('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function tnSetHeader(title, subtitle, showBack) {
    document.getElementById('tn-title').textContent = title;
    document.getElementById('tn-subtitle').textContent = subtitle || '';
    const backBtn = document.getElementById('tn-back-btn');
    if (backBtn) backBtn.style.display = showBack ? 'flex' : 'none';
    const filters = document.getElementById('tn-filters');
    if (filters) filters.style.display = 'none';
}

async function showTourneyList() {
    tnSetHeader('Турниры', 'Выбери турнир', false);

    const filters = document.getElementById('tn-filters');
    if (filters) filters.style.display = 'flex';

    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';

    try {
        const list = await apiGet('/api/tournaments/list');
        tourneyState.list = list || [];
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
    if (filter !== 'all') {
        filtered = list.filter(t => t.status === filter);
    }

    if (!filtered || filtered.length === 0) {
        body.innerHTML = '<div class="tn-empty">' + tSvg('trophy', 60) + '<div>Турниров пока нет</div></div>';
        return;
    }

    let html = '';
    filtered.forEach(t => {
        const statusMap = {
            'registration': 'Регистрация',
            'closed': 'Регистрация закрыта',
            'active': 'Идёт',
            'finished': 'Завершён'
        };
        const statusText = statusMap[t.status] || t.status;
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
        if (t.match_format) {
            html += '<span>' + tSvg('grid', 12) + ' ' + t.match_format.toUpperCase() + '</span>';
        }
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
            console.log('Клик по турниру id=', tid);
            // Пока ничего — детали будут на шаге 2
        });
    });
}

function tnInitHandlers() {
    const openBtn = document.getElementById('btn-open-tournaments');
    if (openBtn) {
        openBtn.addEventListener('click', openTournamentsModal);
    }

    const closeBtn = document.getElementById('tn-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeTournamentsModal);
    }

    const filters = document.querySelectorAll('.tn-filter');
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tourneyState.currentFilter = btn.dataset.filter;
            renderTourneyList(tourneyState.list);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tnInitHandlers);
} else {
    tnInitHandlers();
}

window.tnInitHandlers = tnInitHandlers;
