// ============================================================
// КЛИПЫ (ЛУЧШИЕ МОМЕНТЫ)
// ============================================================
(function() {
    'use strict';
    
    function getApi() {
        return window.API_URL || (typeof API_URL !== 'undefined' ? API_URL : '');
    }
    function getUid() {
        return (window.tgUser && window.tgUser.id) || (typeof tgUser !== 'undefined' && tgUser.id) || null;
    }
    function isAdmin() {
        const ADMINS = [6999358439, 1135455373, 8863307702, 1244969288, 7938171818, 6372817931, 8594288119];
        return ADMINS.includes(Number(getUid()));
    }
    
    // ==== Загрузка списка ====
    window.loadClips = async function(sort) {
        const container = document.getElementById('clips-list');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;color:#8a7a9b;padding:20px;">Загрузка...</div>';
        
        try {
            const api = getApi();
            const res = await fetch(api + '/api/clips?sort=' + (sort || 'likes'));
            const clips = await res.json();
            
            if (!clips || !clips.length) {
                container.innerHTML = '<div style="text-align:center;color:#8a7a9b;padding:20px;">Клипов пока нет. Загрузите первый!</div>';
                return;
            }
            
            const uid = getUid();
            const admin = isAdmin();
            
            container.innerHTML = clips.map(c => {
                const videoUrl = api + '/api/clip_file/' + c.id;
                const avatarUrl = c.avatar_url || '';
                const isOwner = Number(c.user_id) === Number(uid);
                const canDelete = admin || isOwner;
                
                return `
                    <div style="background:rgba(21,10,32,0.7);backdrop-filter:blur(12px);border:1px solid rgba(168,85,247,0.3);border-radius:16px;padding:12px;">
                        <video src="${videoUrl}" controls playsinline style="width:100%;border-radius:12px;max-height:400px;background:#000;"></video>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div style="width:32px;height:32px;border-radius:50%;background:${avatarUrl ? `url('${avatarUrl}')` : '#1a0f2a'};background-size:cover;border:1px solid #a855f7;"></div>
                                <div>
                                    <div style="color:#fff;font-weight:700;font-size:14px;">${c.nickname || 'Игрок'}</div>
                                    <div style="color:#8a7a9b;font-size:11px;display:flex;align-items:center;gap:4px;">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="#8a7a9b" stroke-width="2" style="width:12px;height:12px;"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
                                        ${c.title || 'Без названия'}
                                    </div>
                                </div>
                            </div>
                            <div style="display:flex;gap:8px;align-items:center;">
                                <button class="clip-like" data-id="${c.id}" data-vote="1" style="background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);border-radius:10px;color:#a855f7;font-size:13px;font-weight:700;cursor:pointer;padding:6px 12px;display:flex;align-items:center;gap:4px;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                                    ${c.likes || 0}
                                </button>
                                ${canDelete ? `<button class="clip-del" data-id="${c.id}" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:10px;color:#ef4444;padding:6px 8px;font-size:13px;cursor:pointer;display:flex;align-items:center;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Обработчики лайков
            container.querySelectorAll('.clip-like').forEach(btn => {
                btn.onclick = async () => {
                    const clipId = parseInt(btn.dataset.id);
                    const uid = getUid();
                    if (!uid) return;
                    
                    try {
                        const res = await fetch(getApi() + '/api/clips/like', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ clip_id: clipId, user_id: uid, vote: 1 })
                        }).then(r => r.json());
                        
                        if (res.ok) {
                            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg> ' + res.likes;
                        }
                    } catch (e) {}
                };
            });
            
            // Обработчики удаления
            container.querySelectorAll('.clip-del').forEach(btn => {
                btn.onclick = async () => {
                    if (!confirm('Удалить этот клип?')) return;
                    const clipId = parseInt(btn.dataset.id);
                    try {
                        const res = await fetch(getApi() + '/api/admin/clips/delete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ admin_id: getUid(), clip_id: clipId })
                        }).then(r => r.json());
                        
                        if (res.ok) {
                            window.loadClips();
                        } else {
                            alert('Ошибка: ' + (res.error || 'неизвестно'));
                        }
                    } catch (e) {
                        alert('Ошибка сети');
                    }
                };
            });
            
        } catch (e) {
            container.innerHTML = '<div style="text-align:center;color:#ef4444;padding:20px;">Ошибка: ' + e.message + '</div>';
        }
    };
    
    // ==== Загрузка клипа ====
        window.uploadClip = function() {
        // Создаем оверлей
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;';
        
        overlay.innerHTML = `
            <div style="background:rgba(21,10,32,0.95);backdrop-filter:blur(20px);border:1px solid rgba(168,85,247,0.4);border-radius:20px;padding:24px;width:100%;max-width:400px;color:#fff;box-shadow:0 0 40px rgba(168,85,247,0.3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="margin:0;font-size:18px;font-weight:800;display:flex;align-items:center;gap:8px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" style="width:24px;height:24px;"><path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/></svg>
                        Загрузить клип
                    </h3>
                    <button id="clip-modal-close" style="background:transparent;border:none;color:#8a7a9b;font-size:20px;cursor:pointer;">✕</button>
                </div>
                
                <div style="margin-bottom:16px;">
                    <label style="font-size:13px;color:#8a7a9b;display:block;margin-bottom:6px;">Название</label>
                    <input id="clip-modal-title" placeholder="Например: Клатч с AWP" style="width:100%;padding:12px;background:rgba(15,6,24,0.8);border:1px solid rgba(168,85,247,0.3);border-radius:10px;color:#fff;font-size:14px;box-sizing:border-box;">
                </div>
                
                <div style="margin-bottom:20px;">
                    <label style="font-size:13px;color:#8a7a9b;display:block;margin-bottom:6px;">Видео (mp4/webm, до 20 МБ)</label>
                    <input id="clip-modal-file" type="file" accept="video/mp4,video/webm" style="width:100%;padding:10px;background:rgba(15,6,24,0.8);border:1px solid rgba(168,85,247,0.3);border-radius:10px;color:#fff;font-size:13px;box-sizing:border-box;">
                </div>
                
                <div style="display:flex;gap:10px;">
                    <button id="clip-modal-cancel" style="flex:1;padding:12px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:10px;color:#fff;font-weight:700;cursor:pointer;">Отмена</button>
                    <button id="clip-modal-upload" style="flex:1;padding:12px;background:linear-gradient(135deg,#a855f7,#7c3aed);border:none;border-radius:10px;color:#fff;font-weight:700;cursor:pointer;box-shadow:0 4px 15px rgba(168,85,247,0.4);">Загрузить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        const close = () => overlay.remove();
        document.getElementById('clip-modal-close').onclick = close;
        document.getElementById('clip-modal-cancel').onclick = close;
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
        
        document.getElementById('clip-modal-upload').onclick = async () => {
            const title = document.getElementById('clip-modal-title').value.trim();
            const fileInput = document.getElementById('clip-modal-file');
            const file = fileInput.files[0];
            
            if (!title) { alert('Введите название'); return; }
            if (!file) { alert('Выберите видео-файл'); return; }
            if (file.size > 20 * 1024 * 1024) { alert('Файл больше 20 МБ'); return; }
            
            const btn = document.getElementById('clip-modal-upload');
            btn.disabled = true;
            btn.textContent = '⏳ Загрузка...';
            
            const formData = new FormData();
            formData.append('user_id', getUid());
            formData.append('title', title);
            formData.append('file', file);
            
            try {
                const res = await fetch(getApi() + '/api/clips/upload', {
                    method: 'POST',
                    body: formData
                }).then(r => r.json());
                
                if (res.error) {
                    alert('Ошибка: ' + res.error);
                    btn.disabled = false;
                    btn.textContent = 'Загрузить';
                } else {
                    close();
                    window.loadClips();
                }
            } catch (e) {
                alert('Ошибка сети: ' + e.message);
                btn.disabled = false;
                btn.textContent = 'Загрузить';
            }
        };
    };


    
    // ==== Инициализация ====
    window.addEventListener('load', function() {
        setTimeout(() => {
            // Кнопка "Загрузить" в экране клипов
            const uploadBtn = document.getElementById('clips-upload-btn');
            if (uploadBtn) uploadBtn.onclick = window.uploadClip;
            
            // Перехват кнопки "Клипы" в меню "Ещё"
            const clipsBtn = document.querySelector('[data-action="clips"]');
            if (clipsBtn) {
                clipsBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    const tab = document.getElementById('tab-clips');
                    if (tab) tab.classList.add('active');
                    window.loadClips();
                });
            }
            
            // Загрузка клипов при первом открытии
            if (document.getElementById('tab-clips') && document.getElementById('tab-clips').classList.contains('active')) {
                window.loadClips();
            }
        }, 1000);
    });
})();
