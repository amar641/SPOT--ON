// Connect to WebSocket
const socket = io();

// Listen for 'parkingData' event
socket.on('parkingData', (data) => {
  console.log('Received data:', data);

  // Update UI dynamically
  document.getElementById('free-spaces').innerText = data.freeSpaces;
  document.getElementById('occupied-spaces').innerText = data.occupiedSpaces;
  document.getElementById('probability').innerText = data.probability;
});


// Amaresh web socket
const socketAmaresh = io("http://192.168.124.131:5000"); // Replace with your Flask server IP

    socketAmaresh.on("parking_update", (data) => {
        document.getElementById("totalSpaces").innerText = `Total Spaces: ${data.total_spaces}`;
        document.getElementById("freeSpaces").innerText = `Free Spaces: ${data.free_spaces}`;
        document.getElementById("occupiedSpaces").innerText =`Occupied Spaces: ${data.occupied_spaces}`;
        document.getElementById("probability").innerText =`Probability: ${data.probability}%`;
    });
