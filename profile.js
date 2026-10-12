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
            el.innerHTML = '🛡 [' + escapeHtml(res.clan.tag) + '] ' + escapeHtml(res.clan.name);
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
            el.textContent = '🏳 Свободный агент';
            el.onclick = null;
        }
    } catch (e) {
        el.className = 'user-clan free';
        el.textContent = '🏳 Свободный агент';
    }
}

function renderProfile(p) {
    const avatarEl = document.getElementById('user-avatar');

    let avatarSrc = p.avatar_url;
    if (!avatarSrc && tgUser && Number(tgUser.id) === Number(p.user_id)) {
        if (tgUser.photo_url) {
            avatarSrc = tgUser.photo_url;
        }
    }

    if (avatarSrc) {
        avatarEl.style.backgroundImage = 'url(' + avatarSrc + ')';
        avatarEl.textContent = '';
        avatarEl.classList.add('has-photo');
    } else {
        avatarEl.style.backgroundImage = 'none';
        avatarEl.classList.remove('has-photo');
        avatarEl.textContent = (p.nickname || '?').charAt(0).toUpperCase();
    }

    document.getElementById('user-name').textContent = p.nickname || '—';

    const pidEl = document.getElementById('user-player-id');
    if (pidEl) {
        pidEl.textContent = 'ID: ' + (p.player_id || '—');
    } else {
        const oldId = document.getElementById('user-id');
        if (oldId) oldId.textContent = 'ID: ' + (p.player_id || '—');
    }

    // ==== БЕЙДЖ (звёздочка-галочка) ====
    const badge = document.getElementById('user-badge');
    const isThisUserAdmin = (Number(p.user_id) === Number(ADMIN_ID));

    if (isThisUserAdmin) {
        badge.innerHTML = `<svg class="verified-badge" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="display:block;width:16px;height:16px;filter:drop-shadow(0 0 4px rgba(22,163,74,0.6));">
            <path d="M12 1.5l2.4 2.1 3.2-.4.4 3.2 2.7 1.7-1.3 2.9 1.3 2.9-2.7 1.7-.4 3.2-3.2-.4L12 22.5l-2.4-2.1-3.2.4-.4-3.2L3.3 15.9l1.3-2.9-1.3-2.9L6 8.4l.4-3.2 3.2.4z" fill="#15803d"/>
            <path d="M8.5 12l2.4 2.4L16 9.3" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
        badge.className = 'user-badge admin-svg';
        badge.style.display = 'inline-flex';
    } else {
        badge.innerHTML = '<span>🎮</span> Игрок';
        badge.className = 'user-badge player';
        badge.style.display = 'inline-flex';
    }

    const level = p.level || 1;
    const elo = p.elo || 0;

    document.getElementById('lvl-num').textContent = level;
    const lvlTextEl = document.getElementById('lvl-num-text');
    if (lvlTextEl) lvlTextEl.textContent = level;

    const diamondEl = document.querySelector('.mini-lvl-diamond');
    if (diamondEl) {
        let displayLevel = level;
        if (displayLevel > 10) displayLevel = 10;
        if (displayLevel < 1) displayLevel = 1;
        diamondEl.setAttribute('data-level', displayLevel);
    }

    document.getElementById('elo-value').textContent = elo;

    const levelStep = 200;
    const current = elo % levelStep;

    const progressFill = document.getElementById('elo-progress');
    if (progressFill) {
        progressFill.style.width = ((current / levelStep) * 100) + '%';
    }

    const progressLabel = document.getElementById('progress-label');
    if (progressLabel) {
        if (level >= 10) {
            progressLabel.textContent = 'Достигнут максимальный уровень';
        } else {
            progressLabel.textContent = (levelStep - current) + ' ELO до следующего';
        }
    }

    document.getElementById('stat-win').textContent = p.wins || 0;
    document.getElementById('stat-lose').textContent = p.losses || 0;
    document.getElementById('stat-kd').textContent = (p.kd || 0).toFixed(2);
    document.getElementById('stat-avg').textContent = '0.0';
    document.getElementById('stat-game').textContent = p.matches_count || 0;
    document.getElementById('stat-wr').textContent = (p.winrate || 0) + '%';
    document.getElementById('likes-count').textContent = p.likes || 0;
    document.getElementById('pop-count').textContent = (p.likes || 0) - (p.dislikes || 0);

    const card = document.querySelector('.user-card');
    if (card) {
        if (p.banner_url) {
            const fullBannerUrl = API_URL + p.banner_url;
            card.style.setProperty('--banner-url', 'url(' + fullBannerUrl + ')');
            card.classList.add('has-banner');
        } else {
            card.classList.remove('has-banner');
            card.style.removeProperty('--banner-url');
        }
    }

    renderChart(p.elo || 0, p.ratingHistory || []);
    renderMatches(p.matches || []);
}

// ==== ГРАФИК ====
let chartInstance = null;
function renderChart(currentElo, history) {
    const chartEl = document.getElementById('ratingChart');
    if (!chartEl) return;

    document.getElementById('chart-elo').textContent = currentElo;
    if (!history || history.length === 0) history = [{ date: 'now', value: currentElo }];

    const first = history[0]?.value || currentElo;
    const last = history[history.length - 1]?.value || currentElo;
    const delta = last - first;

    const deltaEl = document.getElementById('chart-delta');
    deltaEl.textContent = (delta >= 0 ? '+' : '') + delta;
    deltaEl.style.color = delta >= 0 ? '#22ff88' : '#ff4d5e';

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

// ==== МАТЧИ ====
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

// ==== МОДАЛКА ДЕТАЛЕЙ МАТЧА ====
async function openMatchModal(matchId) {
    const modal = document.getElementById('match-modal-overlay');
    if (!modal) return;

    const content = document.getElementById('match-modal-content');
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
                        '<span class="coins-badge">' + coinText + ' 🪙</span>' +
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
                '<div class="match-modal-map">🗺 ' + m.map + '</div>' +
                '<div class="match-modal-date">📅 ' + m.date + '</div>' +
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
        content.innerHTML = '<div class="match-error">⚠ Не удалось загрузить матч</div>';
    }
}

function closeMatchModal() {
    const modal = document.getElementById('match-modal-overlay');
    if (modal) modal.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('match-modal-close');
    if (closeBtn) closeBtn.addEventListener('click', closeMatchModal);
    const overlay = document.getElementById('match-modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeMatchModal();
        });
    }
});

const allMatchesBtn = document.getElementById('all-matches-btn');
if (allMatchesBtn) {
    allMatchesBtn.addEventListener('click', () => {
        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });
}
