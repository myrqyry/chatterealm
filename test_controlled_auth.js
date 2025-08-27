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
          direction: 'north'
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
    
    try {
      for (let i = 0; i < maxConnections; i++) {
        console.log(`📡 Creating connection ${i + 1}/${maxConnections}`);
        
        const socket = io(this.serverUrl, { 
          transports: ['websocket'],
          timeout: 5000
        });
        
        connections.push(socket);
        
        // Add delay between connections to avoid overwhelming server
        await this.delay(500);
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Connection ${i + 1} timed out`));
          }, 8000);

          socket.on('connect', () => {
            socket.emit('join_game', {
              id: `spawn-test-${i + 1}-${Date.now()}`,
              displayName: `SpawnTest${i + 1}`,
              class: 'KNIGHT'
            });
          });

          socket.on('game_joined', (data) => {
            console.log(`✅ Connection ${i + 1} joined successfully`);
            clearTimeout(timeout);
            resolve();
          });

          socket.on('error', (error) => {
            console.log(`❌ Connection ${i + 1} error:`, error);
            clearTimeout(timeout);
            if (error.includes('No available spawn position')) {
              // This is expected if we exceed grid capacity
              console.log('📍 Spawn position limit reached (expected)');
              resolve();
            } else {
              reject(error);
            }
          });
        });
      }
      
      console.log(`✅ Successfully created ${connections.length} connections`);
      this.results.spawnTests.push({
        success: true,
        description: `${connections.length} players spawned successfully`,
        connections: connections.length
      });
      
    } catch (error) {
      console.log('❌ Spawn test error:', error.message);
      this.results.spawnTests.push({
        success: false,
        description: error.message,
        connections: connections.length
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
      if (test.connections) console.log(`   Connections: ${test.connections}`);
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
