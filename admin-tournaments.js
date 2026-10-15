// ==== АДМИНКА ТУРНИРОВ — ШАГ A1: Список ====
console.log('=== admin-tournaments.js A1 START ===');

let atList = [];

// Вход в раздел «Турниры» из админ-панели
async function showAdminTournaments() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        const list = await apiGet('/api/admin/tournaments/list?tg_id=' + tgUser.id);
        atList = list || [];

        let html = '';
        html += '<div class="section-head">';
        html += '<button class="section-btn" id="at-back">← Назад</button>';
        html += '<div class="section-title">Турниры</div>';
        html += '<div style="width:60px;"></div>';
        html += '</div>';

        html += '<button class="admin-btn primary" id="at-create" style="width:100%;margin-bottom:14px;padding:14px;">+ Создать турнир</button>';

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
                html += '<div class="admin-user-info">';
                html += '<div class="admin-user-nick">' + escapeHtml(t.name) + '</div>';
                html += '<div class="admin-user-sub">' + statusText + ' · ' + t.mode + ' · ' + escapeHtml(t.map) + ' · ' + t.teams_count + '/' + t.max_teams + '</div>';
                html += '</div>';
                html += '<button class="admin-btn primary" data-at-edit="' + t.id + '" style="padding:8px 14px;font-size:12px;flex:0 0 auto;">Управление</button>';
                html += '</div>';
            });
        }

        container.innerHTML = html;

        // Обработчики
        const backBtn = document.getElementById('at-back');
        if (backBtn) backBtn.addEventListener('click', loadAdminHome);

        const createBtn = document.getElementById('at-create');
        if (createBtn) createBtn.addEventListener('click', showAdminTournamentCreate);

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
        console.error('Ошибка турниров админа:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

// Заглушки — будут заполнены на следующих шагах
function showAdminTournamentCreate() {
    console.log('Создание турнира (шаг A2)');
    if (typeof showToast === 'function') showToast('Форма создания — шаг A2');
}

function showAdminTournamentManage(tid) {
    console.log('Управление турниром id=' + tid + ' (шаг A3)');
    if (typeof showToast === 'function') showToast('Управление — шаг A3');
}

console.log('=== admin-tournaments.js A1 DONE ===');
