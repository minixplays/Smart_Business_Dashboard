# Smart Business Dashboard — Windows Desktop Application

The native Windows desktop edition of **Smart Business Dashboard**, packaged and powered with Electron.

---

## 🚀 Key Desktop Features

- **Native Windows Window & Lifecycle**:
  - Remembers window size, position, and maximized state across sessions.
  - Single-instance locking (prevents duplicate instances, focuses active window).
  - Clean application menu with native accelerators (`Ctrl+H` for Home, `F5` / `Ctrl+R` for Reload, `F12` for DevTools, `Ctrl+P` for Print, `F11` for Full Screen).
- **Secure Architecture & Port Protection**:
  - **Zero Open Ports**: The application runs completely offline using local file protocols (`file://`). It does not bind to any network port (no HTTP or WebSocket servers, no `0.0.0.0` or `127.0.0.1` listening sockets).
  - **Debugging Port Blocklist**: Rejects any CLI flags attempting to open remote debugging ports (`--remote-debugging-port`, `--inspect`, etc.).
  - **Context Isolation & Sandbox**: Renderer scripts are strictly isolated with Node.js integration disabled (`nodeIntegration: false`, `contextIsolation: true`).
  - **Permission Lockdown**: Disallows unauthorized hardware access (camera, microphone, geolocation, sensors).
  - **Content Security Policy (CSP)**: Enforces restrictive CSP denying unauthorized network socket connections.
- **Loading & Exit Experience**:
  - **App Loading Animation Screen**: Sleek executive loading splash with animated brand badge, progress track, and status messaging that transitions out smoothly once all routines and metrics load.
  - **Exit Confirmation Alert**: Intercepts native window closing (`X` button, `Alt+F4`, `Ctrl+Q`, and in-app Exit button) to confirm exit and prevent accidental loss of active sessions.
- **External Link Interception**:
  - External links (e.g. WhatsApp, documentation, web links) automatically open in the user's default system web browser via `shell.openExternal`.
- **Packaging & Distribution**:
  - Builds standalone Windows NSIS installers (`.exe`) with custom installation directories and desktop shortcuts.
  - Builds zero-install Portable executable (`.exe`) for running directly from USB drives or without installation.

---

## 🛠️ Prerequisites

- **Node.js**: LTS version (v18.x or v20.x recommended) — [Download Node.js](https://nodejs.org/)
- **npm** (included with Node.js)
- **Git**

---

## 📦 Getting Started

### 1. Install Dependencies

Open a PowerShell terminal in the project folder and run:

```powershell
npm install
```

### 2. Run in Development Mode

To start the desktop application:

```powershell
npm start
```

Or run with verbose console logging:

```powershell
npm run dev
```

---

## 🏗️ Building & Packaging

### Build Windows Installer (.exe) & Portable Executable

```powershell
# Build standard NSIS installer and portable executable into /dist
npm run dist:win

# Build only portable Windows executable
npm run dist:portable

# Test packed application files without creating installer
npm run pack
```

Build outputs will be created in the `dist/` directory:
- `Smart Business Dashboard Setup 1.0.0.exe` (NSIS Installer)
- `Smart Business Dashboard 1.0.0.exe` (Standalone Portable)

---

## 📁 Project Structure

```
├── assets/
│   ├── icon.ico              # Windows application icon (16x16 to 256x256)
│   ├── icon.png              # High-resolution application icon (512x512)
│   ├── favicon.svg           # Vector source icon
│   ├── theme.css / theme.js  # Dark & light theme engine
│   └── notifications.js      # Global notifications logic
├── main.js                   # Electron main process (lifecycle, menu, IPC, window state)
├── preload.js                # Secure context bridge (desktopAPI)
├── package.json              # App configuration, scripts & electron-builder setup
├── index.html                # Main Dashboard UI
├── *.html                    # Business tools (gcMaker, poMaker, reports, smartNotes, etc.)
└── .gitignore                # Production ignore rules
```
