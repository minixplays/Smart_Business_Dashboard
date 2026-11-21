// Global Notification Center & Settings System for Smart Business Dashboard
(function () {
    'use strict';

    // Synchronize session loaded state across all pages to ensure splash animation only runs on first app launch
    if (!window.location.pathname.endsWith('index.html') && !window.location.href.endsWith('/') && !window.location.href.endsWith('index.html')) {
        try {
            sessionStorage.setItem('app_session_loaded', 'true');
            if (!window.name || window.name.indexOf('app_session_loaded') === -1) {
                window.name = (window.name ? window.name + '_' : '') + 'app_session_loaded';
            }
        } catch (e) {}
        if (window.desktopAPI && typeof window.desktopAPI.markLoaded === 'function') {
            window.desktopAPI.markLoaded();
        }
    }

    // 1. Notification Settings Management
    const SETTINGS_STORAGE_KEY = 'smart_dash_notif_settings';
    const DEFAULT_SETTINGS = {
        masterEnabled: true,
        hourlyWalkin: true,
        tailoringMeeting: true,
        storeRoutine: true,
        pendingReports: true,
        desktopPush: true,
        toastPopups: true,
        audioChime: true
    };

    function getNotifSettings() {
        try {
            const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
        } catch (e) {
            return { ...DEFAULT_SETTINGS };
        }
    }

    function saveNotifSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {}
    }

    window.notifSettings = getNotifSettings();

    window.updateNotifSetting = function (key, value) {
        window.notifSettings[key] = value;
        saveNotifSettings(window.notifSettings);
        window.syncNotifSettingsUI();
    };

    window.resetNotifSettings = function () {
        window.notifSettings = { ...DEFAULT_SETTINGS };
        saveNotifSettings(window.notifSettings);
        window.syncNotifSettingsUI();
        if (typeof showToast === 'function') {
            showToast('Notification settings reset to defaults', 'info');
        }
    };

    window.syncNotifSettingsUI = function () {
        const s = window.notifSettings;
        const keys = Object.keys(DEFAULT_SETTINGS);
        keys.forEach(k => {
            const input = document.getElementById('toggle_' + k);
            if (input) {
                input.checked = !!s[k];
            }
        });
    };

    // 2. Audio Chime (Synthesized Web Audio API)
    function playRawChime() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            // Note 1: D5 (587.33 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
            gain1.gain.setValueAtTime(0.12, ctx.currentTime);
            gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(ctx.currentTime);
            osc1.stop(ctx.currentTime + 0.3);

            // Note 2: A5 (880 Hz)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
            gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
            gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.1);
            osc2.stop(ctx.currentTime + 0.45);
        } catch (e) {}
    }

    function playNotificationChime() {
        if (!window.notifSettings.audioChime || !window.notifSettings.masterEnabled) return;
        playRawChime();
    }

    window.playNotificationChime = playNotificationChime;
    window.playNotificationChimeExplicit = playRawChime;

    // 3. Tab Switching in Notification Center
    window.switchNotifTab = function (tab) {
        const inboxView = document.getElementById('notifViewInbox');
        const settingsView = document.getElementById('notifViewSettings');
        const tabInbox = document.getElementById('notifTabInbox');
        const tabSettings = document.getElementById('notifTabSettings');

        if (tab === 'settings') {
            if (inboxView) inboxView.classList.add('hidden');
            if (settingsView) settingsView.classList.remove('hidden');

            if (tabInbox) {
                tabInbox.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800';
            }
            if (tabSettings) {
                tabSettings.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-[#242424] dark:bg-neutral-700 text-white shadow-xs';
            }
            window.syncNotifSettingsUI();
        } else {
            if (inboxView) inboxView.classList.remove('hidden');
            if (settingsView) settingsView.classList.add('hidden');

            if (tabInbox) {
                tabInbox.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 bg-[#242424] dark:bg-neutral-700 text-white shadow-xs';
            }
            if (tabSettings) {
                tabSettings.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800';
            }
        }
    };

    // 4. Notifications State
    try {
        window.notifications = JSON.parse(localStorage.getItem('smart_dash_notifications') || '[]');
    } catch (e) {
        window.notifications = [];
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.updateNotificationUI = function () {
        const dots = document.querySelectorAll('#notification-dot, #sidebar-notification-dot, [data-notif-dot]');
        const count = Array.isArray(window.notifications) ? window.notifications.length : 0;

        dots.forEach(dot => {
            if (count > 0 && window.notifSettings.masterEnabled) dot.classList.remove('hidden');
            else dot.classList.add('hidden');
        });

        const badge = document.getElementById('notifBadgeCount');
        if (badge) badge.textContent = count;

        const list = document.getElementById('notificationList');
        if (!list) return;

        if (count === 0) {
            list.innerHTML = `
                \x3Cdiv class="flex flex-col items-center justify-center py-16 text-center">
                    \x3Cdiv class="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mb-3">
                        \x3Csvg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            \x3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                        \x3C/svg>
                    \x3C/div>
                    \x3Ch4 class="text-xs font-bold text-neutral-600 dark:text-neutral-300">All caught up!\x3C/h4>
                    \x3Cp class="text-[11px] text-neutral-400 mt-0.5">No active notifications or alerts.\x3C/p>
                \x3C/div>
            `;
            return;
        }

        list.innerHTML = window.notifications.map((n, idx) => `
            \x3Cdiv class="notification-item flex justify-between items-start p-3.5 rounded-2xl bg-neutral-50/80 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/60 hover:bg-neutral-100/80 dark:hover:bg-neutral-800 transition-colors group">
                \x3Cdiv class="flex items-start gap-2.5 flex-1 min-w-0 pr-2">
                    \x3Cdiv class="w-2 h-2 rounded-full bg-[#f4c74a] mt-1.5 flex-shrink-0">\x3C/div>
                    \x3Cdiv class="flex-1 min-w-0">
                        \x3Cdiv class="notification-msg text-xs font-bold text-[#1a1a1a] dark:text-neutral-100 leading-snug break-words">${escapeHtml(n.msg || '')}\x3C/div>
                        \x3Cdiv class="notification-time text-[10px] font-semibold text-neutral-400 mt-1">${escapeHtml(n.time || '')}\x3C/div>
                    \x3C/div>
                \x3C/div>
                \x3Cbutton onclick="dismissNotification(${idx}, event)" class="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-1 rounded-lg transition" title="Dismiss">
                    \x3Csvg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>\x3C/svg>
                \x3C/button>
            \x3C/div>
        `).join('');
    };

    window.dismissNotification = function (index, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (Array.isArray(window.notifications) && window.notifications[index]) {
            window.notifications.splice(index, 1);
            window.saveNotifications();
        }
    };

    window.saveNotifications = function () {
        try {
            localStorage.setItem('smart_dash_notifications', JSON.stringify(window.notifications));
        } catch (e) {}
        window.updateNotificationUI();
        try {
            window.dispatchEvent(new CustomEvent('smart_dash_notification_added'));
        } catch (e) {}
    };

    window.triggerNotification = function (msg, category = 'general') {
        if (!msg) return;
        const s = window.notifSettings;
        if (!s.masterEnabled) return;

        // Check specific channel filters
        if (category === 'walkin' && !s.hourlyWalkin) return;
        if (category === 'tailoring' && !s.tailoringMeeting) return;
        if (category === 'routine' && !s.storeRoutine) return;
        if (category === 'report' && !s.pendingReports) return;

        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        if (!Array.isArray(window.notifications)) window.notifications = [];
        window.notifications.unshift({ msg, time: timeStr, id: Date.now(), category });
        window.saveNotifications();

        // Audio chime
        playNotificationChime();

        // In-app popup toast
        if (s.toastPopups) {
            const popup = document.getElementById('pushNotificationPopup');
            const popupText = document.getElementById('pushNotificationText');
            if (popup && popupText) {
                popupText.textContent = msg;
                popup.classList.remove('hidden', 'opacity-0', 'translate-x-4', 'pointer-events-none');
                setTimeout(() => {
                    popup.classList.add('opacity-0', 'translate-x-4', 'pointer-events-none');
                }, 5000);
            }
        }

        // Native OS notification
        if (s.desktopPush && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
                new Notification('Smart Business Dashboard', {
                    body: msg,
                    icon: 'assets/icon.png'
                });
            } catch (e) {}
        }
    };

    window.sendTestNotification = function () {
        window.triggerNotification('🔔 Test Notification: All system alerts and notifications are working properly!');
        if (typeof showToast === 'function') {
            showToast('Test notification triggered', 'success');
        }
    };

    window.navigateToNotificationPage = function (e) {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (window.location.pathname.endsWith('notifications.html') || window.location.href.includes('notifications.html')) {
            return;
        }
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('notifications');
            return;
        }
        if (document.body) {
            document.body.classList.add('page-exit');
        }
        setTimeout(() => {
            window.location.href = 'notifications.html';
        }, 200);
    };

    window.toggleNotificationPanel = window.navigateToNotificationPage;
    window.closeNotificationPanel = function () {};

    window.clearNotifications = function (e) {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        window.notifications = [];
        window.saveNotifications();
    };

    // 5. Inject UI Elements into Document Body
    function initNotificationsUI() {
        if (window._notifUIInitialized) return;
        window._notifUIInitialized = true;

        const mainBell = document.getElementById('notificationBtn');
        if (mainBell) {
            mainBell.onclick = window.navigateToNotificationPage;
        }

        const sidebarBell = document.getElementById('sidebarNotificationBtn');
        if (sidebarBell && !window.location.pathname.endsWith('notifications.html') && !window.location.href.includes('notifications.html')) {
            sidebarBell.onclick = window.navigateToNotificationPage;
        }

        // Push Popup Toast (floating banner)
        if (!document.getElementById('pushNotificationPopup')) {
            const popupDiv = document.createElement('div');
            popupDiv.id = 'pushNotificationPopup';
            popupDiv.className = 'fixed top-4 right-4 max-w-xs bg-[#242424] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl z-[999999] opacity-0 transform translate-x-4 transition-all duration-300 pointer-events-none flex items-center justify-center text-center';
            popupDiv.innerHTML = `\x3Cspan id="pushNotificationText">\x3C/span>`;
            document.body.appendChild(popupDiv);
        }

        window.updateNotificationUI();
        window.syncNotifSettingsUI();
    }

    // Run initialization safely
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNotificationsUI);
    } else {
        initNotificationsUI();
    }
    window.addEventListener('load', initNotificationsUI);

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            window.closeNotificationPanel();
        }
    });

    // Cross-tab sync
    window.addEventListener('storage', function (e) {
        if (e.key === 'smart_dash_notifications') {
            try {
                window.notifications = JSON.parse(e.newValue || '[]');
            } catch (err) {
                window.notifications = [];
            }
            window.updateNotificationUI();
        } else if (e.key === SETTINGS_STORAGE_KEY) {
            window.notifSettings = getNotifSettings();
            window.syncNotifSettingsUI();
        }
    });

    // Scheduled Reminders Routine
    window.checkScheduledReminders = function () {
        const s = window.notifSettings;
        if (!s.masterEnabled) return;

        const now = new Date();
        const nowTime = now.getTime();
        const oneHourMs = 60 * 60 * 1000;

        function hasRecentNotification(msg, withinMs = 5 * 60 * 1000) {
            const currentNotifs = JSON.parse(localStorage.getItem('smart_dash_notifications') || '[]');
            const curTime = Date.now();
            return currentNotifs.some(n => n.msg === msg && (curTime - (n.id || 0)) < withinMs);
        }

        // Hourly Walk-in check
        if (s.hourlyWalkin) {
            const lastWalkinStr = localStorage.getItem('notif_last_walkin_time');
            const lastWalkinTime = lastWalkinStr ? parseInt(lastWalkinStr, 10) : 0;

            if (!lastWalkinTime || (nowTime - lastWalkinTime >= oneHourMs)) {
                if (!hasRecentNotification('Add Walk-in Data')) {
                    window.triggerNotification('Add Walk-in Data', 'walkin');
                }
                localStorage.setItem('notif_last_walkin_time', nowTime.toString());
            }
        }

        // Tuesday 11:00 AM Tailoring Meeting check
        if (s.tailoringMeeting) {
            const dayOfWeek = now.getDay();
            const currentHour = now.getHours();
            const todayDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            if (dayOfWeek === 2 && currentHour >= 11) {
                const lastMeetingDate = localStorage.getItem('notif_last_tuesday_meeting_date');
                if (lastMeetingDate !== todayDateKey) {
                    if (!hasRecentNotification('Tailoring Supervisor meeting')) {
                        window.triggerNotification('Tailoring Supervisor meeting', 'tailoring');
                    }
                    localStorage.setItem('notif_last_tuesday_meeting_date', todayDateKey);
                }
            }
        }
    };

    setTimeout(window.checkScheduledReminders, 2000);
    setInterval(window.checkScheduledReminders, 30000);
})();
