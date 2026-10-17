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

// FIX-TABS: гарантированно привязываем обработчики
function attachTabHandlers() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (!tabBtns.length) {
        console.warn('[TABS] .tab-btn не найдены');
        return;
    }
    console.log('[TABS] Привязываем обработчики к', tabBtns.length, 'кнопкам');
    
    tabBtns.forEach(btn => {
        // Убираем старый, чтобы не дублировался
        if (btn._tabHandlerAttached) return;
        btn._tabHandlerAttached = true;
        
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (!tab) return;
            
            if (window.haptic) window.haptic('light');
            
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
}

// Привязка после загрузки DOM + на случай если DOM уже загружен
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachTabHandlers);
} else {
    attachTabHandlers();
    setTimeout(attachTabHandlers, 300);
    setTimeout(attachTabHandlers, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}


// ==== RIPPLE-ЭФФЕКТ НА ТАБАХ ====
function addTabRipple(btn, event) {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    // Позиция тапа (или центр если event нет)
    let x, y;
    if (event && event.touches && event.touches[0]) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
    } else if (event && event.clientX !== undefined) {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
    } else {
        x = rect.width / 2;
        y = rect.height / 2;
    }
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    btn.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Навешиваем обработчики на все табы
function initTabRipple() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        // Клик
        btn.addEventListener('click', function(e) {
            addTabRipple(this, e);
        });
        // Тач
        btn.addEventListener('touchstart', function(e) {
            addTabRipple(this, e);
        }, { passive: true });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTabRipple);
} else {
    initTabRipple();
}

window.initTabRipple = initTabRipple;


// ==== ЖЁСТКО СКРЫВАЕМ АДМИНКУ ПО УМОЛЧАНИЮ ====
async function hideAdminTabIfNotAdmin() {
    const adminTab = document.querySelector('.tab-btn.admin-tab');
    if (!adminTab) {
        console.warn('admin-tab не найден');
        return;
    }
    
    // Сначала скрываем на всякий случай
    adminTab.style.display = 'none';
    adminTab.style.visibility = 'hidden';
    
    // Проверяем через API
    if (!tgUser) return;
    
    try {
        const res = await apiGet('/api/admin/check?tg_id=' + tgUser.id);
        if (res && res.is_admin === true) {
            adminTab.style.display = 'flex';
            adminTab.style.visibility = 'visible';
            console.log('✓ Админ-вкладка показана');
        } else {
            console.log('✗ Не админ — вкладка скрыта');
        }
    } catch (e) {
        console.error('Ошибка проверки админа:', e);
    }
}

// Запускаем сразу при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(hideAdminTabIfNotAdmin, 300);
    });
} else {
    setTimeout(hideAdminTabIfNotAdmin, 300);
}
