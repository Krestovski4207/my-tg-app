// ==========================================
// ПЕРЕХВАТЧИК РЕНДЕРА ЛОББИ (ПОВЕРХ lobby_v2.js)
// ==========================================
(function() {
    'use strict';
    if (window.__lobbyDesignInit) return;
    window.__lobbyDesignInit = true;

    // Ждем, пока lobby_v2.js загрузится и начнет рисовать
    function waitForLobby() {
        const container = document.getElementById('play-lobbies-list') 
                       || document.querySelector('.lobbies-grid')
                       || document.querySelector('.lobbies-list');
        if (!container) { setTimeout(waitForLobby, 500); return; }
        
        // Если контейнер уже с карточками — заменяем их
        if (container.children.length > 0) {
            enhanceCards(container);
        }

        // Наблюдаем за изменениями
        const observer = new MutationObserver(() => {
            enhanceCards(container);
        });
        observer.observe(container, { childList: true, subtree: false });
    }

    function enhanceCards(container) {
        // Ищем старые карточки
        const oldCards = container.querySelectorAll('.lobby-card:not(.lobby-enhanced)');
        if (oldCards.length === 0) return;

        oldCards.forEach(oldCard => {
            // Пытаемся достать данные из data-атрибутов
            const lobbyIdEl = oldCard.querySelector('.lobby-num');
            if (!lobbyIdEl) return;
            
            const lobbyId = lobbyIdEl.textContent.match(/\d+/)?.[0];
            if (!lobbyId) return;

            // Пока просто помечаем карточку как enhanced, чтобы не перерисовывать дважды
            oldCard.classList.add('lobby-enhanced');
            
            // Добавляем стеклянный эффект
            oldCard.style.background = 'rgba(21, 10, 32, 0.4)';
            oldCard.style.backdropFilter = 'blur(12px)';
            oldCard.style.border = '1px solid rgba(168, 85, 247, 0.3)';
            oldCard.style.borderRadius = '16px';
            oldCard.style.padding = '16px';
        });
    }

    window.addEventListener('load', () => {
        setTimeout(waitForLobby, 1500);
    });
})();
