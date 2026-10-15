// ==== SVG-ИКОНКИ ДЛЯ ПРОФИЛЯ ====
const P_ICONS = {
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22V15"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/></svg>',
    thumbUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>',
    fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
    gamepad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;"><path d="M6 12h4M8 10v4M15 13h.01M18 11h.01"/><rect x="2" y="6" width="20" height="12" rx="4"/></svg>'
};

// ==== ПРОФИЛЬ ====
async function loadProfile() {
    const card = document.querySelector('.user-card');
    if (card) card.classList.add('is-loading');

    if (!tgUser) {
        if (card) card.classList.remove('is-loading');
        return;
    }
    try {
        const p = await apiGet('/api/profile?tg_id=' + tgUser.id);
        renderProfile(p);
        loadProfileClan(tgUser.id);
    } catch (e) {
        console.error('Ошибка профиля:', e);
    } finally {
        if (card) card.classList.remove('is-loading');
    }
}

async function loadProfileClan(userId) {
    const el = document.getElementById('user-clan');
    if (!el) return;
    try {
        const res = await apiGet('/api/clan/by_user?tg_id=' + userId);
        if (res.clan) {
            el.className = 'user-clan member';
            el.innerHTML = svg('shield', 12) + '<span>[' + escapeHtml(res.clan.tag) + '] ' + escapeHtml(res.clan.name) + '</span>';
            el.onclick = () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                const clanTab = document.querySelector('.tab-btn[data-tab="clan"]');
                if (clanTab) clanTab.classList.add('active');
                const clanContent = document.getElementById('tab-clan');
                if (clanContent) clanContent.classList.add('active');
                if (typeof viewClan === 'function') viewClan(res.clan.clan_id);
            };
        } else {
            el.className = 'user-clan free';
            el.innerHTML = svg('flag', 12) + '<span>Свободный агент</span>';
            el.onclick = null;
        }
    } catch (e) {
        el.className = 'user-clan free';
        el.innerHTML = svg('flag', 12) + '<span>Свободный агент</span>';
    }
}

function renderProfile(p) {
    const avatarEl = document.getElementById('user-avatar');
    if (!avatarEl) return;

    let avatarSrc = p.avatar_url;
    if (!avatarSrc && tgUser && Number(tgUser.id) === Number(p.user_id)) {
        if (tgUser.photo_url) avatarSrc = tgUser.photo_url;
    }

    if (avatarSrc) {
        avatarEl.style.backgroundImage = 'url("' + avatarSrc + '")';
        avatarEl.style.backgroundSize = 'cover';
        avatarEl.style.backgroundPosition = 'center';
        avatarEl.textContent = '';
        avatarEl.classList.add('has-photo');
    } else {
        avatarEl.style.backgroundImage = 'none';
        avatarEl.classList.remove('has-photo');
        avatarEl.textContent = (p.nickname || '?').charAt(0).toUpperCase();
    }

    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = p.nickname || '—';

    const pidEl = document.getElementById('user-player-id');
    if (pidEl) {
        pidEl.textContent = 'ID: ' + (p.player_id || '—');
    } else {
        const oldId = document.getElementById('user-id');
        if (oldId) oldId.textContent = 'ID: ' + (p.player_id || '—');
    }

    const badge = document.getElementById('user-badge');
    if (badge) {
        const isAdminUser = (Number(p.user_id) === Number(ADMIN_ID));
        if (isAdminUser) {
            badge.innerHTML = verifySvg('gold');
            badge.className = 'user-badge admin-svg';
        } else {
            badge.innerHTML = '<span style="display:inline-flex;width:14px;height:14px;">' + P_ICONS.gamepad + '</span> Игрок';
            badge.className = 'user-badge player';
        }
        badge.style.display = 'inline-flex';
    }

    const lvlNum = document.getElementById('lvl-num');
    if (lvlNum) lvlNum.textContent = p.level || 1;
    const lvlNumText = document.getElementById('lvl-num-text');
    if (lvlNumText) lvlNumText.textContent = p.level || 1;
    const eloValue = document.getElementById('elo-value');
    if (eloValue) eloValue.textContent = p.elo || 0;

    const diamondEl = document.querySelector('.mini-lvl-diamond');
    if (diamondEl) {
        const lvl = Math.min(Math.max(p.level || 1, 1), 10);
        diamondEl.innerHTML = levelSvg(lvl, 60);
        diamondEl.setAttribute('data-level', lvl);
    }

    const levelStep = 200;
    const current = (p.elo || 0) % levelStep;
    const eloProgress = document.getElementById('elo-progress');
    if (eloProgress) eloProgress.style.width = ((current / levelStep) * 100) + '%';
    const progressLabel = document.getElementById('progress-label');
    if (progressLabel) progressLabel.textContent = (p.level >= 10) ? 'Максимум' : ((levelStep - current) + ' ELO до следующего');

    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setTxt('stat-win', p.wins || 0);
    setTxt('stat-lose', p.losses || 0);
    setTxt('stat-kd', (p.kd || 0).toFixed(2));
    setTxt('stat-avg', '0.0');
    setTxt('stat-game', p.matches_count || 0);
    setTxt('stat-wr', (p.winrate || 0) + '%');
    setTxt('likes-count', p.likes || 0);
    setTxt('pop-count', (p.likes || 0) - (p.dislikes || 0));

    const likesEl = document.getElementById('likes-count');
    if (likesEl && likesEl.parentElement) {
        const likesIcon = likesEl.parentElement.querySelector('.mini-icon');
        if (likesIcon) likesIcon.innerHTML = '<span style="display:inline-flex;width:26px;height:26px;color:#c084fc;filter:drop-shadow(0 0 6px rgba(192,132,252,0.6));">' + P_ICONS.thumbUp + '</span>';
    }
    const popEl = document.getElementById('pop-count');
    if (popEl && popEl.parentElement) {
        const popIcon = popEl.parentElement.querySelector('.mini-icon');
        if (popIcon) popIcon.innerHTML = '<span style="display:inline-flex;width:26px;height:26px;color:#c084fc;filter:drop-shadow(0 0 6px rgba(192,132,252,0.6));">' + P_ICONS.fire + '</span>';
    }

    const card = document.querySelector('.user-card');
    if (card) {
        if (p.banner_url) {
            const fullBannerUrl = API_URL + p.banner_url;
            card.style.setProperty('--banner-url', 'url("' + fullBannerUrl + '")');
            card.classList.add('has-banner');
        } else {
            card.classList.remove('has-banner');
            card.style.removeProperty('--banner-url');
        }
    }

    loadAndRenderAchievements(p.user_id);
    renderChart(p.elo || 0, p.ratingHistory || []);
    renderMatches(p.matches || []);
}

