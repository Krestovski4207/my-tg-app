// ==== BOOT ====
function boot() {
    console.log('=== BOOT START ===');
    console.log('tnInitHandlers:', typeof tnInitHandlers);
    console.log('openTournamentsModal:', typeof openTournamentsModal);

    if (typeof loadProfile === 'function') loadProfile();
    if (typeof loadTop === 'function') loadTop();
    if (typeof initAdmin === 'function') initAdmin();

    if (typeof tnInitHandlers === 'function') {
        setTimeout(tnInitHandlers, 100);
    } else {
        console.error('tnInitHandlers НЕ функция');
    }

    const adminTab = document.querySelector('.admin-tab');
    if (adminTab && isAdmin) adminTab.style.display = '';

    const btnOpenClan = document.getElementById('btn-open-clan');
    if (btnOpenClan) {
        btnOpenClan.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const clanTab = document.querySelector('.tab-btn[data-tab="clan"]');
            if (clanTab) clanTab.classList.add('active');
            const clanContent = document.getElementById('tab-clan');
            if (clanContent) clanContent.classList.add('active');
            if (typeof loadClan === 'function') loadClan();
        });
    }

    const loader = document.getElementById('app-loader');
    if (loader) setTimeout(() => loader.classList.add('hidden'), 400);

    console.log('=== BOOT DONE ===');
}

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
    });
});

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
