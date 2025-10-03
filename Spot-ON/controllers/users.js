const User = require("../models/user.js");

// =================== Signup route ==============
module.exports.renderSignupForm = (req,res) => {
    res.render("signupForm.ejs");
};

module.exports.signupUser = async(req,res) => {
    try {
        let { email, username, password } = req.body;
        const newUser = new User({email, username});
    
        // User.register verifies is username is unique
        // the password is passed only here and then is hashed, salted and stored
        const registeredUser = await User.register(newUser, password);

        // automatic login after signup
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "Welcome to Cozy Clouds");
            res.redirect("/");
        });
        console.log(registeredUser);
        
    } catch (error) {
        console.log(error)
        req.flash("error", error.message);
        res.redirect("/signup");
    }
};


// =================== Login route ==============
module.exports.renderLoginForm = (req,res) => {
    res.render("loginForm.ejs");
};

module.exports.loginUser = async(req,res) => {
    req.flash('success', "Welcome back");

    // save the previous page
    let redirectUrl = res.locals.redirectUrl || '/';
    res.redirect(redirectUrl);
};


// =================== Logout route ==============
module.exports.logoutUser = (req,res,next) => {
    // req.logOut is a passport method to logout which utilizes serialize and deserialize user
    req.logOut((err) => {
        if(err){
            return next(err);
        }
    });
    
    req.flash("success", "You have successfully logged out");
    res.redirect('/');
};


// =================== Profile route ================
module.exports.showProfile = async(req,res,next) => {
    let { id } = req.params;

    let user = await User.findById(id);
    console.log(user);

    res.render("profile.ejs", { user });
};