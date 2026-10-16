// ================== MUSIC MODULE (IndexedDB) ==================
(function() {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const DB_NAME = 'luma_music';
    const STORE = 'tracks';

    let db = null;
    let tracks = [];         // {id, name, blob, duration, size}
    let currentIndex = -1;
    let audio = new Audio();
    let isLooping = false;

    // ============ IndexedDB ============
    function openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains(STORE)) {
                    d.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function loadAllTracks() {
        if (!db) db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const store = tx.objectStore(STORE);
            const req = store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }

    async function saveTrack(track) {
        if (!db) db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const store = tx.objectStore(STORE);
            const req = store.add(track);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    async function deleteTrack(id) {
        if (!db) db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const store = tx.objectStore(STORE);
            const req = store.delete(id);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
    }

    // ============ UI utils ============
    function fmtTime(sec) {
        if (!sec || !isFinite(sec)) return '0:00';
        sec = Math.floor(sec);
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function showMiniPlayer(show) {
        const mp = $('mini-music-player');
        if (!mp) return;
        if (show) mp.classList.add('active');
        else mp.classList.remove('active');
    }

    function setPlayIcons(playing) {
        const pIcon = $('music-play-icon');
        const mIcon = $('mini-music-play-icon');
        const cover = $('music-cover');
        const header = $('btn-music');
        if (pIcon) pIcon.innerHTML = playing
            ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'
            : '<path d="M8 5v14l11-7z"/>';
        if (mIcon) mIcon.innerHTML = playing
            ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>'
            : '<path d="M8 5v14l11-7z"/>';
        if (cover) cover.classList.toggle('playing', playing);
        if (header) header.classList.toggle('playing', playing);
    }

    // ============ Playlist render ============
    function renderPlaylist() {
        const el = $('music-playlist');
        if (!el) return;
        if (!tracks.length) {
            el.innerHTML = '<div class="music-empty">' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px;opacity:0.5;"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
                '<div>Пока нет треков</div>' +
                '<span>Нажми «+ Трек» чтобы загрузить</span>' +
                '</div>';
            return;
        }
        el.innerHTML = '';
        tracks.forEach((t, i) => {
            const div = document.createElement('div');
            div.className = 'music-item' + (i === currentIndex ? ' active' : '');
            div.innerHTML =
                '<div class="music-item-icon">' +
                    (i === currentIndex ? '<svg viewBox="0 0 24 24" fill="currentColor" style="width:16px;height:16px;"><path d="M8 5v14l11-7z"/></svg>' : '🎵') +
                '</div>' +
                '<div class="music-item-title">' + (t.name || 'Track') + '</div>' +
                '<div class="music-item-duration">' + fmtTime(t.duration) + '</div>' +
                '<button class="music-item-del" data-id="' + t.id + '">✕</button>';
            div.addEventListener('click', (e) => {
                if (e.target.closest('.music-item-del')) return;
                playIndex(i);
            });
            const del = div.querySelector('.music-item-del');
            del.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!confirm('Удалить трек?')) return;
                await deleteTrack(t.id);
                tracks = await loadAllTracks();
                if (i === currentIndex) { audio.pause(); currentIndex = -1; }
                else if (i < currentIndex) currentIndex--;
                renderPlaylist();
            });
            el.appendChild(div);
        });
    }

    // ============ Playback ============
    async function playIndex(idx) {
        if (idx < 0 || idx >= tracks.length) return;
        currentIndex = idx;
        const t = tracks[idx];

        if (audio._url) URL.revokeObjectURL(audio._url);
        audio._url = URL.createObjectURL(t.blob);
        audio.src = audio._url;
        audio.loop = isLooping;
        await audio.play();

        $('music-title').textContent = t.name || 'Track';
        $('music-artist').textContent = 'Мой трек · ' + fmtTime(t.duration);
        $('mini-music-title').textContent = t.name || 'Track';
        $('music-time-total').textContent = fmtTime(t.duration);
        renderPlaylist();
        setPlayIcons(true);
        showMiniPlayer(true);
    }

    function togglePlay() {
        if (!audio.src) {
            if (tracks.length) playIndex(0);
            return;
        }
        if (audio.paused) audio.play();
        else audio.pause();
    }

    function nextTrack() {
        if (!tracks.length) return;
        const n = (currentIndex + 1) % tracks.length;
        playIndex(n);
    }

    function prevTrack() {
        if (!tracks.length) return;
        const n = (currentIndex - 1 + tracks.length) % tracks.length;
        playIndex(n);
    }

    // ============ Audio events ============
    audio.addEventListener('play', () => setPlayIcons(true));
    audio.addEventListener('pause', () => setPlayIcons(false));
    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        $('music-progress-fill').style.width = pct + '%';
        $('music-time-current').textContent = fmtTime(audio.currentTime);
    });
    audio.addEventListener('ended', () => {
        if (isLooping) return;
        nextTrack();
    });

    // ============ File upload ============
    async function handleFiles(files) {
        for (const file of files) {
            if (!file.type.startsWith('audio/')) continue;
            const url = URL.createObjectURL(file);
            const dur = await new Promise((res) => {
                const a = new Audio();
                a.preload = 'metadata';
                a.onloadedmetadata = () => { URL.revokeObjectURL(url); res(a.duration); };
                a.onerror = () => { URL.revokeObjectURL(url); res(0); };
                a.src = url;
            });
            await saveTrack({
                name: file.name.replace(/\.[^.]+$/, ''),
                blob: file,
                duration: dur,
                size: file.size,
                addedAt: Date.now(),
            });
        }
        tracks = await loadAllTracks();
        renderPlaylist();
        if (tracks.length && currentIndex === -1) {
            // Автоплей первого загруженного
            setTimeout(() => playIndex(0), 300);
        }
    }

    // ============ Modal ============
    function openMusicModal() {
        $('modal-music-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeMusicModal() {
        $('modal-music-overlay').classList.remove('active');
        document.body.style.overflow = '';
        // Мини-плеер показываем, если что-то играет
        if (audio.src) showMiniPlayer(!audio.paused);
    }

    // ============ Init ============
    document.addEventListener('DOMContentLoaded', async () => {
        // Кнопки
        $('btn-music')?.addEventListener('click', openMusicModal);
        $('music-close')?.addEventListener('click', closeMusicModal);
        $('modal-music-overlay')?.addEventListener('click', (e) => {
            if (e.target === $('modal-music-overlay')) closeMusicModal();
        });

        // Контролы
        $('music-play')?.addEventListener('click', togglePlay);
        $('mini-music-play')?.addEventListener('click', togglePlay);
        $('music-next')?.addEventListener('click', nextTrack);
        $('music-prev')?.addEventListener('click', prevTrack);

        // Loop
        $('music-loop')?.addEventListener('click', () => {
            isLooping = !isLooping;
            audio.loop = isLooping;
            $('music-loop').classList.toggle('active', isLooping);
        });

        // Mute
        $('music-mute')?.addEventListener('click', () => {
            audio.muted = !audio.muted;
            $('music-mute').classList.toggle('active', audio.muted);
        });

        // Прогресс — тап/клик
        $('music-progress')?.addEventListener('click', (e) => {
            if (!audio.duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pct * audio.duration;
        });

        // Загрузка файлов
        $('music-add-btn')?.addEventListener('click', () => $('music-file-input').click());
        $('music-file-input')?.addEventListener('change', (e) => {
            if (e.target.files.length) handleFiles(e.target.files);
            e.target.value = '';
        });

        // Мини-плеер — закрыть
        $('mini-music-close')?.addEventListener('click', () => {
            audio.pause();
            audio.currentTime = 0;
            showMiniPlayer(false);
        });

        // Мини-плеер — открыть модалку
        $('mini-music-cover')?.addEventListener('click', openMusicModal);
        $('mini-music-info')?.addEventListener('click', openMusicModal);

        // Загружаем треки
        try {
            tracks = await loadAllTracks();
            renderPlaylist();
        } catch (e) {
            console.error('[MUSIC] load error:', e);
        }
    });

    window.openMusicModal = openMusicModal;
    window.closeMusicModal = closeMusicModal;
})();
