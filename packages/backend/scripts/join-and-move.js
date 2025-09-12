// Small test client to join the game and issue a move command.
// Usage from repo root:
// SERVER=http://localhost:3001 node packages/backend/scripts/join-and-move.js
// or to force an alternate port: SERVER=http://localhost:3002 node packages/backend/scripts/join-and-move.js

const SERVER = process.env.SERVER || 'http://localhost:3001';
console.log('[TEST_CLIENT] Connecting to', SERVER);

let socket;
try {
  const { io } = require('socket.io-client');
  socket = io(SERVER, {
    transports: ['polling', 'websocket'],
    reconnectionAttempts: 3,
    timeout: 5000
  });
} catch (err) {
  console.error('[TEST_CLIENT] Failed to require socket.io-client:', err.message || err);
  process.exit(2);
}

let joinedId = null;
let gotDelta = false;

socket.on('connect', () => {
  console.log('[TEST_CLIENT] connected, socket id=', socket.id, 'transport=', socket.io.engine.transport.name);
  const payload = { id: `test_player_${Date.now()}`, displayName: 'TestPlayer', class: 'knight', avatar: '🙂' };
  console.log('[TEST_CLIENT] emitting join_game with', payload);
  socket.emit('join_game', payload);
});

socket.on('connect_error', (err) => {
  console.error('[TEST_CLIENT] connect_error', err && err.message ? err.message : err);
});

socket.on('game_joined', (data) => {
  console.log('[TEST_CLIENT] game_joined received for id=', data.player?.id, 'pos=', data.player?.position);
  joinedId = data.player?.id;
  setTimeout(() => {
    console.log('[TEST_CLIENT] sending player_command move down for', joinedId);
    socket.emit('player_command', { type: 'move', playerId: joinedId, data: { direction: 'down' } });
  }, 300);
});

socket.on('command_result', (r) => {
  console.log('[TEST_CLIENT] command_result', JSON.stringify(r));
});

socket.on('game_state_delta', (deltas) => {
  gotDelta = true;
  console.log('[TEST_CLIENT] game_state_delta:', JSON.stringify(deltas, null, 2));
  // exit after a short delay
  setTimeout(() => process.exit(0), 200);
});

socket.on('disconnect', (reason) => {
  console.log('[TEST_CLIENT] disconnected:', reason);
});

// Timeout
setTimeout(() => {
  if (!gotDelta) {
    console.log('[TEST_CLIENT] No deltas received within timeout, exiting.');
    try { socket.disconnect(); } catch (e) {}
    process.exit(1);
  }
}, 9000);
