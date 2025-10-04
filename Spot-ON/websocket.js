// websocket_client.js

const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:8080';
const REQUEST_INTERVAL = 2000; // 2 seconds

// Connect to WebSocket server
const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10
});

// Store last received data
let lastData = null;
let updateCount = 0;

// Connection event handlers
socket.on('connect', () => {
    console.log('✅ Connected to parking detection server');
    console.log(`📡 Server: ${SERVER_URL}`);
    console.log(`⏱️  Requesting data every ${REQUEST_INTERVAL / 1000} seconds`);
    console.log('=' .repeat(60));
});

socket.on('disconnect', () => {
    console.log('\n❌ Disconnected from server');
    console.log('🔄 Attempting to reconnect...');
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection Error:', error.message);
    console.log('💡 Make sure app.py is running on port 8080');
});

socket.on('reconnect', (attemptNumber) => {
    console.log(`✅ Reconnected after ${attemptNumber} attempts`);
});

// Main data handler - receives automatic updates
socket.on('parking_update', (data) => {
    updateCount++;
    const timestamp = new Date().toLocaleTimeString();
    
    console.log('\n' + '─'.repeat(60));
    console.log(`📊 Update #${updateCount} received at ${timestamp}`);
    console.log('─'.repeat(60));
    console.log(`🚗 Total Spaces:    ${data.total_spaces}`);
    console.log(`✅ Free Spaces:     ${data.free_spaces}`);
    console.log(`🚫 Occupied Spaces: ${data.occupied_spaces}`);
    console.log(`📈 Probability:     ${data.probability}%`);
    
    if (data.timestamp) {
        console.log(`⏰ Server Time:     ${data.timestamp}`);
    }
    
    // Check if data changed from last update
    if (lastData) {
        const changes = [];
        if (data.free_spaces !== lastData.free_spaces) {
            changes.push(`Free: ${lastData.free_spaces} → ${data.free_spaces}`);
        }
        if (data.occupied_spaces !== lastData.occupied_spaces) {
            changes.push(`Occupied: ${lastData.occupied_spaces} → ${data.occupied_spaces}`);
        }
        if (data.probability !== lastData.probability) {
            changes.push(`Probability: ${lastData.probability}% → ${data.probability}%`);
        }
        
        if (changes.length > 0) {
            console.log('🔄 Changes detected:', changes.join(' | '));
        } else {
            console.log('⚪ No changes from previous update');
        }
    }
    
    // Store current data for comparison
    lastData = { ...data };
    
    // Raw data object for debugging
    console.log('\n📦 Raw Data Object:');
    console.log(JSON.stringify(data, null, 2));
});

// Manual data request every 2 seconds (backup mechanism)
setInterval(() => {
    if (socket.connected) {
        socket.emit('request_data');
        console.log('\n🔄 Manually requested data...');
    }
}, REQUEST_INTERVAL);

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n👋 Closing connection...');
    console.log(`📊 Total updates received: ${updateCount}`);
    socket.disconnect();
    process.exit(0);
});

// Initial startup message
console.log('\n' + '='.repeat(60));
console.log('🚀 Parking Detection WebSocket Client Started');
console.log('='.repeat(60));
console.log('📡 Connecting to server...');
console.log('💡 Press Ctrl+C to stop');
console.log('='.repeat(60) + '\n');