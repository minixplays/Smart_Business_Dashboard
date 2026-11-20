// Global Notifications Logic for Smart Business Dashboard
(function () {
    'use strict';

    // 1. Inject Styles
    const style = document.createElement('style');
    style.innerHTML = `
        /* Notification Panel Styling */
        #notificationPanel {
            z-index: 999999 !important;
            transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Dark mode overrides */
        html.dark-mode #notificationPanel,
        body.dark-mode #notificationPanel {
            background: #18181b !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08) !important;
        }
        html.dark-mode #notificationPanel > div:first-child,
        body.dark-mode #notificationPanel > div:first-child {
            background: rgba(24, 24, 27, 0.95) !important;
            border-bottom-color: rgba(255, 255, 255, 0.08) !important;
        }
        html.dark-mode #notificationPanel h4,
        body.dark-mode #notificationPanel h4 {
            color: #f4f4f5 !important;
        }
        html.dark-mode #notificationList,
        body.dark-mode #notificationList {
            background: #18181b !important;
        }
        html.dark-mode .notification-item,
        body.dark-mode .notification-item {
            background: #27272a !important;
            border-color: rgba(255, 255, 255, 0.06) !important;
        }
        html.dark-mode .notification-item:hover,
        body.dark-mode .notification-item:hover {
            background: #3f3f46 !important;
        }
        html.dark-mode .notification-msg,
        body.dark-mode .notification-msg {
            color: #f4f4f5 !important;
        }
        html.dark-mode .notification-time,
        body.dark-mode .notification-time {
            color: #a1a1aa !important;
        }

        /* Floating Bell */
        #floatingNotificationWrapper {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            z-index: 99999;
        }
    `;
    document.head.appendChild(style);

    // 2. Initialize State
    try {
        window.notifications = JSON.parse(localStorage.getItem('smart_dash_notifications') || '[]');
    } catch (e) {
        window.notifications = [];
    }

    // 3. Logic Functions (DEFINED FIRST so always available)
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
            if (count > 0) dot.classList.remove('hidden');
            else dot.classList.add('hidden');
        });

        const list = document.getElementById('notificationList');
        if (!list) return;

        if (count === 0) {
            list.innerHTML = '\x3Cdiv class="text-center text-neutral-400 text-xs py-8 font-medium">No new notifications\x3C/div>';
            return;
        }

        list.innerHTML = window.notifications.map(n => `
            \x3Cdiv class="notification-item flex justify-between items-start p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100 hover:bg-neutral-100 transition-colors">
                \x3Cspan class="notification-msg text-xs font-bold text-[#242424] leading-tight flex-1 pr-2">${escapeHtml(n.msg || '')}\x3C/span>
                \x3Cspan class="notification-time text-[10px] font-bold text-neutral-400 whitespace-nowrap mt-0.5">${escapeHtml(n.time || '')}\x3C/span>
            \x3C/div>
        `).join('');
    };

    window.saveNotifications = function () {
        try {
            localStorage.setItem('smart_dash_notifications', JSON.stringify(window.notifications));
        } catch (e) {}
        window.updateNotificationUI();
    };

    window.triggerNotification = function (msg) {
        if (!msg) return;
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        if (!Array.isArray(window.notifications)) window.notifications = [];
        window.notifications.unshift({ msg, time: timeStr, id: Date.now() });
        window.saveNotifications();

        // Popup toast
        const popup = document.getElementById('pushNotificationPopup');
        const popupText = document.getElementById('pushNotificationText');
        if (popup && popupText) {
            popupText.textContent = msg;
            popup.classList.remove('hidden', 'opacity-0', 'translate-x-4', 'pointer-events-none');
            setTimeout(() => {
                popup.classList.add('opacity-0', 'translate-x-4', 'pointer-events-none');
            }, 5000);
        }

        // Native OS notification
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            try {
                new Notification('Smart Business Dashboard', {
                    body: msg,
                    icon: 'assets/icon.png'
                });
            } catch (e) {}
        }
    };

    window.positionNotificationPanel = function (triggerEl) {
        const panel = document.getElementById('notificationPanel');
        if (!panel) return;
        const target = triggerEl || document.getElementById('notificationBtn') || document.getElementById('sidebarNotificationBtn');
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const panelWidth = Math.min(320, window.innerWidth - 32);
        const isNearBottom = rect.top > window.innerHeight * 0.7;

        panel.style.width = panelWidth + 'px';

        if (isNearBottom) {
            // Drop UP
            const bottom = Math.max(12, window.innerHeight - rect.top + 8);
            const right = Math.max(12, window.innerWidth - rect.right);
            panel.style.top = 'auto';
            panel.style.bottom = bottom + 'px';
            panel.style.right = right + 'px';
            panel.style.left = 'auto';
            panel.style.transformOrigin = 'bottom right';
        } else {
            // Drop DOWN
            const top = rect.bottom + 8;
            const right = Math.max(12, window.innerWidth - rect.right);
            panel.style.top = top + 'px';
            panel.style.bottom = 'auto';
            panel.style.right = right + 'px';
            panel.style.left = 'auto';
            panel.style.transformOrigin = 'top right';
        }
    };

    window.toggleNotificationPanel = function (e) {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        let panel = document.getElementById('notificationPanel');
        if (!panel) {
            initNotificationsUI();
            panel = document.getElementById('notificationPanel');
        }
        if (!panel) return;

        const isHidden = panel.classList.contains('hidden') ||
                         panel.style.display === 'none' ||
                         panel.classList.contains('opacity-0');

        if (isHidden) {
            const trigger = (e && e.currentTarget) || (e && e.target ? e.target.closest('button') : null);
            window.positionNotificationPanel(trigger);
            panel.classList.remove('hidden');
            panel.style.display = 'flex';
            void panel.offsetWidth; // Reflow
            panel.classList.remove('opacity-0', 'scale-95', 'pointer-events-none');
            panel.classList.add('opacity-100', 'scale-100');
            panel.style.opacity = '1';
            panel.style.pointerEvents = 'auto';
            window.updateNotificationUI();
        } else {
            window.closeNotificationPanel();
        }
    };

    window.closeNotificationPanel = function () {
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            panel.classList.remove('opacity-100', 'scale-100');
            panel.classList.add('opacity-0', 'scale-95', 'pointer-events-none');
            panel.style.opacity = '0';
            panel.style.pointerEvents = 'none';
            setTimeout(() => {
                if (panel.classList.contains('opacity-0')) {
                    panel.classList.add('hidden');
                    panel.style.display = 'none';
                }
            }, 200);
        }
    };

    window.clearNotifications = function (e) {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        window.notifications = [];
        window.saveNotifications();
        window.updateNotificationUI();
    };

    // 4. Inject UI
    function initNotificationsUI() {
        if (window._notifUIInitialized && document.getElementById('notificationPanel')) return;
        window._notifUIInitialized = true;

        let bellBtn = document.getElementById('notificationBtn');

        if (!bellBtn) {
            // Check for anonymous bell icons (e.g. in other tools)
            const svgs = document.querySelectorAll('svg');
            for (let svg of svgs) {
                if (svg.innerHTML.includes('M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11')) {
                    bellBtn = svg.closest('button');
                    if (bellBtn) {
                        bellBtn.id = 'notificationBtn';
                        break;
                    }
                }
            }
        }

        if (bellBtn) {
            bellBtn.onclick = window.toggleNotificationPanel;
            if (!bellBtn.querySelector('#notification-dot')) {
                bellBtn.classList.add('relative');
                const dot = document.createElement('span');
                dot.id = 'notification-dot';
                dot.className = 'hidden absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white';
                bellBtn.appendChild(dot);
            }
        } else {
            // Inject floating bell button
            if (!document.getElementById('floatingNotificationWrapper')) {
                const floatWrap = document.createElement('div');
                floatWrap.id = 'floatingNotificationWrapper';
                floatWrap.innerHTML = `
                    \x3Cbutton id="notificationBtn" onclick="toggleNotificationPanel(event)" class="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#242424] hover:bg-neutral-50 shadow-lg transition relative" title="Notifications">
                        \x3Cspan id="notification-dot" class="hidden absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border border-white">\x3C/span>
                        \x3Csvg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">\x3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">\x3C/path>\x3C/svg>
                    \x3C/button>
                `;
                document.body.appendChild(floatWrap);
            }
        }

        // Inject fixed notification dropdown directly onto body (never clipped by header or parent containers)
        if (!document.getElementById('notificationPanel')) {
            const panelDiv = document.createElement('div');
            panelDiv.id = 'notificationPanel';
            panelDiv.className = 'hidden fixed w-80 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden opacity-0 transform scale-95 transition-all duration-200 flex flex-col pointer-events-none';
            panelDiv.style.cssText = 'position:fixed;z-index:999999;';
            panelDiv.innerHTML = `
                \x3Cdiv class="flex items-center justify-between px-5 py-4 border-b border-neutral-100/60 bg-neutral-50/50">
                    \x3Ch4 class="text-xs font-extrabold text-[#242424]">Notifications\x3C/h4>
                    \x3Cbutton onclick="clearNotifications(event)" class="text-neutral-400 hover:text-red-500 transition-colors p-1" title="Clear All">
                        \x3Csvg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">\x3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">\x3C/path>\x3C/svg>
                    \x3C/button>
                \x3C/div>
                \x3Cdiv id="notificationList" class="max-h-80 overflow-y-auto hide-scrollbar flex flex-col p-2.5 gap-2 bg-white">\x3C/div>
            `;
            document.body.appendChild(panelDiv);
        }

        // Inject push toast popup
        if (!document.getElementById('pushNotificationPopup')) {
            const popupDiv = document.createElement('div');
            popupDiv.id = 'pushNotificationPopup';
            popupDiv.className = 'fixed top-4 right-4 max-w-xs bg-[#242424] text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl z-[999999] opacity-0 transform translate-x-4 transition-all duration-300 pointer-events-none flex items-center justify-center text-center';
            popupDiv.innerHTML = `\x3Cspan id="pushNotificationText">\x3C/span>`;
            document.body.appendChild(popupDiv);
        }

        // Secondary bells (e.g., sidebar)
        const sidebarBell = document.getElementById('sidebarNotificationBtn');
        if (sidebarBell) {
            sidebarBell.onclick = window.toggleNotificationPanel;
        }

        window.updateNotificationUI();
    }

    // Run initialization safely
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNotificationsUI);
    } else {
        initNotificationsUI();
    }
    window.addEventListener('load', initNotificationsUI);

    // Close on click outside
    document.addEventListener('click', function (e) {
        const panel = document.getElementById('notificationPanel');
        if (!panel || panel.classList.contains('hidden') || panel.style.display === 'none') return;
        if (panel.contains(e.target)) return;

        const isBell = e.target.closest('#notificationBtn, #sidebarNotificationBtn, [data-notif-btn], #floatingNotificationWrapper');
        if (isBell) return;

        window.closeNotificationPanel();
    });

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
        }
    });

    // Scheduled Reminders
    window.checkScheduledReminders = function () {
        const now = new Date();
        const nowTime = now.getTime();
        const oneHourMs = 60 * 60 * 1000;

        function hasRecentNotification(msg, withinMs = 5 * 60 * 1000) {
            const currentNotifs = JSON.parse(localStorage.getItem('smart_dash_notifications') || '[]');
            const curTime = Date.now();
            return currentNotifs.some(n => n.msg === msg && (curTime - (n.id || 0)) < withinMs);
        }

        const lastWalkinStr = localStorage.getItem('notif_last_walkin_time');
        const lastWalkinTime = lastWalkinStr ? parseInt(lastWalkinStr, 10) : 0;

        if (!lastWalkinTime || (nowTime - lastWalkinTime >= oneHourMs)) {
            if (!hasRecentNotification('Add Walk-in Data')) {
                window.triggerNotification('Add Walk-in Data');
            }
            localStorage.setItem('notif_last_walkin_time', nowTime.toString());
        }

        const dayOfWeek = now.getDay();
        const currentHour = now.getHours();
        const todayDateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        if (dayOfWeek === 2 && currentHour >= 11) {
            const lastMeetingDate = localStorage.getItem('notif_last_tuesday_meeting_date');
            if (lastMeetingDate !== todayDateKey) {
                if (!hasRecentNotification('Tailoring Supervisor meeting')) {
                    window.triggerNotification('Tailoring Supervisor meeting');
                }
                localStorage.setItem('notif_last_tuesday_meeting_date', todayDateKey);
            }
        }
    };

    setTimeout(window.checkScheduledReminders, 1500);
    setInterval(window.checkScheduledReminders, 30000);
})();
