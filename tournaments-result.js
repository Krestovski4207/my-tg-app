// ==== ТУРНИРЫ — ОТПРАВКА РЕЗУЛЬТАТА (Часть 3) ====
console.log('=== tournaments-result.js START ===');

// ============ ФУНКЦИИ ============

async function trLoadMyMatches() {
    try {
        const list = await apiGet('/api/tournament/my_matches?tg_id=' + tgUser.id);
        return list || [];
    } catch (e) {
        console.error('Ошибка my_matches:', e);
        return [];
    }
}

async function trCanSubmit(matchId) {
    try {
        const res = await apiGet('/api/tournament/match/' + matchId + '/can_submit?tg_id=' + tgUser.id);
        return res;
    } catch (e) {
        return { can: false, reason: 'Ошибка' };
    }
}

async function trUploadScreenshot(matchId, base64) {
    try {
        const res = await apiPost('/api/tournament/match/' + matchId + '/upload_screenshot', {
            image: base64
        });
        return res;
    } catch (e) {
        return { error: 'Ошибка загрузки' };
    }
}

async function trSubmitResult(matchId, games) {
    try {
        const res = await apiPost('/api/tournament/match/' + matchId + '/submit', {
            tg_id: tgUser.id,
            games: games
        });
        return res;
    } catch (e) {
        return { error: 'Ошибка отправки' };
    }
}

// ============ БЛОК В ДЕТАЛЯХ ТУРНИРА ============
// Вызывается из tnRenderDetails — добавляет блок "Мои матчи" если есть
async function trRenderMyMatchesBlock(tournamentId) {
    const matches = await trLoadMyMatches();
    const myMatches = matches.filter(function(m) { return m.tournament_id === tournamentId; });
    if (myMatches.length === 0) return '';

    let html = '<div class="tn-section">';
    html += '<div class="tn-section-title">Мои матчи</div>';

    for (let i = 0; i < myMatches.length; i++) {
        const m = myMatches[i];
        const canRes = await trCanSubmit(m.id);

        let roundName = 'Раунд ' + m.round;
        if (m.team_a_name && m.team_b_name) {
            // Показываем нормально
        } else {
            roundName += ' (ожидание соперника)';
        }

        const aName = m.team_a_name ? '[' + (m.team_a_tag || '?') + '] ' + m.team_a_name : 'TBD';
        const bName = m.team_b_name ? '[' + (m.team_b_tag || '?') + '] ' + m.team_b_name : 'TBD';

        html += '<div class="tn-card" style="margin-bottom:10px;">';
        html += '<div class="tn-card-head">';
        html += '<div class="tn-card-title">' + roundName + '</div>';
        html += '<div class="tn-status ' + (m.status === 'finished' ? 'finished' : 'registration') + '">' + (m.status === 'finished' ? 'Завершён' : 'Активен') + '</div>';
        html += '</div>';
        html += '<div class="tn-card-meta">';
        html += '<span>' + escapeHtml(aName) + '</span>';
        html += '<span>vs</span>';
        html += '<span>' + escapeHtml(bName) + '</span>';
        html += '</div>';

        if (m.status === 'finished') {
            html += '<div class="tn-card-footer">';
            html += '<span>Результат: ' + m.score_a + ' : ' + m.score_b + '</span>';
            html += '<button class="tn-rules-btn" data-tr-view-details="' + m.id + '" style="padding:6px 12px;">Подробнее</button>';
            html += '</div>';
        } else if (canRes.can) {
            html += '<button class="tn-register-btn" data-tr-submit="' + m.id + '" style="margin-top:10px;margin-bottom:0;">Отправить результат</button>';
        } else {
            html += '<div class="tn-empty" style="padding:10px;font-size:12px;">' + escapeHtml(canRes.reason || 'Нельзя отправить') + '</div>';
        }

        html += '</div>';
    }

    html += '</div>';
    return html;
}

// ============ ФОРМА ОТПРАВКИ ============
async function trOpenSubmitForm(matchId) {
    console.log('Открыть форму для матча', matchId);

    tnHistoryStack.push({ screen: 'details', tid: tnCurrentTid });
    tnHeader('Результат матча', '', true);

    const body = document.getElementById('tn-body');
    body.innerHTML = '<div class="tn-loading">Загрузка...</div>';

    try {
        const m = await apiGet('/api/tournament/match/' + matchId + '/details');
        if (!m || m.error) {
            body.innerHTML = '<div class="tn-empty">Матч не найден</div>';
            return;
        }

        const fmt = (m.match_format || 'bo3').toLowerCase();
        const maxGames = { bo1: 1, bo3: 3, bo5: 5, bo7: 7 }[fmt] || 3;

        // Состояние формы
        window.trFormState = {
            matchId: matchId,
            games: [{ map: 'Sandstone', a: '', b: '', screenshot_file_id: null }]
        };

        trRenderForm(m, maxGames);
    } catch (e) {
        console.error('Ошибка формы:', e);
        body.innerHTML = '<div class="tn-empty">Ошибка загрузки</div>';
    }
}

