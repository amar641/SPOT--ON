// using child-process we run external commands and files
const { spawn } = require('child_process');


function startPythonProcess(io){
    // first is the path to the selected virtual environment in VSCode
    // second is the path to the python file which needs to run
    const pythonProcess = spawn(
        '/Users/aryan/Spot on project /.venv/bin/python3',
        ['-u', '/Users/aryan/Spot on project /Spot-ON/carParking.py']
    );
      
    // Track last print time
    let lastPrintedTime = Date.now();  
      
    // Capture standard output (data sent from Python)
    pythonProcess.stdout.on('data', (data) => {
        const currentTime = Date.now();
      
        // Print only after 10 seconds
        if (currentTime - lastPrintedTime >= 5000) {
      
          // Clean data
          const output = data.toString().trim(); 
      
          // Split the values that are generated
          const [freeSpaces, occupiedSpaces] = output.split(','); 
      
          console.log(`Free Spaces: ${freeSpaces}, Occupied Spaces: ${occupiedSpaces}`);

          let probability = 50;
      
          // Send data to front-end i.e. home.ejs
          io.emit("parkingData", {
            freeSpaces: parseInt(freeSpaces),
            occupiedSpaces: parseInt(occupiedSpaces),
            probability: parseInt(probability),
          });
      
          // Update print time
          lastPrintedTime = currentTime; 
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
};

module.exports = startPythonProcess;


  
  // ==========================================================
  