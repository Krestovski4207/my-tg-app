// ================== ФОН ПРОФИЛЯ (видео/gif на весь .app) ==================
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

    async function loadAppBackground() {
        const userId = getUserId();
        if (!userId) return;

        const api = getApiUrl();
        if (!api) return;

        try {
            const data = await fetch(api + '/api/user/' + userId).then(r => r.json());
            
            // Удаляем старый фон если есть
            document.querySelectorAll('.app-bg-media').forEach(el => el.remove());

            if (!data.banner_custom_url || !data.banner_custom_type) {
                // Кастомного нет — используем обычный (статичный) баннер как фон
                if (data.banner_url) {
                    addBackgroundImage(api + data.banner_url);
                }
                return;
            }

            const btype = data.banner_custom_type;
            const fullUrl = api + data.banner_custom_url;

            if (btype === 'webm' || btype === 'mp4') {
                const video = document.createElement('video');
                video.className = 'app-bg-media';
                video.src = fullUrl;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.playsInline = true;
                video.setAttribute('playsinline', '');
                video.setAttribute('muted', '');
                const app = document.querySelector('.app');
                if (app) app.insertBefore(video, app.firstChild);
            } else if (btype === 'gif') {
                const img = document.createElement('img');
                img.className = 'app-bg-media';
                img.src = fullUrl;
                img.alt = '';
                const app = document.querySelector('.app');
                if (app) app.insertBefore(img, app.firstChild);
            } else if (data.banner_url) {
                addBackgroundImage(api + data.banner_url);
            }
        } catch (e) {
            console.error('[BG]', e);
        }
    }

    function addBackgroundImage(url) {
        const div = document.createElement('div');
        div.className = 'app-bg-media';
        div.style.backgroundImage = 'url(' + url + ')';
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';
        const app = document.querySelector('.app');
        if (app) app.insertBefore(div, app.firstChild);
    }

    // Экспорт для перезагрузки после загрузки нового баннера
    window.reloadAppBackground = loadAppBackground;

    // Загрузка при старте
    document.addEventListener('DOMContentLoaded', loadAppBackground);

    // На случай если DOM уже загружен
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(loadAppBackground, 200);
    }
})();
