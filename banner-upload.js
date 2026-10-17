(function() {
    'use strict';
    const BANNER_COST = 500;
    const MAX_SIZE = 10 * 1024 * 1024;
    const MAX_DURATION = 10;
    const ALLOWED_EXT = ['webm', 'gif'];
    const API_KEY = 'lumafaceit_secret_e8jd90jd19dd7dk';

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
        let t = document.getElementById('banner-toast');
        if (!t) {
            t = document.createElement('div');
            t.id = 'banner-toast';
            t.style.cssText = 'position:fixed;top:24px;left:50%;transform:translate(-50%,-20px);background:rgba(30,27,46,0.95);border:1px solid rgba(168,85,247,0.4);color:#fff;font-size:14px;font-weight:600;padding:12px 20px;border-radius:12px;z-index:100000;opacity:0;transition:all 0.25s ease;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,0.5);max-width:90vw;';
            document.body.appendChild(t);
        }
        t.textContent = text;
        requestAnimationFrame(() => t.style.opacity = '1');
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2600);
    }

    window.openBannerUploadModal = function() {
        const userId = getUserId();
        if (!userId) return;
        let modal = document.getElementById('banner-upload-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'banner-upload-modal';
            modal.className = 'banner-upload-modal-overlay';
            modal.innerHTML = `
                <div class="banner-upload-modal">
                    <div class="banner-upload-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Анимированный баннер
                    </div>
                    <div class="banner-upload-sub">
                        Загрузи короткое видео <b>(webm/gif, до 10 МБ, до 10 сек)</b>.
                        Стоимость: <span class="banner-upload-price">${BANNER_COST} LM</span>
                    </div>
                    <div class="banner-upload-drop" id="banner-drop">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <div class="banner-upload-drop-text">Нажми или перетащи файл</div>
                        <div class="banner-upload-drop-hint">webm, gif · до 10 МБ · до 10 сек</div>
                    </div>
                    <input type="file" id="banner-file-input" accept=".webm,.gif" style="display:none;">
                    <video class="banner-upload-preview" id="banner-preview-video" muted loop playsinline></video>
                    <img class="banner-upload-preview" id="banner-preview-img" alt="">
                    <div class="banner-upload-actions">
                        <button class="banner-upload-btn primary" id="banner-upload-submit" disabled>Загрузить (${BANNER_COST} LM)</button>
                        <button class="banner-upload-btn secondary" id="banner-upload-cancel">Отмена</button>
                    </div>
                    <button class="banner-upload-btn danger" id="banner-upload-delete" style="width:100%;margin-top:8px;display:none;">Удалить текущий баннер</button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        modal.classList.add('active');

        const dropZone = modal.querySelector('#banner-drop');
        const fileInput = modal.querySelector('#banner-file-input');
        const previewVideo = modal.querySelector('#banner-preview-video');
        const previewImg = modal.querySelector('#banner-preview-img');
        const submitBtn = modal.querySelector('#banner-upload-submit');
        const cancelBtn = modal.querySelector('#banner-upload-cancel');
        const deleteBtn = modal.querySelector('#banner-upload-delete');
        let selectedFile = null;

        dropZone.addEventListener('click', () => fileInput.click());
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        });
        fileInput.addEventListener('change', () => { if (fileInput.files.length) handleFile(fileInput.files[0]); });

        async function handleFile(file) {
            console.log('[BANNER] File received:', {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified
            });
            
            let ext = (file.name.split('.').pop() || '').toLowerCase();
            
            // Fallback: если name нет расширения или неправильный — используем MIME
            if (!ALLOWED_EXT.includes(ext)) {
                const mime = (file.type || '').toLowerCase();
                if (mime.includes('webm')) ext = 'webm';
                else if (mime.includes('gif')) ext = 'gif';
                else if (mime.includes('mp4')) ext = 'mp4';
                else {
                    toast('Формат: webm, gif (получен: ' + (file.type || ext || 'unknown') + ')');
                    return;
                }
            }
            if (file.size > MAX_SIZE) { toast('Файл больше 10 МБ'); return; }
            if (ext === 'webm') {
                const url = URL.createObjectURL(file);
                const v = document.createElement('video');
                v.src = url; v.muted = true;
                await new Promise(r => { v.onloadedmetadata = r; v.onerror = r; setTimeout(r, 2000); });
                if (v.duration > MAX_DURATION + 0.5) {
                    toast(`Видео длиннее ${MAX_DURATION} сек`);
                    URL.revokeObjectURL(url);
                    return;
                }
                URL.revokeObjectURL(url);
            }
            selectedFile = file;
            previewVideo.classList.remove('active');
            previewImg.classList.remove('active');
            const url = URL.createObjectURL(file);
            if (ext === 'gif') { previewImg.src = url; previewImg.classList.add('active'); }
            else { previewVideo.src = url; previewVideo.classList.add('active'); previewVideo.play().catch(()=>{}); }
            submitBtn.disabled = false;
            dropZone.style.display = 'none';
        }

        submitBtn.addEventListener('click', async () => {
            if (!selectedFile) return;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Загрузка...';
            try {
                const api = getApiUrl();
                const fd = new FormData();
                fd.append('user_id', userId);
                fd.append('file', selectedFile);
                const res = await fetch(api + '/api/user/banner/upload', {
                    method: 'POST',
                    headers: { 'X-API-Key': API_KEY },
                    body: fd
                }).then(r => r.json());
                if (res.error) {
                    toast('Ошибка: ' + res.error);
                    submitBtn.disabled = false;
                    submitBtn.textContent = `Загрузить (${BANNER_COST} LM)`;
                    return;
                }
                await fetch(api + '/api/user/deduct_coins', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                    body: JSON.stringify({ user_id: userId, amount: BANNER_COST, reason: 'banner_upload' })
                }).then(r => r.json()).catch(() => ({}));
                toast('✓ Баннер загружен');
                modal.classList.remove('active');
                if (typeof loadProfile === 'function') loadProfile();
            } catch (e) {
                toast('Ошибка: ' + e.message);
                submitBtn.disabled = false;
                submitBtn.textContent = `Загрузить (${BANNER_COST} LM)`;
            }
        });

        cancelBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            selectedFile = null;
            previewVideo.src = ''; previewImg.src = '';
            previewVideo.classList.remove('active');
            previewImg.classList.remove('active');
            submitBtn.disabled = true;
            submitBtn.textContent = `Загрузить (${BANNER_COST} LM)`;
            dropZone.style.display = '';
        });

        modal.addEventListener('click', e => { if (e.target === modal) cancelBtn.click(); });

        fetch(getApiUrl() + '/api/user/' + userId).then(r => r.json()).then(data => {
            if (data.banner_custom_url) {
                deleteBtn.style.display = 'block';
                deleteBtn.onclick = async () => {
                    if (!confirm('Удалить баннер?')) return;
                    await fetch(getApiUrl() + '/api/user/banner/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
                        body: JSON.stringify({ user_id: userId })
                    });
                    toast('✓ Удалён');
                    modal.classList.remove('active');
                    if (typeof loadProfile === 'function') loadProfile();
                };
            }
        });
    };
})();
