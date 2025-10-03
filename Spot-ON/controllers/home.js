// models
const Space = require("../models/spaces.js");

// ================= Home Route ===========
module.exports.home = async(req,res) => {
    // fetch only spaces at first to display on homepage
    let onlySpaces = await Space.find({type: {$in: ["mall", "workspace"]}});
    res.render("home.ejs", {onlySpaces, googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY});
};


// this route is fetched by public/js/script.js used to showcase the available options 
module.exports.fetchSpaces = async(req,res) => {
    let spaces = await Space.find();
  
    // send the spaces in the JSON format 
    res.json(spaces);
};


// Route to fetch data based on category 
module.exports.fetchCategory = async(req,res) => {
    try {
      // the type parameter in the query is returned
      let typeOfLocation = req.query.type;
  
      // ensure that typeOfLocation is always an array
      if(typeof typeOfLocation === "string"){
        // then convert it into array
        typeOfLocation = [typeOfLocation];
      }
      
      // we call the places returned as a variable space in general
      let space = await Space.find({type: {$in: typeOfLocation}});
    
      // we return the response to the fetch() function as json
      res.json(space);
      // in categories.js it is stored in data
    
    } catch (error) {
      // check for errors
      res.status(500).json({ error: "Error fetching data" });
    }
};