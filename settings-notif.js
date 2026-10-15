// ==== НАСТРОЙКИ + УВЕДОМЛЕНИЯ ====
console.log('=== settings-notif.js loaded ===');

// Открыть настройки
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

// Открыть уведомления
function openNotifications() {
    const modal = document.getElementById('modal-notif-overlay');
    if (!modal) return;
    modal.classList.add('active');
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    loadNotifications();
}

function closeNotifications() {
    const modal = document.getElementById('modal-notif-overlay');
    if (!modal) return;
    modal.classList.remove('active');
}

// Загрузка уведомлений
async function loadNotifications() {
    const list = document.getElementById('notif-list');
    if (!list) return;

    // Пока пусто — заглушка
    list.innerHTML = '<div class="notif-empty">Пока нет уведомлений</div>';
}

// Инициализация обработчиков
function initSettingsNotif() {
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) btnSettings.addEventListener('click', openSettings);

    const btnNotif = document.getElementById('btn-notifications');
    if (btnNotif) btnNotif.addEventListener('click', openNotifications);

    const settingsClose = document.getElementById('settings-close');
    if (settingsClose) settingsClose.addEventListener('click', closeSettings);

    const notifClose = document.getElementById('notif-close');
    if (notifClose) notifClose.addEventListener('click', closeNotifications);

    // Клик по оверлею — закрыть
    const settingsOv = document.getElementById('modal-settings-overlay');
    if (settingsOv) settingsOv.addEventListener('click', (e) => {
        if (e.target === settingsOv) closeSettings();
    });

    const notifOv = document.getElementById('modal-notif-overlay');
    if (notifOv) notifOv.addEventListener('click', (e) => {
        if (e.target === notifOv) closeNotifications();
    });

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
