// Connect to Node.js WebSocket server
const socket = io();

let updateCount = 0;

// Connection established
socket.on('connect', () => {
  console.log('✅ Connected to server');
  // Request initial data
  socket.emit('request_parking_data');
});

// Listen for 'parkingData' event from Node.js server
socket.on('parkingData', (data) => {
  updateCount++;
  console.log(`📊 Update #${updateCount} - Received parking data:`, data);

  // Update UI dynamically
  const freeSpacesEl = document.getElementById('free_spaces');
  const occupiedSpacesEl = document.getElementById('occupied_spaces');
  const probabilityEl = document.getElementById('probability');

  if (freeSpacesEl) {
    freeSpacesEl.innerText = data.freeSpaces;
    // Optional: Add animation class
    freeSpacesEl.classList.add('updated');
    setTimeout(() => freeSpacesEl.classList.remove('updated'), 500);
  }

  if (occupiedSpacesEl) {
    occupiedSpacesEl.innerText = data.occupiedSpaces;
    occupiedSpacesEl.classList.add('updated');
    setTimeout(() => occupiedSpacesEl.classList.remove('updated'), 500);
  }

  if (probabilityEl) {
    probabilityEl.innerText = data.probability + '%';
    probabilityEl.classList.add('updated');
    setTimeout(() => probabilityEl.classList.remove('updated'), 500);
  }

  // Optional: Update total spaces if you have that element
  const totalSpacesEl = document.getElementById('total_spaces');
  if (totalSpacesEl && data.totalSpaces !== undefined) {
    totalSpacesEl.innerText = data.totalSpaces;
  }

  // Optional: Update timestamp if you have that element
  const timestampEl = document.getElementById('timestamp');
  if (timestampEl && data.timestamp) {
    timestampEl.innerText = `Last updated: ${data.timestamp}`;
  }
});

// Connection lost
socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
  
  // Optional: Show disconnected state in UI
  const statusEl = document.getElementById('connection_status');
  if (statusEl) {
    statusEl.innerText = 'Disconnected';
    statusEl.className = 'status-disconnected';
  }
});

// Reconnection
socket.on('reconnect', (attemptNumber) => {
  console.log(`✅ Reconnected after ${attemptNumber} attempts`);
  
  const statusEl = document.getElementById('connection_status');
  if (statusEl) {
    statusEl.innerText = 'Connected';
    statusEl.className = 'status-connected';
  }
  
  // Request fresh data after reconnection
  socket.emit('request_parking_data');
});

// Error handling
socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});