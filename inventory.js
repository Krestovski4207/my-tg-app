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
                const framesEl = document.getElementById('inv-frames');
                if (framesEl) framesEl.style.display = target === 'frames' ? 'block' : 'none';
                if (target === 'frames') loadFrames();
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


    // ===== РАМКИ =====
    async function loadFrames() {
        const container = document.getElementById('inv-frames');
        if (!container) return;
        container.innerHTML = '<div class="tn-loading">Загрузка...</div>';

        const userId = getUserId();
        const api = getApiUrl();

        try {
            const [shop, inv, profile] = await Promise.all([
                fetch(api + '/api/shop/frames').then(r => r.json()),
                fetch(api + '/api/inventory?tg_id=' + userId).then(r => r.json()),
                fetch(api + '/api/profile?tg_id=' + userId).then(r => r.json())
            ]);

            const ownedIds = new Set((inv || []).filter(i => i.item_type === 'frame').map(i => i.item_id));
            const activeFrame = profile ? profile.avatar_frame : null;

            if (!shop || !shop.length) {
                container.innerHTML = '<div class="map-empty">Рамок пока нет</div>';
                return;
            }

            let html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:8px;">';
            shop.forEach(f => {
                const url = api + '/api/frame_file/' + f.id;
                const isOwned = ownedIds.has(f.id);
                const isActive = activeFrame === f.id;
                
                html += `
                    <div class="frame-card" style="background:rgba(21,10,32,0.8);border:1px solid ${isActive ? '#a855f7' : 'rgba(168,85,247,0.2)'};border-radius:12px;padding:12px;text-align:center;">
                        <div style="width:100%;height:120px;background:rgba(15,6,24,0.6);border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;">
                            <img src="${url}" style="max-width:100%;max-height:100%;object-fit:contain;">
                        </div>
                        <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;">${f.name}</div>
                        <div style="font-size:12px;color:#8a7a9b;margin-bottom:8px;">💰 ${f.price} LM</div>
                        ${isActive ? '<button class="inv-btn" style="background:#333;color:#fff;width:100%;padding:8px;border:none;border-radius:6px;font-weight:700;font-size:12px;" disabled>✓ Надета</button>' :
                          isOwned ? `<button class="inv-btn frame-activate" data-id="${f.id}" style="background:#a855f7;color:#fff;width:100%;padding:8px;border:none;border-radius:6px;font-weight:700;font-size:12px;cursor:pointer;">Надеть</button>` :
                          `<button class="inv-btn frame-buy" data-id="${f.id}" data-price="${f.price}" style="background:#a855f7;color:#fff;width:100%;padding:8px;border:none;border-radius:6px;font-weight:700;font-size:12px;cursor:pointer;">Купить за ${f.price} LM</button>`}
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            // Обработчики
            container.querySelectorAll('.frame-buy').forEach(btn => {
                btn.onclick = async () => {
                    const id = parseInt(btn.dataset.id);
                    const price = parseInt(btn.dataset.price);
                    if (!confirm(`Купить рамку за ${price} LM?`)) return;
                    
                    btn.disabled = true;
                    btn.textContent = '...';
                    
                    try {
                        const res = await fetch(api + '/api/shop/buy_frame', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId, frame_id: id })
                        }).then(r => r.json());
                        
                        if (res.error) {
                            toast('❌ ' + res.error);
                            btn.disabled = false;
                            btn.textContent = 'Купить';
                        } else {
                            toast('✓ Рамка куплена!');
                            loadFrames();
                        }
                    } catch (e) {
                        toast('❌ Ошибка сети');
                        btn.disabled = false;
                    }
                };
            });

            container.querySelectorAll('.frame-activate').forEach(btn => {
                btn.onclick = async () => {
                    const id = parseInt(btn.dataset.id);
                    btn.disabled = true;
                    btn.textContent = '...';
                    
                    try {
                        const res = await fetch(api + '/api/inventory/activate_frame', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId, frame_id: id })
                        }).then(r => r.json());
                        
                        if (res.error) {
                            toast('❌ ' + res.error);
                            btn.disabled = false;
                            btn.textContent = 'Надеть';
                        } else {
                            toast('✓ Рамка надета!');
                            loadFrames();
                        }
                    } catch (e) {
                        toast('❌ Ошибка сети');
                        btn.disabled = false;
                    }
                };
            });

        } catch (e) {
            container.innerHTML = '<div class="map-empty">Ошибка: ' + e.message + '</div>';
        }
    }

    // Экспортируем функцию
    window.loadFrames = loadFrames;

})();
