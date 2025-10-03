const { spawn } = require('child_process');

// Run the Python script
const pythonProcess = spawn(
  '/Users/aryan/Spot on project /.venv/bin/python3',
  ['-u', '/Users/aryan/Spot on project /Spot-ON/python/carParking.py']
);

let lastPrintedTime = Date.now(); // Track last print time 

// Capture standard output (data sent from Python)
pythonProcess.stdout.on('data', (data) => {
  const currentTime = Date.now();

  // Print only after 10 seconds
  if (currentTime - lastPrintedTime >= 5000) {
    const output = data.toString().trim(); // Clean data
    const [freeSpaces, occupiedSpaces] = output.split(','); // Split CSV

    console.log(`Free Spaces: ${freeSpaces}, Occupied Spaces: ${occupiedSpaces}`);
    lastPrintedTime = currentTime; // Update print time
  }
});

// Listen for any errors
pythonProcess.stderr.on('data', (data) => {
  console.error(`Error: ${data.toString().trim()}`);
});

// Detect when the Python script closes
pythonProcess.on('close', (code) => {
  console.log(`Python script exited with code ${code}`);
});

// Handle script start errors
pythonProcess.on('error', (err) => {
  console.error(`Failed to start Python script: ${err.message}`);
});
