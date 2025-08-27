const io = require('socket.io-client');

// Test to reproduce "Not authenticated" error via race conditions
console.log('🧪 Testing authentication race conditions...');

const TEST_SCENARIOS = [
  {
    name: 'Commands before join_confirmed',
    description: 'Send commands immediately after game_joined but before join_confirmed',
    test: testCommandsBeforeConfirmation
  },
  {
    name: 'Rapid disconnect/reconnect',
    description: 'Disconnect and reconnect rapidly to test auth state cleanup',
    test: testRapidReconnection
  },
  {
    name: 'Multiple rapid commands',
    description: 'Send multiple commands in quick succession',
    test: testMultipleRapidCommands
  },
  {
    name: 'Command without join',
    description: 'Send commands without ever joining the game',
    test: testCommandWithoutJoin
  }
];

let testResults = [];

async function testCommandsBeforeConfirmation() {
  return new Promise((resolve) => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    let authErrors = 0;
    let commandResults = 0;
    let playerId = null;

    socket.on('connect', () => {
      console.log('🔌 Connected for auth race test');
      
      socket.emit('join_game', {
        id: `auth-test-${Date.now()}`,
        displayName: 'AuthTestPlayer',
        class: 'KNIGHT'
      });
    });

    socket.on('game_joined', (data) => {
      playerId = data.player.id;
      console.log(`🎮 Game joined: ${data.player.displayName}`);
      
      // Send commands BEFORE join_confirmed (this should be queued, not fail)
      console.log('📤 Sending commands before join confirmation...');
      
      socket.emit('player_command', {
        type: 'move',
        playerId: playerId,
        data: { direction: 'up' }
      });
      
      socket.emit('player_command', {
        type: 'move',
        playerId: playerId,
        data: { direction: 'down' }
      });
      
      // Wait a bit, then send join_confirmed
      setTimeout(() => {
        console.log('📤 Sending join confirmation...');
        socket.emit('join_confirmed');
      }, 100);
    });

    socket.on('command_result', (result) => {
      commandResults++;
      console.log(`📥 Command result ${commandResults}: ${result.success ? '✅' : '❌'} ${result.message}`);
      
      if (commandResults >= 2) {
        socket.disconnect();
        resolve({ 
          success: true, 
          authErrors, 
          commandResults,
          message: `Commands processed: ${commandResults}, Auth errors: ${authErrors}`
        });
      }
    });

    socket.on('error', (error) => {
      if (error.message.includes('authenticated')) {
        authErrors++;
        console.log(`🔒 Auth error: ${error.message}`);
      } else {
        console.log(`⚠️ Other error: ${error.message}`);
      }
      
      if (authErrors > 0) {
        socket.disconnect();
        resolve({
          success: false,
          authErrors,
          commandResults,
          message: `Auth errors detected: ${authErrors}`
        });
      }
    });

    setTimeout(() => {
      socket.disconnect();
      resolve({
        success: commandResults > 0 && authErrors === 0,
        authErrors,
        commandResults,
        message: `Timeout - Commands: ${commandResults}, Auth errors: ${authErrors}`
      });
    }, 10000);
  });
}

async function testRapidReconnection() {
  return new Promise((resolve) => {
    let authErrors = 0;
    let successfulConnections = 0;
    let completedTests = 0;
    const totalTests = 3;

    for (let i = 0; i < totalTests; i++) {
      setTimeout(() => {
        const socket = io('http://localhost:3001', {
          transports: ['websocket', 'polling'],
          timeout: 3000,
        });

        socket.on('connect', () => {
          socket.emit('join_game', {
            id: `rapid-test-${i}-${Date.now()}`,
            displayName: `RapidTestPlayer${i}`,
            class: 'ROGUE'
          });
        });

        socket.on('game_joined', () => {
          successfulConnections++;
          socket.emit('join_confirmed');
          
          // Immediately send a command then disconnect
          socket.emit('player_command', {
            type: 'move',
            data: { direction: 'left' }
          });
          
          setTimeout(() => socket.disconnect(), 50);
        });

        socket.on('error', (error) => {
          if (error.message.includes('authenticated')) {
            authErrors++;
          }
        });

        socket.on('disconnect', () => {
          completedTests++;
          if (completedTests >= totalTests) {
            resolve({
              success: authErrors === 0,
              authErrors,
              successfulConnections,
              message: `Rapid reconnect test - Connections: ${successfulConnections}, Auth errors: ${authErrors}`
            });
          }
        });
      }, i * 200); // Stagger connections slightly
    }
  });
}

