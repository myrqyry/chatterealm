const { io } = require('socket.io-client');

const SERVER = process.env.SERVER_URL || process.env.SERVER || 'http://localhost:3001';
console.log('Connecting to', SERVER);

let got = false;

// Try websocket first, then fallback to polling if websocket fails
let attemptedPolling = false;
let socket = io(SERVER, { transports: ['websocket'], reconnectionAttempts: 2, timeout: 4000 });

const attachHandlers = (s) => {
  s.on('connect', () => {
    console.log('Connected to server, id=', s.id, 'transport=', s.io.engine.transport.name);
  });

  s.on('connect_error', (err) => {
    console.error('connect_error', err.message || err);
    // If websocket failed and we haven't tried polling, try polling transport
    if (!attemptedPolling && err && (!err.message || err.message.toLowerCase().includes('websocket'))) {
      attemptedPolling = true;
      console.log('Attempting fallback to polling transport...');
      try {
        s.close();
      } catch (e) {}
      socket = io(SERVER, { transports: ['polling'], reconnectionAttempts: 2, timeout: 4000 });
      attachHandlers(socket);
    }
  });

  s.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
  });

  s.on('game_state_delta', (deltas) => {
    got = true;
    try {
      console.log('Received game_state_delta:', JSON.stringify(deltas, null, 2).slice(0, 2000));
    } catch (e) {
      console.log('Received game_state_delta (non-serializable)');
    }
  });
};

attachHandlers(socket);

// If no deltas in 8s, exit
setTimeout(() => {
  if (!got) {
    console.log('No deltas received in 8s, exiting.');
  } else {
    console.log('Received deltas, exiting.');
  }
  try { socket.disconnect(); } catch (e) {}
  process.exit(0);
}, 8000);
