// ================ BASIC SETUP =================
if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

let express = require ("express");
const app = express();
// method-override
const methodOverride = require ("method-override");
const path = require("path");

// error class
const ExpressError = require("./utils/ExpressError.js");

// Routes
const homeRoutes =  require("./routes/homeRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const spacesRoutes = require("./routes/spacesRoutes.js")

// ejs-mate
const ejsMate = require ("ejs-mate");

// sessions
const session = require("express-session");

// Mongo sessions store
const MongoStore = require("connect-mongo");

// flash
const flash = require("connect-flash");

// passport
const passport = require("passport");
const LocalStrategy = require("passport-local");

// users database
const User = require('./models/user.js');


// mongoose
const mongoose = require('mongoose');

// Mongo Atlas URL
const dbURL = process.env.MONGO_ATLAS_URL

// mongoDB setup
async function main() {
    try {
      await mongoose.connect(dbURL);

      console.log("connection successful");

    } catch (err) {
      console.error("Error connecting to the database:", err);
    };
};
// call the main function
main();


// ====================== Web Socket ====================
// Setup for creating a socket between the server and webpage
const http = require('http');

// Create HTTP server with Express app
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);
const WebSocket = require('ws');

// Our Python process
const startPythonProcess = require("./pythonProcess.js")

// ======================= Sessions ==========================
// Mongo Sessions Store
const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto:{
    secret: process.env.SESSION_SECRET
  },
  touchAfter:24*3600,
});

store.on("error", () => {
  console.log("Error in MONGO SESSIONS STORE", err);
});


const sessionOptions = {
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true
  },
}
app.use(session(sessionOptions));


// ================== passport middlewares =================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================== flash middlewares ====================
app.use(flash());
app.use((req,res,next) => {
  // these are fetched in flash.ejs
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  res.locals.currUser = req.user;
  next();
});

// =================== Request middlewares ==================
app.use(methodOverride("_method"));

app.use(express.urlencoded({extended : true}));

app.set("view engine", "ejs");

app.engine("ejs", ejsMate);

app.set("views", path.join(__dirname, "views/pages"));

app.set(express.static(path.join(__dirname, "public")));

app.use('/static', express.static('public'));


// ==========================================================


// ===================== Python Script ======================
// Run python
startPythonProcess(io);


// ================== WebSocket connection ==================
io.on('connection', (socket) => {
  console.log('Client connected via WebSocket');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});



// ================= Routes ==================
// Home page Routes
app.use("/", homeRoutes);

// User Routes
app.use("/", userRoutes);

// Spaces Routes
app.use("/", spacesRoutes);


// ================== Undefined Route ===================
app.all("*", (req, res) => {
  throw new ExpressError(404,'Page not found');
});


// ================ Error handling middlewares ================
app.use((err,req,res,next)=>{
  // give default values to status and message
  let {statusCode = 500, message = "An Unknown error seems to have been occurred", name} = err;
  
  console.log(err.stack);
  res.status(statusCode).render("error.ejs", {statusCode, message, name})
});


// ======================= Port ========================
const port = 8080;
server.listen(port, () => {
    console.log("App is listening on port : 8080")
});
