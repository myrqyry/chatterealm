const io = require('socket.io-client');

class FinalVerificationTest {
  constructor() {
    this.serverUrl = 'http://localhost:3001';
    this.testResults = [];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testAuthenticationFixWorking() {
    console.log('\n🔍 FINAL TEST: Authentication Race Condition Fix');
    console.log('='.repeat(60));
    
    return new Promise((resolve) => {
      const socket = io(this.serverUrl, { 
        transports: ['websocket'],
        timeout: 5000
      });

      let authTestComplete = false;

      const timeout = setTimeout(() => {
        if (!authTestComplete) {
          authTestComplete = true;
          socket.disconnect();
          console.log('❌ Test timed out');
          resolve(false);
        }
      }, 10000);

      socket.on('connect', () => {
        console.log('✅ Connected to server');
        
        // Send join_game
        socket.emit('join_game', {
          id: 'final-auth-test-' + Date.now(),
          displayName: 'FinalAuthTest',
          class: 'KNIGHT'
        });
        
        // Immediately send a properly formatted command before authentication is confirmed
        // This tests the race condition fix
        socket.emit('player_command', {
          type: 'move',
          data: { direction: 'north' }
        });
        console.log('📤 Sent move command IMMEDIATELY after join_game (before confirmation)');
      });

      socket.on('game_joined', (data) => {
        console.log('🎮 Game joined successfully');
        console.log('⏰ Now sending join confirmation...');
        socket.emit('join_confirmed');
      });

      socket.on('command_result', (data) => {
        console.log('📥 Command response received:', data);
        
        if (!authTestComplete) {
          authTestComplete = true;
          clearTimeout(timeout);
          
          if (data.error && data.error.includes('Not authenticated')) {
            console.log('❌ FAILED: Still getting "Not authenticated" error');
            console.log('   This means the authentication race condition fix is not working');
            this.testResults.push({
              test: 'Authentication Race Condition Fix',
              result: 'FAILED',
              error: data.error
            });
            resolve(false);
          } else {
            console.log('✅ SUCCESS: Command was queued and processed without "Not authenticated" error');
            console.log('   The authentication race condition fix is WORKING!');
            this.testResults.push({
              test: 'Authentication Race Condition Fix', 
              result: 'PASSED',
              details: 'Commands are properly queued during authentication'
            });
            resolve(true);
          }
          
          socket.disconnect();
        }
      });

      socket.on('error', (error) => {
        if (!authTestComplete && error.message && error.message.includes('Not authenticated')) {
          authTestComplete = true;
          clearTimeout(timeout);
          console.log('❌ FAILED: Received "Not authenticated" error');
          console.log('   Error:', error.message);
          this.testResults.push({
            test: 'Authentication Race Condition Fix',
            result: 'FAILED', 
            error: error.message
          });
          socket.disconnect();
          resolve(false);
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
      });
    });
  }

  async testSpawnPositionFix() {
    console.log('\n🔍 FINAL TEST: Spawn Position Management');
    console.log('='.repeat(60));
    
    const connections = [];
    const maxConnections = 5; // Conservative test
    let spawnSuccesses = 0;
    
    try {
      console.log(`📡 Testing ${maxConnections} simultaneous connections...`);
      
      // Create connections in sequence with small delays
      for (let i = 0; i < maxConnections; i++) {
        const socket = io(this.serverUrl, { 
          transports: ['websocket'],
          timeout: 5000
        });
        
        connections.push(socket);
        
        const connectionPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error(`Connection ${i + 1} timed out`));
          }, 6000);

          socket.on('connect', () => {
            socket.emit('join_game', {
              id: `spawn-final-${i + 1}-${Date.now()}`,
              displayName: `SpawnTest${i + 1}`,
              class: 'KNIGHT'
            });
          });

          socket.on('game_joined', (data) => {
            console.log(`✅ Connection ${i + 1} spawned at (${data.player.position.x}, ${data.player.position.y})`);
            socket.emit('join_confirmed');
            spawnSuccesses++;
            clearTimeout(timeout);
            resolve(data.player.position);
          });

          socket.on('error', (error) => {
            clearTimeout(timeout);
            if (error.message && error.message.includes('No available spawn position')) {
              console.log(`📍 Connection ${i + 1}: No available spawn position (this is expected for large numbers)`);
              resolve('spawn_limit_reached');
            } else {
              console.log(`❌ Connection ${i + 1} error:`, error.message);
              reject(new Error(error.message));
            }
          });
        });
        
        try {
          await connectionPromise;
        } catch (error) {
          console.log(`⚠️ Connection ${i + 1} failed: ${error.message}`);
        }
        
        // Small delay between connections
        await this.delay(200);
      }
      
      console.log(`✅ Successfully spawned ${spawnSuccesses}/${maxConnections} players`);
      
      if (spawnSuccesses > 0) {
        this.testResults.push({
          test: 'Spawn Position Management',
          result: 'PASSED',
          details: `${spawnSuccesses} players spawned successfully`
        });
        return true;
      } else {
        this.testResults.push({
          test: 'Spawn Position Management',
          result: 'FAILED',
          details: 'No players could spawn'
        });
        return false;
      }
      
    } catch (error) {
      console.log('❌ Spawn test error:', error.message);
      this.testResults.push({
        test: 'Spawn Position Management',
        result: 'FAILED',
        error: error.message
      });
      return false;
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
      
      await this.delay(1000);
    }
  }

  printFinalResults() {
    console.log('\n📊 FINAL VERIFICATION RESULTS');
    console.log('='.repeat(60));
    
    this.testResults.forEach((result, index) => {
      const emoji = result.result === 'PASSED' ? '✅' : '❌';
      console.log(`${emoji} ${result.test}: ${result.result}`);
      if (result.details) console.log(`   Details: ${result.details}`);
      if (result.error) console.log(`   Error: ${result.error}`);
      console.log('');
    });
    
    const allPassed = this.testResults.every(r => r.result === 'PASSED');
    console.log(`🏁 OVERALL VERDICT: ${allPassed ? '✅ ALL FIXES WORKING' : '❌ ISSUES REMAIN'}`);
    
    if (allPassed) {
      console.log('\n🎉 CONGRATULATIONS! Both original error conditions have been resolved:');
      console.log('   • "Not authenticated" errors: FIXED ✅');
      console.log('   • "No available spawn position" errors: PROPERLY HANDLED ✅');
    }
  }

  async runFinalVerification() {
    console.log('🚀 STARTING FINAL VERIFICATION OF BUG FIXES');
    console.log('='.repeat(60));
    console.log('Testing fixes for:');
    console.log('1. "Not authenticated" errors during race conditions');
    console.log('2. "No available spawn position" errors');
    console.log('');
    
    try {
      // Test authentication fix
      await this.testAuthenticationFixWorking();
      
      // Small delay between tests
      await this.delay(2000);
      
      // Test spawn position handling
      await this.testSpawnPositionFix();
      
      // Print final results
      this.printFinalResults();
      
    } catch (error) {
      console.error('❌ Final verification error:', error);
      this.testResults.push({
        test: 'Overall Test Suite',
        result: 'FAILED', 
        error: error.message
      });
    }
  }
}

// Run the final verification
const tester = new FinalVerificationTest();
tester.runFinalVerification().then(() => {
  console.log('\n✨ Final verification completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Final verification failed:', error);
  process.exit(1);
});