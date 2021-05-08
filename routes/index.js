const express = require("express");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();

//root route
router.get("/", function (req, res) {
  res.render("landing");
});

// show register form
router.get("/register", function (req, res) {
  res.render("register");
});

//handle sign up logic
router.post("/register", function (req, res) {
  console.log(req.body);
  const newUser = new User({
    username: req.body.username,
    name: req.body.username,
    email: req.body.email,
  });
  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("register");
    }
    passport.authenticate("local")(req, res, function () {
      req.flash("success", "Welcome to Image Bay " + user.username);
      res.redirect("/images");
    });
  });
});

//show login form
router.get("/login", function (req, res) {
  res.render("login");
});

//handling login logic
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/images",
    successFlash: "Successfully logged in!",
    failureRedirect: "/login",
    failureFlash: "Failed to login. Invalid credentials."
  }),
  function (req, res) {}
);

// logout route
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/");
});

module.exports = router;
