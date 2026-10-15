// ==== АДМИНКА ТУРНИРОВ — ШАГ A2 ====
console.log('=== admin-tournaments.js A2 START ===');

let atList = [];
let atCurrentId = null;
let atCurrentTournament = null;
let atTeams = [];

// ============ СПИСОК ТУРНИРОВ ============
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
        console.error('Ошибка турниров админа:', e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
    }
}

// ============ ФОРМА СОЗДАНИЯ ТУРНИРА ============
function showAdminTournamentCreate() {
    const container = document.getElementById('admin-content');
    if (!container) return;

    let html = '';
    html += '<div class="section-head">';
    html += '<button class="section-btn" id="atc-back">← Назад</button>';
    html += '<div class="section-title">Новый турнир</div>';
    html += '<div style="width:60px;"></div>';
    html += '</div>';

    // Название
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Название *</div>';
    html += '<div class="admin-row"><input type="text" class="admin-input" id="atc-name" placeholder="LUMA CUP #3" maxlength="40"></div>';
    html += '</div>';

    // Описание
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Описание</div>';
    html += '<div class="admin-row"><textarea class="admin-input" id="atc-desc" placeholder="Описание турнира..." rows="3" style="resize:none;"></textarea></div>';
    html += '</div>';

    // Режим
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Режим *</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button type="button" class="admin-btn atc-mode" data-val="1x1">1x1</button>';
    html += '<button type="button" class="admin-btn atc-mode" data-val="2x2">2x2</button>';
    html += '<button type="button" class="admin-btn atc-mode" data-val="3x3">3x3</button>';
    html += '<button type="button" class="admin-btn atc-mode" data-val="4x4">4x4</button>';
    html += '<button type="button" class="admin-btn primary atc-mode" data-val="5x5">5x5</button>';
    html += '</div>';
    html += '</div>';

    // Карта
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Карта *</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button type="button" class="admin-btn primary atc-map" data-val="Sandstone">Sandstone</button>';
    html += '<button type="button" class="admin-btn atc-map" data-val="Province">Province</button>';
    html += '<button type="button" class="admin-btn atc-map" data-val="Rust">Rust</button>';
    html += '<button type="button" class="admin-btn atc-map" data-val="Prison">Prison</button>';
    html += '<button type="button" class="admin-btn atc-map" data-val="Hanami">Hanami</button>';
    html += '<button type="button" class="admin-btn atc-map" data-val="Random">Random</button>';
    html += '<button type="button" class="admin-btn atc-map" data-val="All maps">All maps</button>';
    html += '</div>';
    html += '</div>';

    // Формат матчей
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Формат матчей *</div>';
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
    html += '<button type="button" class="admin-btn atc-format" data-val="bo1">Bo1</button>';
    html += '<button type="button" class="admin-btn primary atc-format" data-val="bo3">Bo3</button>';
    html += '<button type="button" class="admin-btn atc-format" data-val="bo5">Bo5</button>';
    html += '<button type="button" class="admin-btn atc-format" data-val="bo7">Bo7</button>';
    html += '</div>';
    html += '</div>';

    // Макс. команд / мин. игроков
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Команды *</div>';
    html += '<div class="admin-row">';
    html += '<input type="number" class="admin-input" id="atc-max-teams" placeholder="Макс. команд" value="8">';
    html += '<input type="number" class="admin-input" id="atc-min-players" placeholder="Мин. игроков" value="5">';
    html += '</div>';
    html += '</div>';

    // Приз
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Приз *</div>';
    html += '<div class="admin-row">';
    html += '<input type="text" class="admin-input" id="atc-prize-text" placeholder="50 000 монет + PRO на месяц">';
    html += '</div>';
    html += '<div class="admin-row" style="font-size:11px;color:#8b7fb8;padding:0 2px;">Свободный текст. Что угодно.</div>';
    html += '</div>';

    // Правила
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Правила</div>';
    html += '<div class="admin-row"><textarea class="admin-input" id="atc-rules" placeholder="1. ОБЩИЕ ПОЛОЖЕНИЯ..." rows="6" style="resize:none;"></textarea></div>';
    html += '<div class="admin-row"><button type="button" class="admin-btn" id="atc-fill-rules">Загрузить шаблон правил</button></div>';
    html += '</div>';

    // Даты
    html += '<div class="admin-section">';
    html += '<div class="admin-section-title">Даты</div>';
    html += '<div class="admin-row">';
    html += '<input type="text" class="admin-input" id="atc-start-date" placeholder="2026-10-20 18:00">';
    html += '<input type="text" class="admin-input" id="atc-reg-deadline" placeholder="2026-10-19 23:59">';
    html += '</div>';
    html += '<div class="admin-row" style="font-size:11px;color:#8b7fb8;padding:0 2px;">Формат: ГГГГ-ММ-ДД ЧЧ:ММ</div>';
    html += '</div>';

    // Кнопка создания
    html += '<button class="admin-btn primary" id="atc-submit" style="width:100%;padding:16px;font-size:15px;margin-top:10px;">Создать турнир</button>';

    container.innerHTML = html;

    // Состояние выбора
    let selectedMode = '5x5';
    let selectedMap = 'Sandstone';
    let selectedFormat = 'bo3';

    // Название/описание/приз - смотрим на значения

    // Обработчики выбора режима
    container.querySelectorAll('.atc-mode').forEach(function(btn) {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.atc-mode').forEach(function(b) {
                b.classList.remove('primary');
            });
            btn.classList.add('primary');
            selectedMode = btn.dataset.val;
        });
    });

    // Карта
    container.querySelectorAll('.atc-map').forEach(function(btn) {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.atc-map').forEach(function(b) {
                b.classList.remove('primary');
            });
            btn.classList.add('primary');
            selectedMap = btn.dataset.val;
        });
    });

    // Формат
    container.querySelectorAll('.atc-format').forEach(function(btn) {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.atc-format').forEach(function(b) {
                b.classList.remove('primary');
            });
            btn.classList.add('primary');
            selectedFormat = btn.dataset.val;
        });
    });

    // Шаблон правил
    document.getElementById('atc-fill-rules').addEventListener('click', function() {
        const template = '1. ОБЩИЕ ПОЛОЖЕНИЯ\n' +
            'Турнир проходит в формате ' + selectedMode + ' на карте ' + selectedMap + '.\n' +
            'Формат матчей: ' + selectedFormat.toUpperCase() + '.\n\n' +
            '2. РЕГИСТРАЦИЯ\n' +
            '• Капитан подаёт заявку через Mini App.\n' +
            '• Указываются игровой ID и ник каждого игрока.\n' +
            '• Один игровой ID — только одна команда.\n\n' +
            '3. СОСТАВ\n' +
            '• Замены до старта турнира.\n' +
            '• После старта состав фиксирован.\n\n' +
            '4. МАТЧИ\n' +
            '• Опоздание более 10 минут = техническое поражение.\n\n' +
            '5. ДИСЦИПЛИНА\n' +
            '• Читы = бан.\n' +
            '• Токсичность = предупреждение → бан.';
        document.getElementById('atc-rules').value = template;
    });

    // Кнопка «Назад»
    document.getElementById('atc-back').addEventListener('click', showAdminTournaments);

    // Создание
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
        btn.disabled = true;
        btn.textContent = 'Создание...';

        try {
            const res = await apiPost('/api/admin/tournament/create', {
                admin_id: tgUser.id,
                name: name,
                description: description,
                mode: selectedMode,
                map: selectedMap,
                match_format: selectedFormat,
                bracket_type: 'single',
                max_teams: maxTeams,
                min_players: minPlayers,
                prize_type: 'custom',
                prize_value: 0,
                prize_text: prizeText,
                rules: rules,
                start_date: startDate || null,
                reg_deadline: regDeadline || null,
                is_seasonal: 0
            });

            if (res.error) {
                showToast(res.error);
                btn.disabled = false;
                btn.textContent = 'Создать турнир';
                return;
            }

            showToast('Турнир создан!');
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
            showAdminTournaments();
        } catch (e) {
            console.error('Ошибка создания:', e);
            showToast('Ошибка');
            btn.disabled = false;
            btn.textContent = 'Создать турнир';
        }
    });
}

// ============ УПРАВЛЕНИЕ ТУРНИРОМ (шаг A3) ============
function showAdminTournamentManage(tid) {
    console.log('Управление турниром id=' + tid + ' (шаг A3)');
    if (typeof showToast === 'function') showToast('Управление — шаг A3');
}

console.log('=== admin-tournaments.js A2 DONE ===');
