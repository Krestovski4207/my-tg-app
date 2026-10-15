// ==== НАСТРОЙКИ + УВЕДОМЛЕНИЯ (с анимациями) ====
console.log('=== settings-notif.js loaded ===');

let _notifPollTimer = null;
let _notifLastUnread = 0;
let _notifCache = [];

// ============ НАСТРОЙКИ ============
function openSettings() {
    const modal = document.getElementById('modal-settings-overlay');
    if (!modal) return;
    modal.classList.add('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}

function closeSettings() {
    const modal = document.getElementById('modal-settings-overlay');
    if (!modal) return;
    modal.classList.remove('active');
}

// ============ УВЕДОМЛЕНИЯ ============
function openNotifications() {
    const modal = document.getElementById('modal-notif-overlay');
    if (!modal) return;
    modal.classList.add('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    loadNotifications(true);
}

function closeNotifications() {
    const modal = document.getElementById('modal-notif-overlay');
    if (!modal) return;
    modal.classList.remove('active');
}

// Иконки для типов уведомлений
function notifIcon(iconName) {
    const map = {
        trophy: '<path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M6 3h12v7a6 6 0 0 1-12 0z"/><path d="M9 21h6"/><path d="M12 16v5"/>',
        ticket: '<path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 6v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-6z"/><path d="M13 5v2M13 11v2M13 17v2"/>',
        shield: '<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
        check: '<path d="M5 12.5l5 5 9-11"/>',
        close: '<path d="M18 6L6 18M6 6l12 12"/>'
    };
    const path = map[iconName] || map.bell;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
}

// Форматирование времени
function notifTime(created_at) {
    if (!created_at) return '';
    try {
        const d = new Date(created_at.replace(' ', 'T') + 'Z');
        const now = new Date();
        const diff = Math.floor((now - d) / 1000); // сек
        if (diff < 60) return 'только что';
        if (diff < 3600) return Math.floor(diff / 60) + ' мин назад';
        if (diff < 86400) return Math.floor(diff / 3600) + ' ч назад';
        if (diff < 604800) return Math.floor(diff / 86400) + ' дн назад';
        return created_at.substring(0, 10);
    } catch (e) {
        return created_at.substring(5, 16);
    }
}

// Загрузка уведомлений
async function loadNotifications(animate = false) {
    if (!tgUser) return;
    const list = document.getElementById('notif-list');
    if (!list) return;

    try {
        const data = await apiGet('/api/notifications?tg_id=' + tgUser.id);
        const items = (data && data.items) || [];
        const unread = (data && data.unread) || 0;

        // Обновить бейдж
        updateNotifBadge(unread);

        _notifCache = items;

        if (items.length === 0) {
            list.innerHTML = '<div class="notif-empty">Пока нет уведомлений</div>';
            return;
        }

        let html = '';
        items.forEach((n, i) => {
            const readClass = n.is_read ? 'is-read' : '';
            const icon = notifIcon(n.icon || 'bell');
            const time = notifTime(n.created_at);
            html += `<div class="notif-item ${readClass}" data-notif-id="${n.id}" data-notif-link="${n.link || ''}" style="animation-delay:${i * 40}ms;">
                <div class="notif-item-icon icon-${n.type}">${icon}</div>
                <div class="notif-item-body">
                    <div class="notif-item-title">${escapeHtml(n.title)}</div>
                    ${n.text ? '<div class="notif-item-text">' + escapeHtml(n.text) + '</div>' : ''}
                    <div class="notif-item-time">${time}</div>
                </div>
                ${!n.is_read ? '<div class="notif-item-dot"></div>' : ''}
            </div>`;
        });
        list.innerHTML = html;

        // Обработчики
        list.querySelectorAll('.notif-item[data-notif-id]').forEach(el => {
            el.addEventListener('click', () => {
                const id = parseInt(el.dataset.notifId);
                const link = el.dataset.notifLink;
                handleNotifClick(id, link, el);
            });
        });
    } catch (e) {
        console.error('Ошибка загрузки уведомлений:', e);
        list.innerHTML = '<div class="notif-empty">Ошибка загрузки</div>';
    }
}

// Клик по уведомлению
async function handleNotifClick(notifId, link, el) {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');

    // Анимация fade-out
    el.classList.add('notif-fade-out');

    // Помечаем прочитанным
    try {
        await apiPost('/api/notifications/read', { tg_id: tgUser.id, notif_id: notifId });
    } catch (e) {}

    setTimeout(() => {
        el.classList.add('is-read');
        el.classList.remove('notif-fade-out');
        const dot = el.querySelector('.notif-item-dot');
        if (dot) dot.remove();
        updateNotifBadge(Math.max(0, _notifLastUnread - 1));
    }, 200);

    // Закрываем модалку
    setTimeout(() => {
        closeNotifications();

        // Переходим на нужную вкладку
        if (link) {
            const tabMap = {
                'profile': 'profile',
                'ticket': 'ticket',
                'clan': 'clan',
                'tournaments': null // открыть модалку турниров
            };
            const tab = tabMap[link];
            if (tab) {
                const tabBtn = document.querySelector('.tab-btn[data-tab="' + tab + '"]');
                if (tabBtn) tabBtn.click();
            } else if (link === 'tournaments' && typeof openTournamentsModal === 'function') {
                openTournamentsModal();
            }
        }
    }, 350);
}

// Бейдж
function updateNotifBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;

    _notifLastUnread = count;

    if (count <= 0) {
        badge.style.display = 'none';
        badge.classList.remove('show');
        return;
    }

    badge.textContent = count > 99 ? '99+' : count;
    badge.style.display = 'flex';

    // Анимация появления
    badge.classList.remove('show');
    void badge.offsetWidth;
    badge.classList.add('show');

    // Вибрация при новом уведомлении
    if (count > _notifLastUnread && tg && tg.HapticFeedback) {
        try { tg.HapticFeedback.notificationOccurred('warning'); } catch (e) {}
    }
}

// Поллинг
async function checkUnreadNotifications() {
    if (!tgUser) return;
    try {
        const data = await apiGet('/api/notifications/unread_count?tg_id=' + tgUser.id);
        const unread = (data && data.unread) || 0;

        // Новое уведомление — показать баннер? Нет, просто бейдж
        const prev = _notifLastUnread;
        updateNotifBadge(unread);

        // Если открыта модалка — обновить список
        const modal = document.getElementById('modal-notif-overlay');
        if (modal && modal.classList.contains('active')) {
            loadNotifications(false);
        }
    } catch (e) {}
}

function startNotifPolling() {
    if (_notifPollTimer) return;
    checkUnreadNotifications();
    _notifPollTimer = setInterval(checkUnreadNotifications, 10000);
}

// Инициализация
function initSettingsNotif() {
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.addEventListener('click', openSettings);

    const btnNotif = document.getElementById('btn-notifications');
    if (btnNotif) btnNotif.addEventListener('click', openNotifications);

    const settingsClose = document.getElementById('settings-close');
    if (settingsClose) settingsClose.addEventListener('click', closeSettings);

    const notifClose = document.getElementById('notif-close');
    if (notifClose) notifClose.addEventListener('click', closeNotifications);

    const settingsOv = document.getElementById('modal-settings-overlay');
    if (settingsOv) settingsOv.addEventListener('click', (e) => {
        if (e.target === settingsOv) closeSettings();
    });

    const notifOv = document.getElementById('modal-notif-overlay');
    if (notifOv) notifOv.addEventListener('click', (e) => {
        if (e.target === notifOv) closeNotifications();
    });

    // Запускаем поллинг
    setTimeout(startNotifPolling, 1500);

    console.log('✓ settings-notif handlers ready');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSettingsNotif);
} else {
    initSettingsNotif();
}

window.openSettings = openSettings;
window.openNotifications = openNotifications;

console.log('=== settings-notif.js DONE ===');