function trRenderForm(match, maxGames) {
    const body = document.getElementById('tn-body');
    const state = window.trFormState;

    const aName = match.team_a_name ? '[' + (match.team_a_tag || '?') + '] ' + match.team_a_name : 'TBD';
    const bName = match.team_b_name ? '[' + (match.team_b_tag || '?') + '] ' + match.team_b_name : 'TBD';

    let html = '<div class="tn-form">';

    // Заголовок
    html += '<div class="tn-section" style="text-align:center;margin-bottom:14px;">';
    html += '<div style="font-size:14px;font-weight:700;color:#f0e9ff;">' + escapeHtml(aName) + ' vs ' + escapeHtml(bName) + '</div>';
    html += '<div style="font-size:11px;color:#8b7fb8;margin-top:4px;">' + (match.match_format || '').toUpperCase() + ' · ' + escapeHtml(match.mode || '') + '</div>';
    html += '</div>';

    // Карты
    html += '<div id="tr-games-container">';
    state.games.forEach(function(g, idx) {
        html += trRenderGameBlock(g, idx, maxGames);
    });
    html += '</div>';

    // Кнопка + Добавить карту
    if (state.games.length < maxGames) {
        html += '<button class="tn-rules-btn" id="tr-add-game" style="width:100%;margin-bottom:14px;">+ Добавить карту ' + (state.games.length + 1) + '</button>';
    }

    // Согласие
    html += '<div class="tn-check"><input type="checkbox" id="tr-agree"><label for="tr-agree">Подтверждаю правильность данных</label></div>';

    // Отправить
    html += '<button class="tn-submit-btn" id="tr-submit">Отправить админу</button>';

    html += '</div>';

    body.innerHTML = html;

    // Обработчики для существующих игр
    trBindGameHandlers(maxGames);

    // Кнопка добавить карту
    const addBtn = document.getElementById('tr-add-game');
    if (addBtn) addBtn.addEventListener('click', function() {
        if (state.games.length >= maxGames) return;
        state.games.push({ map: 'Sandstone', a: '', b: '', screenshot_file_id: null });
        trRenderForm(match, maxGames);
    });

    // Кнопка отправить
    document.getElementById('tr-submit').addEventListener('click', function() {
        trSubmitForm(match, maxGames);
    });
}

function trRenderGameBlock(g, idx, maxGames) {
    const maps = ['Sandstone', 'Province', 'Rust', 'Prison', 'Hanami'];
    const mapsHtml = maps.map(function(mp) {
        return '<option value="' + mp + '"' + (g.map === mp ? ' selected' : '') + '>' + mp + '</option>';
    }).join('');

    let html = '<div class="tn-player-block" data-game-idx="' + idx + '">';
    html += '<div class="tn-player-title">Карта ' + (idx + 1) + '</div>';

    // Карта
    html += '<div class="tn-field"><label class="tn-label">Карта</label>';
    html += '<select class="tn-input" data-tr-map="' + idx + '">' + mapsHtml + '</select></div>';

    // Счёт
    html += '<div class="tn-field"><label class="tn-label">Счёт (твоя : соперник)</label>';
    html += '<div style="display:flex;gap:6px;align-items:center;">';
    html += '<input type="number" class="tn-input" data-tr-a="' + idx + '" placeholder="13" min="0" max="30" value="' + (g.a || '') + '">';
    html += '<span style="color:#8b7fb8;">:</span>';
    html += '<input type="number" class="tn-input" data-tr-b="' + idx + '" placeholder="8" min="0" max="30" value="' + (g.b || '') + '">';
    html += '</div></div>';

    // Скриншот
    html += '<div class="tn-field" style="margin-bottom:0;">';
    html += '<label class="tn-label">Скриншот таба *</label>';
    if (g.screenshot_file_id) {
        html += '<div style="display:flex;align-items:center;gap:8px;background:rgba(34,197,94,0.1);padding:8px 12px;border-radius:8px;border:1px solid rgba(34,197,94,0.3);">';
        html += '<span style="color:#22c55e;font-size:12px;">✓ Загружено</span>';
        html += '<button type="button" class="tn-rules-btn" data-tr-reset-shot="' + idx + '" style="padding:4px 10px;font-size:11px;">Заменить</button>';
        html += '</div>';
    } else {
        html += '<div id="tr-shot-' + idx + '">';
        html += '<button type="button" class="tn-rules-btn" data-tr-upload="' + idx + '" style="width:100%;padding:14px;">📷 Загрузить скриншот</button>';
        html += '<input type="file" data-tr-file="' + idx + '" accept="image/*" style="display:none;">';
        html += '</div>';
    }
    html += '</div>';

    html += '</div>';
    return html;
}

