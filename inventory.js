// ================== ИНВЕНТАРЬ + МАГАЗИН БАННЕРОВ ==================
(function() {
    'use strict';

    function getUserId() {
        try {
            if (window.tgUser && window.tgUser.id) return window.tgUser.id;
            const tg = window.Telegram?.WebApp;
            if (tg?.initDataUnsafe?.user) return tg.initDataUnsafe.user.id;
        } catch (e) {}
        return null;
    }

    function getApiUrl() {
        try {
            if (typeof API_URL !== 'undefined') return API_URL;
            if (window.API_URL) return window.API_URL;
        } catch (e) {}
        return '';
    }

    function toast(text) {
        let t = document.getElementById('inv-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'inv-toast';
            t.style.cssText = 'position:fixed;top:24px;left:50%;transform:translate(-50%,-20px);background:rgba(30,27,46,0.95);border:1px solid rgba(168,85,247,0.4);color:#fff;font-size:14px;font-weight:600;padding:12px 20px;border-radius:12px;z-index:100000;opacity:0;transition:all 0.25s ease;pointer-events:none;max-width:90vw;text-align:center;';
            document.body.appendChild(t);
        }
        t.textContent = text;
        requestAnimationFrame(() => t.style.opacity = '1');
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2600);
    }

    // ===== Загрузка магазина =====
    async function loadShop() {
        const container = document.getElementById('inv-shop');
        if (!container) return;
        container.innerHTML = '<div class="tn-loading">Загрузка...</div>';

        const userId = getUserId();
        const api = getApiUrl();

        try {
            const [shop, inv] = await Promise.all([
                fetch(api + '/api/shop/banners').then(r => r.json()),
                fetch(api + '/api/inventory?tg_id=' + userId).then(r => r.json())
            ]);

            const ownedIds = new Set((inv || []).map(i => i.item_id));

            if (!shop || shop.length === 0) {
                container.innerHTML = '<div class="inv-empty">Магазин пока пуст</div>';
                return;
            }

            let html = '<div class="inv-grid">';
            shop.forEach(b => {
                const owned = ownedIds.has(b.id);
                const url = api + '/api/shop/banner_file/' + b.id;
                const isVideo = b.file_type === 'webm' || b.file_type === 'mp4';

                html += `
                    <div class="inv-card" data-banner-id="${b.id}">
                        <div class="inv-card-preview">
                            ${isVideo 
                                ? `<video src="${url}" autoplay loop muted playsinline></video>` 
                                : `<img src="${url}" alt="">`}
                            <div class="inv-card-price">💰 ${b.price} LM</div>
                        </div>
                        <div class="inv-card-info">
                            <div class="inv-card-name">${b.name}</div>
                            <button class="inv-card-buy ${owned ? 'owned' : ''}" data-buy-id="${b.id}" ${owned ? 'disabled' : ''}>
                                ${owned ? '✓ Куплено' : 'Купить'}
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            // Обработчики покупки
            container.querySelectorAll('.inv-card-buy:not(:disabled)').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const bannerId = parseInt(btn.dataset.buyId);
                    await buyBanner(bannerId);
                });
            });

        } catch (e) {
            console.error('[SHOP]', e);
            container.innerHTML = '<div class="inv-empty">Ошибка загрузки</div>';
        }
    }

    async function buyBanner(bannerId) {
        const userId = getUserId();
        const api = getApiUrl();
        if (confirm('Купить этот баннер?')) {
            try {
                const res = await fetch(api + '/api/shop/buy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tg_id: userId, banner_id: bannerId })
                }).then(r => r.json());

                if (res.error) {
                    toast('❌ ' + res.error);
                    return;
                }
                toast('✓ Куплено: ' + res.name);
                loadShop();
                if (typeof window.loadProfile === 'function') window.loadProfile();
            } catch (e) {
                toast('Ошибка: ' + e.message);
            }
        }
    }

    // ===== Мои баннеры =====
    async function loadMyBanners() {
        const container = document.getElementById('inv-mine');
        if (!container) return;
        container.innerHTML = '<div class="tn-loading">Загрузка...</div>';

        const userId = getUserId();
        const api = getApiUrl();

        try {
            const inv = await fetch(api + '/api/inventory?tg_id=' + userId).then(r => r.json());

            if (!inv || inv.length === 0) {
                container.innerHTML = '<div class="inv-empty">У тебя пока нет баннеров</div>';
                return;
            }

            let html = '<div class="inv-grid">';
            inv.forEach(item => {
                if (item.item_type !== 'banner') return;
                const url = api + '/api/shop/banner_file/' + item.item_id;
                const isActive = item.is_active === 1;
                const fileType = item.file_type || 'webm';
                const isVideo = fileType === 'webm' || fileType === 'mp4';

                html += `
                    <div class="inv-card ${isActive ? 'active-banner' : ''}" data-item-id="${item.id}">
                        <div class="inv-card-preview">
                            ${isVideo 
                                ? `<video src="${url}" autoplay loop muted playsinline></video>` 
                                : `<img src="${url}" alt="">`}
                            ${isActive ? '<div class="inv-card-active-badge">АКТИВЕН</div>' : ''}
                        </div>
                        <div class="inv-card-info">
                            <div class="inv-card-name">${item.name || 'Баннер'}</div>
                            <button class="inv-card-buy ${isActive ? 'owned' : 'activate'}" 
                                    data-activate-id="${item.id}" ${isActive ? 'disabled' : ''}>
                                ${isActive ? '✓ Активен' : 'Активировать'}
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            container.querySelectorAll('.inv-card-buy:not(:disabled)').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const itemId = parseInt(btn.dataset.activateId);
                    await activateBanner(itemId);
                });
            });

        } catch (e) {
            console.error('[INV]', e);
            container.innerHTML = '<div class="inv-empty">Ошибка загрузки</div>';
        }
    }

    async function activateBanner(itemId) {
        const userId = getUserId();
        const api = getApiUrl();
        try {
            const res = await fetch(api + '/api/inventory/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tg_id: userId, item_id: itemId })
            }).then(r => r.json());

            if (res.error) {
                toast('❌ ' + res.error);
                return;
            }
            toast('✓ Баннер активирован');
            loadMyBanners();
            if (typeof window.loadProfile === 'function') window.loadProfile();
            if (typeof window.reloadAppBackground === 'function') window.reloadAppBackground();
        } catch (e) {
            toast('Ошибка: ' + e.message);
        }
    }

    // ===== Вкладки =====
    function initTabs() {
        const tabs = document.querySelectorAll('.inv-tab');
        tabs.forEach(t => {
            t.addEventListener('click', () => {
                tabs.forEach(x => x.classList.remove('active'));
                t.classList.add('active');
                const target = t.dataset.invTab;
                document.getElementById('inv-shop').style.display = target === 'shop' ? 'block' : 'none';
                document.getElementById('inv-mine').style.display = target === 'mine' ? 'block' : 'none';
                if (target === 'shop') loadShop();
                else loadMyBanners();
            });
        });
    }

    // Запуск при открытии вкладки
    window.loadInventoryScreen = function() {
        loadShop();
    };

    window.loadMyBannersScreen = function() {
        loadMyBanners();
    };

    document.addEventListener('DOMContentLoaded', () => {
        initTabs();
    });

    // Если DOM уже загружен
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(() => initTabs(), 100);
    }
})();
