// ================== MUSIC MODULE ==================
// Этап 1: открытие/закрытие модалки
// Этап 2: IndexedDB + загрузка mp3
// Этап 3: профильный трек

(function() {
    'use strict';

    const $ = (id) => document.getElementById(id);

    function openMusicModal() {
        const ov = $('modal-music-overlay');
        if (ov) {
            ov.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMusicModal() {
        const ov = $('modal-music-overlay');
        if (ov) {
            ov.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const btn = $('btn-music');
        if (btn) btn.addEventListener('click', openMusicModal);

        const closeBtn = $('music-close');
        if (closeBtn) closeBtn.addEventListener('click', closeMusicModal);

        const ov = $('modal-music-overlay');
        if (ov) {
            ov.addEventListener('click', (e) => {
                if (e.target === ov) closeMusicModal();
            });
        }
    });

    // Экспорт
    window.openMusicModal = openMusicModal;
    window.closeMusicModal = closeMusicModal;
})();
