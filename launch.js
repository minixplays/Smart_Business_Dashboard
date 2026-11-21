// Desktop App Launcher
// Ensures ELECTRON_RUN_AS_NODE is unset (preventing IDE terminal conflicts)
delete process.env.ELECTRON_RUN_AS_NODE;

const { spawn } = require('child_process');
const electron = require('electron');

// Security: Strip any unauthorized port or debugging flags passed to the launcher
const unsafeArgs = [
  '--remote-debugging-port',
  '--remote-debugging-address',
  '--remote-debugging-pipe',
  '--inspect',
  '--inspect-brk'
];

const args = process.argv.slice(2).filter(arg => {
  const isBlocked = unsafeArgs.some(unsafe => arg.toLowerCase().startsWith(unsafe));
  if (isBlocked) {
    console.warn(`[Security Alert] Stripped unauthorized launch flag: ${arg}`);
  }
  return !isBlocked;
});

const child = spawn(electron, ['.', ...args], { stdio: 'inherit' });

child.on('close', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to launch desktop app:', err);
  process.exit(1);
});
