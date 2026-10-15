// ==== ТУРНИРЫ v4 — без SVG ====
console.log('=== v4 START ===');

let tnFilter = 'all';
let tnList = [];

function openTournamentsModal() {
    const modal = document.getElementById('tournament-modal');
    if (!modal) return;
    modal.classList.add('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
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
            console.log('Клик по турниру id=' + card.dataset.tid);
        });
    });
}

function tnInitHandlers() {
    const openBtn = document.getElementById('btn-open-tournaments');
    if (openBtn) openBtn.addEventListener('click', openTournamentsModal);

    const closeBtn = document.getElementById('tn-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeTournamentsModal);

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

    console.log('=== v4 обработчики навешены ===');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tnInitHandlers);
} else {
    tnInitHandlers();
}

window.tnInitHandlers = tnInitHandlers;
console.log('=== v4 DONE ===');
