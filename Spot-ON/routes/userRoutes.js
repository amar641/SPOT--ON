let express = require ("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const userController = require("../controllers/users.js");

const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


// ===================== Route "/signup" =========================
router
    .route("/signup")
    // Signup route
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signupUser));


// ===================== Route "/login" =========================    
router
    .route("/login")
    // Login route
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, passport.authenticate(
        'local',
        {
            failureRedirect: '/login',
            failureFlash: true
        }),
        userController.loginUser
    );

    // saveRedirectUrl: redirects to previous page
    // middleware.js => userRoutes.js => userController => redirect

    // passport.authenticate handles our entire authentication by 'local' strategy
    // and in case of failure in redirects and passes a flash message by itself


// ==================== Logout route ====================
router.get("/logout", userController.logoutUser);


// ==================== User Profile =====================
router.get("/profile/:id", wrapAsync(userController.showProfile));


// ====================== Privacy policy =====================
router.get("/privacy", (req,res) => {
    res.render("privacyPolicy");
});


module.exports = router;