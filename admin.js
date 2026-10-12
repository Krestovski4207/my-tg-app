// ==== АДМИН-ПАНЕЛЬ ====
let adminStats = null;

async function checkAdminAccess() {
    if (!tgUser) return false;
    try {
        const res = await apiGet('/api/admin/check?tg_id=' + tgUser.id);
        return res.is_admin === true;
    } catch (e) {
        return false;
    }
}

async function initAdmin() {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) return;

    // Показать вкладку
    const tab = document.querySelector('.tab-btn.admin-tab');
    if (tab) tab.style.display = 'flex';

    // Показать секцию (если уже не показана)
    const section = document.getElementById('tab-admin');
    if (section) section.style.display = 'none'; // пока не активна

    loadAdminHome();
}

async function loadAdminHome() {
    const container = document.getElementById('admin-content');
    if (!container) return;
    container.innerHTML = '<div class="map-empty">Загрузка...</div>';

    try {
        adminStats = await apiGet('/api/admin/stats?tg_id=' + tgUser.id);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="map-empty">Ошибка загрузки</div>';
        return;
    }

    container.innerHTML = `
        <div class="section-head centered">
            <div class="section-title">⚙️ Админ-панель</div>
        </div>

        <div class="admin-stats">
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.users}</div>
                <div class="admin-stat-label">Игроков</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.matches}</div>
                <div class="admin-stat-label">Матчей</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.clans}</div>
                <div class="admin-stat-label">Кланов</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.tickets}</div>
                <div class="admin-stat-label">Тикетов</div>
            </div>
            <div class="admin-stat-card">
                <div class="admin-stat-value">${adminStats.active_24h}</div>
                <div class="admin-stat-label">Активных 24ч</div>
            </div>
        </div>

        <div class="section-head centered">
            <div class="section-title">Разделы</div>
        </div>

        <div class="admin-grid">
            <button class="admin-tile" data-action="users">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="8" r="4"/>
                    <path d="M2 21c0-4 3.5-6 7-6s7 2 7 6"/>
                    <circle cx="18" cy="9" r="2.5"/>
                    <path d="M15.5 21c0-2.5 1.5-4 3.5-4s3.5 1.5 3.5 4"/>
                </svg>
                <span>Игроки</span>
            </button>

            <button class="admin-tile" data-action="clans">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/>
                </svg>
                <span>Кланы</span>
            </button>

            <button class="admin-tile" data-action="chats">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a8 8 0 0 1-8 8H6l-3 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z"/>
                </svg>
                <span>Чаты</span>
            </button>

            <button class="admin-tile" data-action="tickets">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z"/>
                    <path d="M13 5v2M13 11v2M13 17v2"/>
                </svg>
                <span>Тикеты</span>
            </button>

            <button class="admin-tile" data-action="logs">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <path d="M14 2v6h6"/>
                    <path d="M8 13h8M8 17h8M8 9h2"/>
                </svg>
                <span>Логи</span>
            </button>

            <button class="admin-tile" data-action="broadcast">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 11l19-9-9 19-2-8-8-2z"/>
                </svg>
                <span>Рассылка</span>
            </button>

            <button class="admin-tile" data-action="promos">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 12a2 2 0 0 0 0-4V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0 0 4v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2a2 2 0 0 0 0-4z"/>
                    <path d="M13 5v2M13 11v2M13 17v2"/>
                </svg>
                <span>Промокоды</span>
            </button>

            <button class="admin-tile" data-action="seasons">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                <span>Сезоны</span>
            </button>
        </div>
    `;

    // Обработчики плиток
    container.querySelectorAll('.admin-tile').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'users') showAdminUsers();
            else if (action === 'clans') showAdminClans();
            else if (action === 'chats') showAdminChats();
            else if (action === 'tickets') showAdminTickets();
            else if (action === 'logs') showAdminLogs();
            else if (action === 'broadcast') showAdminBroadcast();
            else if (action === 'promos') showAdminPromos();
            else if (action === 'seasons') showAdminSeasons();
            else showToast('⚠ Раздел в разработке');
        });
    });
}

// ==== Заглушки разделов (пока не реализованы) ====
function showAdminUsers() { showToast('⚠ Раздел «Игроки» — в разработке'); }
function showAdminClans() { showToast('⚠ Раздел «Кланы» — в разработке'); }
function showAdminChats() { showToast('⚠ Раздел «Чаты» — в разработке'); }
function showAdminTickets() { showToast('⚠ Раздел «Тикеты» — в разработке'); }
function showAdminLogs() { showToast('⚠ Раздел «Логи» — в разработке'); }
function showAdminBroadcast() { showToast('⚠ Раздел «Рассылка» — в разработке'); }
function showAdminPromos() { showToast('⚠ Раздел «Промокоды» — в разработке'); }
function showAdminSeasons() { showToast('⚠ Раздел «Сезоны» — в разработке'); }
