require('dotenv').config();

const mongoose = require("mongoose");
const initData = require("./allData.js");
const Space = require("../models/spaces.js");

const dbURL = process.env.MONGO_ATLAS_URL
console.log(dbURL);

// mongoDB setup
async function main() {
    try {
      await mongoose.connect(dbURL);

      console.log("connection successful");

      await initDB();

    } catch (err) {
      console.error("Error connecting to the database:", err);
    }
    // close the connection
     finally {
    mongoose.connection.close(); 
    }
};


// the initDB function
const initDB = async() => {
    // delete any previously stored data
    await Space.deleteMany({});

    // insert the data
    // initData is the imported object and .data is the key of it containing all the sampleSpaces 
    await Space.insertMany(initData.data);
    console.log("data was added");
};
  

// call the main function
main();



