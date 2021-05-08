var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");
const path = require("path");
const multer = require("multer");
const multers3 = require("multer-s3");
const config = require("config");
const S3 = require("aws-sdk/clients/s3");
const { uploadFile } = require("../s3");

const s3 = new S3(config.get("awsS3"));

const User = require("../models/user");

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const uploadImage = multer({
  storage: storage,
}).single("image");

// const uploadImage2 = multer({
//   storage: multers3({
//     s3: s3,
//     bucket: bucketName,
//     key: function (req, file, cb) {
//       cb(null, file.fieldname + "-" + Date.now() + file.originalname);
//     },
//   }),
// }).single("image");

const upload = multer();

//INDEX - show all campgrounds
router.get("/", middleware.isLoggedIn, function (req, res) {
  // Get all campgrounds from DB
  Campground.find(
    { "author.id": req.user._id },
    function (err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/campgrounds", { campgrounds: allCampgrounds });
      }
    }
  );
});

//CREATE - add new campground to DB
router.post(
  "/",
  [middleware.isLoggedIn, uploadImage],
  async function (req, res) {
    // get data from form and add to campgrounds array
    // upload image to s3

    const s3Config = config.get("awsS3");
    const s3Bucket = config.get("s3Bucket");

    console.log("S3 config is: ");
    console.log(s3Config);
    console.log(s3Bucket);

    const userID = req.user._id;
    const result = await uploadFile(req.file);
    const imageKey = result.Key;
    const imageUrl = result.Location;

    console.log("FILE IS");

    const imageObj = {
      url: imageUrl,
      key: imageKey,
    };

    // find user and update images
    User.findOne({ _id: userID }, (error, response) => {
      if (error) res.status(400).redirect("/campgrounds");
      else {
        // create object
        var name = req.body.name;
        var image = imageUrl;
        var desc = req.body.description;
        var author = {
          id: req.user._id,
          username: req.user.username,
        };
        var price = req.body.price;
        var newCampground = {
          name: name,
          image: image,
          description: desc,
          author: author,
          price: price,
        };

        // Create a new campground and save to DB
        Campground.create(newCampground, function (err, newlyCreated) {
          if (err) {
            console.log(err);
          } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
          }
        });
      }
    });
  }
);

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
  //find the campground with provided ID
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundCampground);
        //render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});

//Edit route
router.get(
  "/:id/edit",
  middleware.checkCampgroundOwnership,
  function (req, res) {
    //Check if user is logged in
    Campground.findById(req.params.id, function (err, foundCampground) {
      console.log(foundCampground);
      res.render("campgrounds/edit", { campground: foundCampground });
    });
  }
);

//Update Route
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  //Find and update the correct campground
  Campground.findByIdAndUpdate(
    req.params.id,
    req.body.campground,
    function (err, foundCampground) {
      if (err) res.redirect("/campgrounds");
      else {
        res.redirect("/campgrounds/" + req.params.id);
      }
    }
  );
  //
});

//Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findByIdAndRemove(req.params.id, function (err) {
    if (err) res.redirect("/campgrounds");
    else res.redirect("/campgrounds");
  });
});

module.exports = router;
