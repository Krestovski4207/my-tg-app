// ================== ВОЙС (LiveKit) ==================
(function() {
    'use strict';

    let currentRoom = null;
    let currentRoomName = null;
    let localAudioTrack = null;
    let micEnabled = true;

    // SVG-иконки
    const ICONS = {
        megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M3 11l18-8v18L3 13v-2z"/><path d="M11.6 16.8l-1.2 4.2a2 2 0 0 0 3.8 1l1.2-4.2"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:24px;height:24px;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
        micOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
        exit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
        speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    };

    // Список комнат (с лимитами)
    const ROOMS = [
        { slug: 'general', name: 'Общий войс', icon: ICONS.megaphone, limit: 999 },
        { slug: '1x1', name: '1x1', icon: ICONS.users, limit: 2 },
        { slug: '2x2', name: '2x2', icon: ICONS.users, limit: 4 },
        { slug: '3x3', name: '3x3', icon: ICONS.users, limit: 6 },
        { slug: '4x4', name: '4x4', icon: ICONS.users, limit: 8 },
        { slug: '5x5', name: '5x5', icon: ICONS.users, limit: 10 },
    ];

    function getApiUrl() {
        return window.API_URL || '';
    }

    function getUserId() {
        return window.tgUser?.id || parseInt(localStorage.getItem('apk_user_id')) || null;
    }

    async function loadVoiceRooms() {
        const container = document.getElementById('voice-rooms-list');
        if (!container) return;

        container.innerHTML = `
            <div class="voice-rooms">
                ${ROOMS.map(room => `
                    <div class="voice-room-card" data-room="${room.slug}">
                        <div class="voice-room-icon">${room.icon}</div>
                        <div class="voice-room-info">
                            <div class="voice-room-name">${room.name}</div>
                            <div class="voice-room-limit">до ${room.limit === 999 ? '∞' : room.limit} чел.</div>
                        </div>
                        <button class="voice-room-join" data-room="${room.slug}">Войти</button>
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.voice-room-join').forEach(btn => {
            btn.addEventListener('click', () => joinRoom(btn.dataset.room));
        });
    }

    async function joinRoom(roomSlug) {
        const userId = getUserId();
        if (!userId) {
            showToast('Открой в Telegram');
            return;
        }

        try {
            showToast('⏳ Подключение...');
            const res = await fetch(getApiUrl() + `/api/voice/token?user_id=${userId}&room=${roomSlug}`);
            const data = await res.json();

            if (data.error) {
                showToast('❌ ' + data.error);
                return;
            }

            // Динамически подгружаем LiveKit Client (если ещё не загружен)
            if (typeof LivekitClient === 'undefined') {
                await loadScript('https://cdn.jsdelivr.net/npm/livekit-client@2/dist/livekit-client.umd.min.js');
            }

            const { Room, RoomEvent } = LivekitClient;

            const room = new Room({
                adaptiveStream: true,
                dynacast: true,
            });

            room.on(RoomEvent.ParticipantConnected, (participant) => {
                console.log('Участник подключился:', participant.identity);
                renderParticipants();
            });

            room.on(RoomEvent.ParticipantDisconnected, (participant) => {
                console.log('Участник отключился:', participant.identity);
                renderParticipants();
            });

            room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
                if (track.kind === 'audio') {
                    const audioEl = track.attach();
                    audioEl.id = 'audio-' + participant.identity;
                    document.body.appendChild(audioEl);
                }
            });

            await room.connect(data.url, data.token);
            await room.localParticipant.setMicrophoneEnabled(true);

            currentRoom = room;
            currentRoomName = roomSlug;

            renderRoomView();
            showToast('✅ Подключено');
        } catch (e) {
            console.error('Join room error:', e);
            showToast('❌ Ошибка: ' + e.message);
        }
    }

    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    function renderRoomView() {
        const container = document.getElementById('voice-rooms-list');
        if (!container || !currentRoom) return;

        const roomName = ROOMS.find(r => r.slug === currentRoomName)?.name || currentRoomName;

        container.innerHTML = `
            <div class="voice-room-active">
                <div class="voice-room-header">
                    <div class="voice-room-title">🎙️ ${roomName}</div>
                    <button class="voice-leave-btn" id="voice-leave">${ICONS.exit} Выйти</button>
                </div>
                <div class="voice-participants" id="voice-participants"></div>
                <div class="voice-controls">
                    <button class="voice-control-btn" id="voice-mic-btn">${ICONS.mic} Микрофон</button>
                </div>
            </div>
        `;

        document.getElementById('voice-leave').addEventListener('click', leaveRoom);
        document.getElementById('voice-mic-btn').addEventListener('click', toggleMic);

        renderParticipants();
    }

    function renderParticipants() {
        if (!currentRoom) return;
        const container = document.getElementById('voice-participants');
        if (!container) return;

        const participants = [currentRoom.localParticipant, ...Array.from(currentRoom.remoteParticipants.values())];
        container.innerHTML = participants.map(p => `
            <div class="voice-participant">
                <div class="voice-participant-name">${p.name || p.identity}</div>
                <div class="voice-participant-status">${p.isMicrophoneEnabled ? '🎤' : '🔇'}</div>
            </div>
        `).join('');
    }

    async function leaveRoom() {
        if (currentRoom) {
            await currentRoom.disconnect();
            currentRoom = null;
            currentRoomName = null;
        }
        document.querySelectorAll('audio[id^="audio-"]').forEach(a => a.remove());
        loadVoiceRooms();
    }

    async function toggleMic() {
        if (!currentRoom) return;
        micEnabled = !micEnabled;
        await currentRoom.localParticipant.setMicrophoneEnabled(micEnabled);
        const btn = document.getElementById('voice-mic-btn');
        if (btn) {
            btn.innerHTML = micEnabled ? ICONS.mic + ' Микрофон' : ICONS.micOff + ' Микрофон';
            btn.classList.toggle('muted', !micEnabled);
        }
    }

    // Экспорт
    window.loadVoiceRooms = loadVoiceRooms;
    window.voiceJoinRoom = joinRoom;

    // Загружаем комнаты при открытии вкладки
    document.addEventListener('DOMContentLoaded', () => {
        // Ничего, загрузим при switchTab('voice') из more-tab.js
    });
})();