function trBindGameHandlers(maxGames) {
    const state = window.trFormState;

    // Изменения полей
    document.querySelectorAll('[data-tr-map]').forEach(function(el) {
        el.addEventListener('change', function() {
            const idx = parseInt(el.dataset.trMap);
            state.games[idx].map = el.value;
        });
    });
    document.querySelectorAll('[data-tr-a]').forEach(function(el) {
        el.addEventListener('input', function() {
            const idx = parseInt(el.dataset.trA);
            state.games[idx].a = el.value;
        });
    });
    document.querySelectorAll('[data-tr-b]').forEach(function(el) {
        el.addEventListener('input', function() {
            const idx = parseInt(el.dataset.trB);
            state.games[idx].b = el.value;
        });
    });

    // Загрузка скринов
    document.querySelectorAll('[data-tr-upload]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const idx = parseInt(btn.dataset.trUpload);
            const fileInput = document.querySelector('[data-tr-file="' + idx + '"]');
            if (fileInput) fileInput.click();
        });
    });

    document.querySelectorAll('[data-tr-file]').forEach(function(input) {
        input.addEventListener('change', function() {
            const idx = parseInt(input.dataset.trFile);
            const file = input.files[0];
            if (!file) return;
            if (file.size > 8 * 1024 * 1024) {
                showToast('Файл больше 8MB');
                return;
            }
            trUploadAndSave(idx, file);
        });
    });

    // Замена скрина
    document.querySelectorAll('[data-tr-reset-shot]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const idx = parseInt(btn.dataset.trResetShot);
            state.games[idx].screenshot_file_id = null;
            trRenderForm(state.games[idx], maxGames);
        });
    });
}

async function trUploadAndSave(idx, file) {
    const state = window.trFormState;
    const matchId = state.matchId;

    // Показываем "загрузка"
    const container = document.getElementById('tr-shot-' + idx);
    if (container) container.innerHTML = '<div style="text-align:center;padding:14px;color:#c084fc;">Загрузка скрина...</div>';

    // Читаем файл в base64
    const reader = new FileReader();
    reader.onload = async function(e) {
        const base64 = e.target.result;
        const res = await trUploadScreenshot(matchId, base64);
        if (res.error || !res.file_id) {
            showToast(res.error || 'Ошибка загрузки');
            if (container) container.innerHTML = '<div style="text-align:center;padding:14px;color:#ff6b6b;">Ошибка. Попробуй ещё раз</div>';
            return;
        }
        state.games[idx].screenshot_file_id = res.file_id;
        showToast('Скрин загружен');
        // Перерисовываем форму
        const m = await apiGet('/api/tournament/match/' + matchId + '/details');
        const fmt = (m.match_format || 'bo3').toLowerCase();
        const maxGames = { bo1: 1, bo3: 3, bo5: 5, bo7: 7 }[fmt] || 3;
        trRenderForm(m, maxGames);
    };
    reader.readAsDataURL(file);
}

async function trSubmitForm(match, maxGames) {
    const state = window.trFormState;

    // Проверки
    if (state.games.length < 2 && maxGames > 1) {
        showToast('Нужно минимум 2 карты или более');
        return;
    }

    for (let i = 0; i < state.games.length; i++) {
        const g = state.games[i];
        if (!g.a || !g.b) return showToast('Заполни счёт для карты ' + (i + 1));
        if (parseInt(g.a) === parseInt(g.b)) return showToast('Ничья не считается (карта ' + (i + 1) + ')');
        if (!g.screenshot_file_id) return showToast('Загрузи скрин для карты ' + (i + 1));
    }

    const agree = document.getElementById('tr-agree').checked;
    if (!agree) return showToast('Подтверди правильность данных');

    // Проверка победителя
    let wins_a = 0, wins_b = 0;
    state.games.forEach(function(g) {
        if (parseInt(g.a) > parseInt(g.b)) wins_a++;
        else if (parseInt(g.b) > parseInt(g.a)) wins_b++;
    });

    const fmt = (match.match_format || 'bo3').toLowerCase();
    const needed = { bo1: 1, bo3: 2, bo5: 3, bo7: 4 }[fmt] || 2;

    if (wins_a < needed && wins_b < needed) {
        return showToast('Нужно до ' + needed + ' побед (' + fmt.toUpperCase() + ')');
    }

    const btn = document.getElementById('tr-submit');
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    const games = state.games.map(function(g) {
        return {
            map: g.map,
            a: parseInt(g.a),
            b: parseInt(g.b),
            screenshot_file_id: g.screenshot_file_id
        };
    });

    const res = await trSubmitResult(match.id, games);
    if (res.error) {
        showToast(res.error);
        btn.disabled = false;
        btn.textContent = 'Отправить админу';
        return;
    }

    showToast('Заявка отправлена админу!');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

    // Возврат в детали турнира
    tnShowDetails(match.tournament_id);
}

console.log('=== tournaments-result.js DONE ===');
