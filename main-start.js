// ==== BOOT ====
function boot() {
    console.log('=== BOOT START ===');
    console.log('loadProfile:', typeof loadProfile);
    console.log('loadTop:', typeof loadTop);
    console.log('apiGet:', typeof apiGet);
    console.log('tgUser:', tgUser?.id);
    console.log('API_URL:', API_URL);

    if (typeof loadProfile === 'function') {
        loadProfile();
    } else {
        console.error('loadProfile НЕ функция!');
    }

    if (typeof loadTop === 'function') {
        loadTop();
    }

    // Показать админ-вкладку
    const adminTab = document.querySelector('.admin-tab');
    if (adminTab && isAdmin) {
        adminTab.style.display = '';
    }

    // Скрыть лоадер
    const loader = document.getElementById('app-loader');
    if (loader) {
        setTimeout(() => loader.classList.add('hidden'), 400);
    }
}

// ==== Переключение вкладок ====
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (!tab) return;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const content = document.getElementById('tab-' + tab);
        if (content) content.classList.add('active');

        if (tab === 'top' && typeof loadTop === 'function') loadTop();
        if (tab === 'clan' && typeof loadClan === 'function') loadClan();
        if (tab === 'messages' && typeof loadDialogs === 'function') loadDialogs();
        if (tab === 'ticket' && typeof loadMyTickets === 'function') loadMyTickets();
        if (tab === 'admin' && typeof loadAdmin === 'function') loadAdmin();
        if (tab === 'play' && typeof openPlayModal === 'function') openPlayModal();

        if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    });
});

// ==== Старт ====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
