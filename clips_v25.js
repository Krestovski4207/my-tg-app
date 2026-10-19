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
                            btn.textContent = '👍 ' + res.likes;
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
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/mp4,video/webm';
        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            
            const title = prompt('Название клипа (например: Клатч с AWP):');
            if (!title) return;
            
            if (file.size > 20 * 1024 * 1024) {
                alert('Файл больше 20 МБ');
                return;
            }
            
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
                } else {
                    alert('✓ Клип загружен!');
                    window.loadClips();
                }
            } catch (e) {
                alert('Ошибка сети: ' + e.message);
            }
        };
        input.click();
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
