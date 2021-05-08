var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  Image= require("./models/image"),
  Comment = require("./models/comment"),
  User = require("./models/user"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  config = require("config");

//Requiring routes
var imageRoutes = require("./routes/images"),
  commentRoutes = require("./routes/comments"),
  indexRoutes = require("./routes/index");

var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v12";
mongoose
  .connect(config.get("mongoURI"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch(() => console.log("ERROR"));

app.use(bodyParser.urlencoded({ extended: "true" }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: "Secret Token",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/images", imageRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/", indexRoutes);

const port = process.env.PORT || 5000;
const ip = process.env.IP || "localhost";

app.listen(port, ip, function () {
  console.log("Yelpcamp server has started...");
});
