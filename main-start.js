// ==== ОБРАБОТЧИКИ ВКЛАДОК ====
document.querySelectorAll('.tab-btn:not(.tab-btn-play)').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tabEl = document.getElementById('tab-' + tabName);
        if (tabEl) tabEl.classList.add('active');

        if (tg?.HapticFeedback) tg.HapticFeedback.selectionChanged();

        if (tabName === 'ticket' && typeof onTicketTabOpen === 'function') {
            onTicketTabOpen();
        }
        if (tabName === 'top' && typeof loadTop === 'function') {
            loadTop();
        }
        if (tabName === 'messages' && typeof loadDialogs === 'function') {
            // Если открыт глобальный чат — оставляем, иначе грузим диалоги
            if (typeof globalChatActive !== 'undefined' && !globalChatActive) {
                loadDialogs();
            }
        }
        if (tabName === 'profile' && typeof loadProfile === 'function') {
            loadProfile();
        }
        if (tabName === 'admin' && typeof loadAdminHome === 'function') {
            loadAdminHome();
        }
        if (tabName !== 'messages' && typeof stopChatPolling === 'function') {
            stopChatPolling();
        }
        if (tabName !== 'clan' && typeof stopClanChatPolling === 'function') {
            stopClanChatPolling();
        }
        if (tabName !== 'messages' && typeof stopDialogPolling === 'function') {
            stopDialogPolling();
        }
    });
});

// ==== КНОПКА КЛАН ====
const btnOpenClan = document.getElementById('btn-open-clan');
if (btnOpenClan) {
    btnOpenClan.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const clanContent = document.getElementById('tab-clan');
        if (clanContent) clanContent.classList.add('active');
        if (typeof loadClan === 'function') loadClan();
    });
}

// ==== СТАРТ ====
async function boot() {
    const loader = document.getElementById('app-loader');

    try {
        await Promise.all([
            typeof loadProfile === 'function' ? loadProfile() : Promise.resolve(),
            typeof loadTop === 'function' ? loadTop() : Promise.resolve()
        ]);
    } catch (e) {
        console.error('Ошибка загрузки:', e);
    }

    if (typeof initAdmin === 'function') {
        try { await initAdmin(); } catch (e) { console.error('Ошибка админки:', e); }
    }

    if (typeof updateUnreadBadges === 'function') {
        updateUnreadBadges();
        setInterval(updateUnreadBadges, 10000);
    }

    setTimeout(() => {
        if (loader) loader.classList.add('hidden');
    }, 400);
}

boot();
