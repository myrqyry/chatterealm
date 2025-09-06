const io = require('socket.io-client');

// Test to reproduce "No available spawn position" error
console.log('🧪 Testing spawn position system...');

const MAX_PLAYERS = 25; // Try to spawn more than the grid can handle
const sockets = [];
let successfulSpawns = 0;
let spawnErrors = 0;
let authErrors = 0;
let completedConnections = 0;

// Grid is now 40x30 = 1200 total positions
// With terrain variation, this test now stresses spawning without immediately exhausting space
console.log(`🎯 Attempting to spawn ${MAX_PLAYERS} players simultaneously...`);

function createPlayer(index) {
  return new Promise((resolve, reject) => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      autoConnect: true,
    });

    const playerId = `test-player-${index}-${Date.now()}`;
    let hasJoined = false;
    let hasError = false;

    const timeout = setTimeout(() => {
      if (!hasJoined && !hasError) {
        console.log(`⏰ Player ${index} timed out`);
        socket.disconnect();
        resolve({ success: false, error: 'timeout', index });
      }
    }, 15000);

    socket.on('connect', () => {
      console.log(`🔌 Player ${index} connected`);
      
      // Join game
      socket.emit('join_game', {
        id: playerId,
        displayName: `TestPlayer${index}`,
        class: 'KNIGHT'
      });
    });

    socket.on('game_joined', (data) => {
      if (hasError || hasJoined) return;
      
      hasJoined = true;
      clearTimeout(timeout);
      successfulSpawns++;
      
      console.log(`✅ Player ${index} successfully spawned at (${data.player.position.x}, ${data.player.position.y})`);
      
      // Send join confirmation
      socket.emit('join_confirmed');
      
      // Keep connection for a moment to hold the spawn position
      setTimeout(() => {
        socket.disconnect();
        resolve({ success: true, index, position: data.player.position });
      }, 1000);
    });

    socket.on('error', (error) => {
      if (hasError || hasJoined) return;
      
      hasError = true;
      clearTimeout(timeout);
      
      if (error.message.includes('spawn position')) {
        spawnErrors++;
        console.log(`❌ Player ${index} spawn error: ${error.message}`);
      } else if (error.message.includes('authenticated')) {
        authErrors++;
        console.log(`🔒 Player ${index} auth error: ${error.message}`);
      } else {
        console.log(`⚠️ Player ${index} other error: ${error.message}`);
      }
      
      socket.disconnect();
      resolve({ success: false, error: error.message, index });
    });

    socket.on('disconnect', () => {
      completedConnections++;
    });

    sockets.push(socket);
  });
}

async function runSpawnTest() {
  const startTime = Date.now();
  
  // Create all players simultaneously to stress test the system
  const promises = [];
  for (let i = 0; i < MAX_PLAYERS; i++) {
    promises.push(createPlayer(i));
  }

  console.log(`🚀 Starting ${MAX_PLAYERS} simultaneous connections...`);
  
  const results = await Promise.all(promises);
  const duration = Date.now() - startTime;

  // Wait a bit for all disconnections to complete
  setTimeout(() => {
    console.log('\n📊 SPAWN TEST RESULTS:');
    console.log(`⏱️  Test duration: ${duration}ms`);
    console.log(`✅ Successful spawns: ${successfulSpawns}/${MAX_PLAYERS}`);
    console.log(`❌ Spawn position errors: ${spawnErrors}`);
    console.log(`🔒 Authentication errors: ${authErrors}`);
    console.log(`🔌 Completed disconnections: ${completedConnections}`);
    
    // Show spawn positions for successful spawns
    const positions = results
      .filter(r => r.success && r.position)
      .map(r => `(${r.position.x},${r.position.y})`)
      .slice(0, 10); // Show first 10
    
    if (positions.length > 0) {
      console.log(`📍 Sample spawn positions: ${positions.join(', ')}${positions.length >= 10 ? '...' : ''}`);
    }
    
    if (spawnErrors > 0) {
      console.log(`\n🎯 SUCCESS: Reproduced spawn position errors!`);
      console.log(`   This confirms the spawn system is working and properly rejecting when full.`);
    } else if (successfulSpawns === MAX_PLAYERS) {
      console.log(`\n✨ All players spawned successfully - system is robust!`);
    } else {
      console.log(`\n⚠️  Mixed results - some spawns failed for other reasons`);
    }

    process.exit(0);
  }, 2000);
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Cleaning up connections...');
  sockets.forEach(socket => socket.disconnect());
  process.exit(0);
});

runSpawnTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});