let chartInstance = null;
function renderChart(currentElo, history) {
    const chartEl = document.getElementById('ratingChart');
    if (!chartEl) return;
    const chartEloEl = document.getElementById('chart-elo');
    if (chartEloEl) chartEloEl.textContent = currentElo;
    if (!history || history.length === 0) history = [{ date: 'now', value: currentElo }];
    const first = history[0]?.value || currentElo;
    const last = history[history.length - 1]?.value || currentElo;
    const delta = last - first;
    const deltaEl = document.getElementById('chart-delta');
    if (deltaEl) {
        deltaEl.textContent = (delta >= 0 ? '+' : '') + delta;
        deltaEl.style.color = delta >= 0 ? '#22ff88' : '#ff4d5e';
    }

    const ctx = chartEl.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 140);
    gradient.addColorStop(0, 'rgba(34, 255, 136, 0.35)');
    gradient.addColorStop(1, 'rgba(34, 255, 136, 0)');

    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.date),
            datasets: [{
                data: history.map(h => h.value),
                borderColor: '#22ff88',
                backgroundColor: gradient,
                borderWidth: 2.5,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#5a5276', font: { size: 10 } } },
                y: { grid: { color: 'rgba(168, 85, 247, 0.08)' }, ticks: { color: '#5a5276', font: { size: 10 } } }
            }
        }
    });
}

function renderMatches(matches) {
    const container = document.getElementById('matches-list');
    if (!container) return;
    container.innerHTML = '';
    if (!matches || matches.length === 0) {
        container.innerHTML = '<div class="map-empty">Нет матчей</div>';
        return;
    }
    matches.forEach(m => {
        const item = document.createElement('div');
        item.className = 'match-item';
        const resultText = m.result === 'win' ? 'Победа' : 'Поражение';
        const eloChange = m.elo_change || 0;
        const eloText = (eloChange >= 0 ? '+' : '') + eloChange;
        item.innerHTML =
            '<div class="match-preview">' + (m.icon || '🎯') + '</div>' +
            '<div class="match-info">' +
                '<div class="match-result ' + m.result + '">' +
                    '<span class="match-result-dot"></span>' +
                    '<span>' + resultText + '</span>' +
                    '<span class="match-elo-change ' + m.result + '">' + eloText + '</span>' +
                '</div>' +
                '<div class="match-map">' + m.map + ' · ' + m.mode + '</div>' +
            '</div>' +
            '<div class="match-score ' + m.result + '">' + m.score + '</div>';
        item.addEventListener('click', () => openMatchModal(m.match_id));
        container.appendChild(item);
    });
}

