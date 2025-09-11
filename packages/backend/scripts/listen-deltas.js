const io = require('socket.io-client');

const SERVER = process.env.SERVER || 'http://localhost:3001';
const socket = io(SERVER, { reconnectionAttempts: 3, timeout: 5000 });

console.log('Connecting to', SERVER);

let got = false;

socket.on('connect', () => {
  console.log('Connected to server, id=', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('connect_error', err.message || err);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('game_state_delta', (deltas) => {
  got = true;
  console.log('Received game_state_delta:', JSON.stringify(deltas, null, 2));
});

// If no deltas in 8s, exit
setTimeout(() => {
  if (!got) {
    console.log('No deltas received in 8s, exiting.');
    process.exit(0);
  }
}, 8000);
