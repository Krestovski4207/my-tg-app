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

    console.log('=== BOOT START ===');
    console.log('loadProfile:', typeof loadProfile);
    console.log('loadTop:', typeof loadTop);
    console.log('apiGet:', typeof apiGet);
    console.log('tgUser:', typeof tgUser !== 'undefined' ? tgUser : 'undefined');

    try {
        if (typeof loadProfile === 'function') {
            console.log('→ Вызываю loadProfile...');
            await loadProfile();
            console.log('→ loadProfile завершена');
        } else {
            console.log('⚠ loadProfile не функция!');
        }
    } catch (e) {
        console.error('❌ Ошибка loadProfile:', e);
    }

    try {
        if (typeof loadTop === 'function') {
            await loadTop();
        }
    } catch (e) {
        console.error('❌ Ошибка loadTop:', e);
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