async function openMatchModal(matchId) {
    const modal = document.getElementById('match-modal-overlay');
    if (!modal) return;
    const content = document.getElementById('match-modal-content');
    if (!content) return;
    content.innerHTML = '<div class="match-loading">Загрузка...</div>';
    modal.classList.add('active');

    try {
        const url = '/api/match/' + matchId + (tgUser ? '?tg_id=' + tgUser.id : '');
        const data = await apiGet(url);

        const m = data.match;
        const my = data.my_stats;
        const winnerA = m.winner_letter === 'A';
        const winnerB = m.winner_letter === 'B';

        let myResultBlock = '';
        if (my) {
            const resText = my.result === 'win' ? 'ПОБЕДА' : 'ПОРАЖЕНИЕ';
            const eloChange = my.elo_change || 0;
            const eloText = (eloChange >= 0 ? '+' : '') + eloChange;
            const coinText = (my.coins_change >= 0 ? '+' : '') + (my.coins_change || 0);
            myResultBlock =
                '<div class="match-my-result ' + my.result + '">' +
                    '<div class="match-my-label">Твой результат</div>' +
                    '<div class="match-my-value">' + resText + '</div>' +
                    '<div class="match-my-stats">' +
                        '<span>K: ' + my.kills + '</span>' +
                        '<span>D: ' + my.deaths + '</span>' +
                        '<span>A: ' + my.assists + '</span>' +
                    '</div>' +
                    '<div class="match-my-changes">' +
                        '<span class="elo-badge">' + eloText + ' ELO</span>' +
                        '<span class="coins-badge">' + coinText + ' монет</span>' +
                    '</div>' +
                '</div>';
        }

        function renderTeam(team, teamLetter, isWinner) {
            if (!team || team.length === 0) return '';
            let html = '<div class="match-team ' + (isWinner ? 'winner' : 'loser') + '">';
            html += '<div class="match-team-head">';
            html += '<span class="match-team-name">Команда ' + teamLetter + (isWinner ? ' 🏆' : '') + '</span>';
            html += '<span class="match-team-count">' + team.length + ' игроков</span>';
            html += '</div>';
            team.forEach(p => {
                const isMe = tgUser && Number(p.user_id) === Number(tgUser.id);
                const avatarStyle = p.avatar ? 'style="background-image:url(' + p.avatar + ')"' : '';
                const avatarText = p.avatar ? '' : (p.nickname || '?').charAt(0).toUpperCase();
                const eloChange = p.elo_change || 0;
                const eloText = (eloChange >= 0 ? '+' : '') + eloChange;
                html += '<div class="match-player ' + (isMe ? 'me' : '') + '">';
                html += '<div class="match-player-avatar" ' + avatarStyle + '>' + avatarText + '</div>';
                html += '<div class="match-player-nick">' + escapeHtml(p.nickname) + (isMe ? ' (ты)' : '') + '</div>';
                html += '<div class="match-player-stats">K ' + p.kills + ' / D ' + p.deaths + ' / A ' + p.assists + '</div>';
                html += '<div class="match-player-elo ' + (eloChange >= 0 ? 'plus' : 'minus') + '">' + eloText + '</div>';
                html += '</div>';
            });
            html += '</div>';
            return html;
        }

        content.innerHTML =
            '<div class="match-modal-header">' +
                '<div class="match-modal-mode">' + m.mode + '</div>' +
                '<div class="match-modal-map">' + m.map + '</div>' +
                '<div class="match-modal-date">' + m.date + '</div>' +
            '</div>' +
            '<div class="match-modal-score">' +
                '<div class="match-score-side ' + (winnerA ? 'winner' : '') + '">' +
                    '<div class="match-score-label">Команда A</div>' +
                    '<div class="match-score-value">' + m.score_a + '</div>' +
                '</div>' +
                '<div class="match-score-sep">:</div>' +
                '<div class="match-score-side ' + (winnerB ? 'winner' : '') + '">' +
                    '<div class="match-score-label">Команда B</div>' +
                    '<div class="match-score-value">' + m.score_b + '</div>' +
                '</div>' +
            '</div>' +
            myResultBlock +
            '<div class="match-teams">' +
                renderTeam(data.team_a, 'A', winnerA) +
                renderTeam(data.team_b, 'B', winnerB) +
            '</div>';

    } catch (e) {
        console.error('Ошибка загрузки матча:', e);
        content.innerHTML = '<div class="match-error">Не удалось загрузить матч</div>';
    }
}

function closeMatchModal() {
    const modal = document.getElementById('match-modal-overlay');
    if (modal) modal.classList.remove('active');
}

// ==== ОБРАБОТЧИКИ КНОПОК ====
const allMatchesBtn = document.getElementById('all-matches-btn');
if (allMatchesBtn) {
    allMatchesBtn.addEventListener('click', () => {
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });
}

const matchModalCloseBtn = document.getElementById('match-modal-close');
if (matchModalCloseBtn) {
    matchModalCloseBtn.addEventListener('click', function() {
        const modal = document.getElementById('match-modal-overlay');
        if (modal) modal.classList.remove('active');
    });
}

const matchModalOverlay = document.getElementById('match-modal-overlay');
if (matchModalOverlay) {
    matchModalOverlay.addEventListener('click', function(e) {
        if (e.target === matchModalOverlay) matchModalOverlay.classList.remove('active');
    });
}


// ==== ДОСТИЖЕНИЯ В ПРОФИЛЕ ====
async function loadAndRenderAchievements(userId) {
    const el = document.getElementById('user-achievements');
    if (!el) return;
    const list = await loadAchievements(userId);
    el.innerHTML = renderAchievementsSection(list);
    // Пере-применяем анимации
    el.querySelectorAll('.ach-mini').forEach((node, i) => {
        node.style.animation = 'none';
        node.offsetHeight;
        node.style.animation = 'achPopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both';
        node.style.animationDelay = (i * 60) + 'ms';
    });
}
