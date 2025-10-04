// pythonWebSocketBridge.js
// Bridge between Python Flask WebSocket server and Node.js

const ioClient = require('socket.io-client');

class PythonWebSocketBridge {
  constructor(config = {}) {
    this.pythonServerUrl = config.pythonServerUrl || 'http://localhost:8080';
    this.maxReconnectAttempts = config.maxReconnectAttempts || 10;
    this.reconnectionDelay = config.reconnectionDelay || 2000;
    this.requestDataInterval = config.requestDataInterval || 2000;
    
    this.pythonSocket = null;
    this.reconnectAttempts = 0;
    this.io = null; // Socket.io server instance (for broadcasting to frontend)
    this.intervalId = null;
  }

  /**
   * Initialize the bridge with Socket.io server instance
   * @param {Object} io - Socket.io server instance
   */
  initialize(io) {
    this.io = io;
    console.log('🔧 Python WebSocket Bridge initialized');
    return this;
  }

  /**
   * Connect to Python Flask WebSocket server
   */
  connect() {
    console.log('\n🔌 Attempting to connect to Python Flask server...');
    console.log(`📍 Target: ${this.pythonServerUrl}`);
    
    this.pythonSocket = ioClient(this.pythonServerUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: this.reconnectionDelay,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this._setupEventHandlers();
    this._startPeriodicDataRequest();
    
    return this;
  }

  /**
   * Setup all event handlers for Python WebSocket
   */
  _setupEventHandlers() {
    // Connection successful
    this.pythonSocket.on('connect', () => {
      console.log('✅ Connected to Python Flask WebSocket server');
      console.log(`📡 Receiving live parking data from ${this.pythonServerUrl}`);
      this.reconnectAttempts = 0;
    });

    // Receive parking updates from Python
    this.pythonSocket.on('parking_update', (data) => {
      this._handleParkingUpdate(data);
    });

    // Connection error
    this.pythonSocket.on('connect_error', (error) => {
      this._handleConnectionError(error);
    });

    // Disconnection
    this.pythonSocket.on('disconnect', (reason) => {
      this._handleDisconnection(reason);
    });

    // Reconnection attempt
    this.pythonSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}...`);
    });

    // Successfully reconnected
    this.pythonSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
    });
  }

  /**
   * Handle incoming parking data from Python
   */
  _handleParkingUpdate(data) {
    console.log('📊 Received parking data from Python:', {
      free: data.free_spaces,
      occupied: data.occupied_spaces,
      probability: data.probability
    });

    // Transform data to match frontend format (snake_case to camelCase)
    const parkingData = this._transformData(data);

    // Broadcast to all connected frontend clients
    if (this.io) {
      this.io.emit('parkingData', parkingData);
      console.log('📤 Broadcasted to frontend clients');
    }
  }

  /**
   * Transform Python data format to frontend format
   */
  _transformData(data) {
    return {
      freeSpaces: data.free_spaces,
      occupiedSpaces: data.occupied_spaces,
      probability: data.probability,
      totalSpaces: data.total_spaces,
      timestamp: data.timestamp
    };
  }

  /**
   * Handle connection errors
   */
  _handleConnectionError(error) {
    this.reconnectAttempts++;
    console.error(
      `❌ Connection error (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`,
      error.message
    );
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('\n❌ Max reconnection attempts reached. Please ensure:');
      console.error('   1. Python app.py is running');
      console.error('   2. Python server is accessible at', this.pythonServerUrl);
      console.error('   3. flask-socketio is installed (pip install flask-socketio)');
    }
  }

  /**
   * Handle disconnection from Python server
   */
  _handleDisconnection(reason) {
    console.log('❌ Disconnected from Python server:', reason);
    
    if (reason === 'io server disconnect') {
      // Server initiated disconnect, try to reconnect
      console.log('🔄 Server initiated disconnect, attempting to reconnect...');
      this.pythonSocket.connect();
    }
  }

  /**
   * Start periodic data requests as backup mechanism
   */
  _startPeriodicDataRequest() {
    this.intervalId = setInterval(() => {
      if (this.pythonSocket && this.pythonSocket.connected) {
        this.pythonSocket.emit('request_data');
      }
    }, this.requestDataInterval);
  }

  /**
   * Request data manually from Python server
   */
  requestData() {
    if (this.pythonSocket && this.pythonSocket.connected) {
      this.pythonSocket.emit('request_data');
      return true;
    }
    return false;
  }

  /**
   * Check if connected to Python server
   */
  isConnected() {
    return this.pythonSocket && this.pythonSocket.connected;
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      pythonServerUrl: this.pythonServerUrl
    };
  }

  /**
   * Disconnect from Python server and cleanup
   */
  disconnect() {
    console.log('🔌 Disconnecting from Python server...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.pythonSocket) {
      this.pythonSocket.disconnect();
      this.pythonSocket = null;
    }

    console.log('✅ Disconnected and cleaned up');
  }
}

module.exports = PythonWebSocketBridge;