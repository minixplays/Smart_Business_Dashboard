/**
 * theme.js
 * Handles loading, persisting, and toggling the dark theme across all dashboard tools.
 */
(function () {
  'use strict';

  function getThemeFromStorage() {
    try {
      return localStorage.getItem('theme');
    } catch (e) {
      return null;
    }
  }

  function saveThemeToStorage(theme) {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    const isDark = (theme === 'dark');
    const target = isDark ? 'dark' : 'light';

    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      if (document.body) document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      if (document.body) document.body.classList.remove('dark-mode');
    }

    // Direct element updates for sun and moon icons across all tool headers
    const suns = document.querySelectorAll('.sun-icon, .floating-sun');
    const moons = document.querySelectorAll('.moon-icon, .floating-moon');

    suns.forEach(s => {
      s.style.display = isDark ? 'none' : 'flex';
      s.style.opacity = isDark ? '0' : '1';
    });
    moons.forEach(m => {
      m.style.display = isDark ? 'flex' : 'none';
      m.style.opacity = isDark ? '1' : '0';
    });

    // Update aria attributes and titles
    const toggles = document.querySelectorAll('.theme-toggle, [onclick*="toggleTheme"], #floatingThemeBtn');
    toggles.forEach(btn => {
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.title = isDark ? 'Switch to Light Mode (Alt+T)' : 'Switch to Dark Mode (Alt+T)';
    });

    // Dispatch custom event for charts or components
    try {
      window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: target, isDark } }));
    } catch (e) {}
  }

  function loadTheme() {
    const saved = getThemeFromStorage();
    applyTheme(saved === 'dark' ? 'dark' : 'light');
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark-mode') ||
                   (document.body && document.body.classList.contains('dark-mode'));
    const next = isDark ? 'light' : 'dark';
    applyTheme(next);
    saveThemeToStorage(next);
  }

  // Expose to global scope for HTML onclick attributes & Electron
  window.loadTheme = loadTheme;
  window.toggleTheme = toggleTheme;
  window.applyTheme = applyTheme;

  // 1. Immediate: apply to <html> to prevent FOUC
  loadTheme();

  // 2. Setup on DOM ready
  function setupThemeUI() {
    const saved = getThemeFromStorage();
    applyTheme(saved === 'dark' ? 'dark' : 'light');

    // Check if the current page has ANY theme toggle button
    const existingToggle = document.querySelector('.theme-toggle, [onclick*="toggleTheme"], #themeToggleBtn');
    if (!existingToggle && !document.getElementById('floatingThemeBtn')) {
      const isDark = (saved === 'dark');
      const floatDiv = document.createElement('div');
      floatDiv.id = 'floatingThemeWrapper';
      floatDiv.style.cssText = 'position:fixed;bottom:2rem;right:5.5rem;z-index:99998;';
      floatDiv.innerHTML = `
        \x3Cbutton id="floatingThemeBtn" onclick="toggleTheme()" class="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#242424] hover:bg-neutral-50 shadow-lg transition relative" title="${isDark ? 'Switch to Light Mode (Alt+T)' : 'Switch to Dark Mode (Alt+T)'}" style="cursor:pointer;outline:none;">
          \x3Cspan class="floating-sun" style="display:${isDark ? 'none' : 'flex'};align-items:center;justify-content:center;">
            \x3Csvg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              \x3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            \x3C/svg>
          \x3C/span>
          \x3Cspan class="floating-moon" style="display:${isDark ? 'flex' : 'none'};color:#f4c74a;align-items:center;justify-content:center;">
            \x3Csvg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              \x3Cpath d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            \x3C/svg>
          \x3C/span>
        \x3C/button>
      `;
      document.body.appendChild(floatDiv);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupThemeUI);
  } else {
    setupThemeUI();
  }
  window.addEventListener('load', setupThemeUI);

  // 3. Global keyboard shortcut: Alt + T
  document.addEventListener('keydown', function (e) {
    if (e.altKey && (e.key === 't' || e.key === 'T')) {
      e.preventDefault();
      toggleTheme();
    }
  });

  // 4. Cross-tab & Cross-window synchronization
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme') {
      applyTheme(e.newValue === 'dark' ? 'dark' : 'light');
    }
  });
})();