async function testMultipleRapidCommands() {
  return new Promise((resolve) => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000,
    });

    let authErrors = 0;
    let commandResults = 0;
    let playerId = null;

    socket.on('connect', () => {
      socket.emit('join_game', {
        id: `rapid-cmd-test-${Date.now()}`,
        displayName: 'RapidCmdPlayer',
        class: 'MAGE'
      });
    });

    socket.on('game_joined', (data) => {
      playerId = data.player.id;
      socket.emit('join_confirmed');
      
      // Send 10 rapid commands
      console.log('📤 Sending 10 rapid commands...');
      for (let i = 0; i < 10; i++) {
        socket.emit('player_command', {
          type: 'move',
          playerId: playerId,
          data: { direction: ['up', 'down', 'left', 'right'][i % 4] }
        });
      }
    });

    socket.on('command_result', (result) => {
      commandResults++;
      if (commandResults >= 10) {
        socket.disconnect();
        resolve({
          success: authErrors === 0,
          authErrors,
          commandResults,
          message: `Rapid commands test - Results: ${commandResults}, Auth errors: ${authErrors}`
        });
      }
    });

    socket.on('error', (error) => {
      if (error.message.includes('authenticated')) {
        authErrors++;
      }
    });

    setTimeout(() => {
      socket.disconnect();
      resolve({
        success: false,
        authErrors,
        commandResults,
        message: `Timeout - Results: ${commandResults}, Auth errors: ${authErrors}`
      });
    }, 8000);
  });
}

async function testCommandWithoutJoin() {
  return new Promise((resolve) => {
    const socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 3000,
    });

    let authErrors = 0;

    socket.on('connect', () => {
      // Send command without joining game (should fail)
      console.log('📤 Sending command without joining game...');
      socket.emit('player_command', {
        type: 'move',
        playerId: 'fake-player-id',
        data: { direction: 'up' }
      });
    });

    socket.on('error', (error) => {
      if (error.message.includes('authenticated')) {
        authErrors++;
        console.log(`🔒 Expected auth error: ${error.message}`);
        socket.disconnect();
        resolve({
          success: true, // This error is expected
          authErrors,
          message: `Command without join correctly rejected with auth error`
        });
      }
    });

    setTimeout(() => {
      socket.disconnect();
      resolve({
        success: authErrors > 0, // We expect this to fail
        authErrors,
        message: `No join test - Auth errors: ${authErrors} (should be > 0)`
      });
    }, 5000);
  });
}

async function runAuthTests() {
  console.log(`🚀 Running ${TEST_SCENARIOS.length} authentication test scenarios...\n`);
  
  for (const scenario of TEST_SCENARIOS) {
    console.log(`🧪 Testing: ${scenario.name}`);
    console.log(`   ${scenario.description}`);
    
    try {
      const result = await scenario.test();
      testResults.push({
        name: scenario.name,
        ...result
      });
      
      console.log(`   ${result.success ? '✅ PASS' : '❌ FAIL'}: ${result.message}\n`);
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}\n`);
      testResults.push({
        name: scenario.name,
        success: false,
        message: `Test error: ${error.message}`
      });
    }
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary
  console.log('📊 AUTHENTICATION TEST RESULTS:');
  console.log('=====================================');
  const passed = testResults.filter(r => r.success).length;
  const failed = testResults.filter(r => !r.success).length;
  
  testResults.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}: ${result.message}`);
  });
  
  console.log(`\n🎯 Summary: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All authentication tests passed! Race condition fixes are working.');
  } else {
    console.log('⚠️  Some authentication issues detected - may need further investigation.');
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

runAuthTests().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Auth test suite failed:', error);
  process.exit(1);
});