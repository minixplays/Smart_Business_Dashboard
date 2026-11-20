// Desktop App Launcher
// Ensures ELECTRON_RUN_AS_NODE is unset (preventing IDE terminal conflicts)
delete process.env.ELECTRON_RUN_AS_NODE;

const { spawn } = require('child_process');
const electron = require('electron');

const args = process.argv.slice(2);
const child = spawn(electron, ['.', ...args], { stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to launch desktop app:', err);
  process.exit(1);
});
