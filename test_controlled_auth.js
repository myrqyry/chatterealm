const io = require('socket.io-client');

class ControlledAuthTest {
  constructor() {
    this.serverUrl = 'http://localhost:3001';
    this.results = {
      authRaceTests: [],
      spawnTests: [],
      errors: []
    };
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testAuthenticationRaceCondition() {
    console.log('\n🔍 Testing Authentication Race Condition...');
    
    return new Promise((resolve) => {
      const socket = io(this.serverUrl, { 
        transports: ['websocket'],
        timeout: 5000
      });

      let joinConfirmReceived = false;
      let commandResponseReceived = false;
      let testComplete = false;

      const timeout = setTimeout(() => {
        if (!testComplete) {
          testComplete = true;
          socket.disconnect();
          this.results.errors.push('Authentication race test timed out');
          resolve(false);
        }
      }, 10000);

      socket.on('connect', () => {
        console.log('✅ Connected to server');
        
        // Send join_game
        socket.emit('join_game', {
          id: 'race-test-' + Date.now(),
          displayName: 'RaceTestPlayer',
          class: 'KNIGHT'
        });
        
        // Immediately send a command before authentication is confirmed
        // This should be queued, not rejected with "Not authenticated"
        socket.emit('player_command', {
          type: 'move',
          data: { direction: 'north' }
        });
        console.log('📤 Sent move command immediately after join_game');
      });

      socket.on('game_joined', (data) => {
        console.log('🎮 Game joined:', data);
        socket.emit('join_confirmed');
      });

      socket.on('join_confirmed', () => {
        console.log('✅ Join confirmed received');
        joinConfirmReceived = true;
        
        // Check if test should complete
        if (commandResponseReceived && !testComplete) {
          testComplete = true;
          clearTimeout(timeout);
          socket.disconnect();
          this.results.authRaceTests.push({
            success: true,
            description: 'Command queued during auth race condition'
          });
          resolve(true);
        }
      });

      socket.on('command_response', (data) => {
        console.log('📥 Command response:', data);
        commandResponseReceived = true;
        
        if (data.error && data.error.includes('Not authenticated')) {
          console.log('❌ FAILED: Still getting "Not authenticated" error');
          this.results.authRaceTests.push({
            success: false,
            description: 'Authentication race condition not fixed',
            error: data.error
          });
          testComplete = true;
          clearTimeout(timeout);
          socket.disconnect();
          resolve(false);
        } else {
          console.log('✅ SUCCESS: Command was properly queued and processed');
          
          // Check if test should complete
          if (joinConfirmReceived && !testComplete) {
            testComplete = true;
            clearTimeout(timeout);
            socket.disconnect();
            this.results.authRaceTests.push({
              success: true,
              description: 'Command queued during auth race condition'
            });
            resolve(true);
          }
        }
      });

      socket.on('error', (error) => {
        console.log('❌ Socket error:', error);
        this.results.errors.push(`Socket error: ${error}`);
        if (!testComplete) {
          testComplete = true;
          clearTimeout(timeout);
          socket.disconnect();
          resolve(false);
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
      });
    });
  }

  async testSpawnPositionGradual() {
    console.log('\n🔍 Testing Spawn Position Management (Gradual Load)...');
    
    const connections = [];
    const maxConnections = 10; // Start with smaller number
    let successfulSpawns = 0; // Track successful spawns in this test

    try {
      for (let i = 0; i < maxConnections; i++) {
        console.log(`📡 Creating connection ${i + 1}/${maxConnections}`);
        
        const socket = io(this.serverUrl, { 
          transports: ['websocket'],
          timeout: 5000 // Timeout for initial connection
        });
        
        connections.push(socket);
        
        await this.delay(500); // Add delay between connections to avoid overwhelming server
        
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            // Treat timeout as a spawn failure, not a generic error that crashes the test
            resolve({ success: false, error: `Connection ${i + 1} timed out or no available spawn position` });
          }, 8000); // Increased timeout to give backend more time if needed

          let hasResolved = false; // Flag to prevent multiple resolutions

          socket.on('connect', () => {
            if (hasResolved) return;
            socket.emit('join_game', {
              id: `spawn-test-${i + 1}-${Date.now()}`,
              displayName: `SpawnTest${i + 1}`,
              class: 'KNIGHT'
            });
          });

          socket.on('game_joined', (data) => {
            if (hasResolved) return;
            hasResolved = true;
            console.log(`✅ Connection ${i + 1} joined successfully`);
            clearTimeout(timeout);
            resolve({ success: true, position: data.player.position }); // Resolve with success and position
          });

          socket.on('error', (error) => {
            if (hasResolved) return;
            hasResolved = true;
            clearTimeout(timeout);
            
            let errorMessage = error.message || String(error); // Ensure error.message is available

            if (errorMessage.includes('No available spawn position')) {
              console.log(`📍 Connection ${i + 1} error: No available spawn position (expected if map is full/mountainous)`);
              resolve({ success: false, error: 'No available spawn position' }); // Explicitly resolve for this expected case
            } else if (errorMessage.includes('Not authenticated')) {
              console.log(`🔒 Connection ${i + 1} error: Authentication error: ${errorMessage}`);
              resolve({ success: false, error: `Authentication error: ${errorMessage}` }); // Handle auth errors
            } else {
              console.log(`❌ Connection ${i + 1} error: Unexpected error: ${errorMessage}`);
              resolve({ success: false, error: `Unexpected error: ${errorMessage}` }); // Other unexpected errors
            }
          });
        });

        if (result.success) {
          successfulSpawns++; // Increment counter for successful spawns
        } else {
          // Record failures in the test results, but don't stop the loop
          this.results.spawnTests.push({
            success: false,
            description: `Connection ${i + 1} failed to spawn: ${result.error}`,
            connections: 1 // Indicate this single connection failure
          });
        }
      }
      
