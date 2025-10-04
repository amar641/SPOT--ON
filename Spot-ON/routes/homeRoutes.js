let express = require ("express");
const router = express.Router();
// require wrapAsync
const wrapAsync = require("../utils/wrapAsync.js");
// controller
const homeRoutesController = require("../controllers/home.js")
// models
const Space = require("../models/spaces.js");



// ================= Home page =================
router.get("/", wrapAsync(homeRoutesController.home));
  

// this route is fetched by public/js/script.js used to showcase the available options 
router.get("/searchSpaces",wrapAsync(homeRoutesController.fetchSpaces));
  
  
// ================ Route to fetch data based on category ========
router.get("/getData", wrapAsync(homeRoutesController.fetchCategory)); 



module.exports = router;