      console.log(`✅ Successfully created ${successfulSpawns}/${maxConnections} connections`);
      
      this.results.spawnTests.push({
        success: successfulSpawns > 0, // Mark test as success if at least one spawned
        description: `${successfulSpawns} players spawned successfully`,
        connections: successfulSpawns
      });
      
    } catch (error) {
      console.log('❌ Spawn test error (overall catch):', error.message);
      this.results.spawnTests.push({
        success: false,
        description: error.message,
        connections: successfulSpawns // Use the number of players tried
      });
    } finally {
      // Clean up all connections
      console.log('🧹 Cleaning up connections...');
      connections.forEach((socket, index) => {
        try {
          socket.disconnect();
        } catch (err) {
          console.log(`Warning: Error disconnecting socket ${index}:`, err.message);
        }
      });
      
      // Wait for cleanup
      await this.delay(2000);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Controlled Authentication and Spawn Tests...\n');
    
    try {
      // Test 1: Authentication race condition
      await this.testAuthenticationRaceCondition();
      
      // Small delay between tests
      await this.delay(2000);
      
      // Test 2: Gradual spawn position testing
      await this.testSpawnPositionGradual();
      
      // Print results
      this.printResults();
      
    } catch (error) {
      console.error('❌ Test suite error:', error);
      this.results.errors.push(`Test suite error: ${error.message}`);
    }
  }

  printResults() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    console.log('\n🔐 Authentication Race Condition Tests:');
    this.results.authRaceTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.success ? '✅' : '❌'} ${test.description}`);
      if (test.error) console.log(`   Error: ${test.error}`);
    });
    
    console.log('\n📍 Spawn Position Tests:');
    this.results.spawnTests.forEach((test, index) => {
      console.log(`${index + 1}. ${test.success ? '✅' : '❌'} ${test.description}`);
      if (test.connections !== undefined) console.log(`   Connections: ${test.connections}`); // Use undefined check
      if (test.error) console.log(`   Error: ${test.error}`); // Display error for spawn tests
    });
    
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    const authPassed = this.results.authRaceTests.every(test => test.success);
    const spawnPassed = this.results.spawnTests.every(test => test.success);
    const overallPassed = authPassed && spawnPassed && this.results.errors.length === 0;
    
    console.log(`\n🏁 OVERALL RESULT: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`   Authentication fixes: ${authPassed ? '✅ Working' : '❌ Issues found'}`);
    console.log(`   Spawn position fixes: ${spawnPassed ? '✅ Working' : '❌ Issues found'}`);
  }
}

// Run the tests
const tester = new ControlledAuthTest();
tester.runAllTests().then(() => {
  console.log('\n✨ Test suite completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test suite failed:', error);
  process.exit(1);
});
