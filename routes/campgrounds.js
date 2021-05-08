var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

const path = require("path");
const multer = require("multer");
const multers3 = require("multer-s3");
const config = require("config");
const fs = require("fs");
const util = require("util");
const S3 = require("aws-sdk/clients/s3");
const { uploadFile, deleteFile } = require("../s3");

const s3 = new S3(config.get("awsS3"));
const unlinkFile = util.promisify(fs.unlink);

const User = require("../models/user");

const storage = multer.diskStorage({
  destination: "./",
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
        res.render("image/images", { campgrounds: allCampgrounds });
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

    const userID = req.user._id;
    const result = await uploadFile(req.file);

    const imageKey = result.Key;
    const imageUrl = result.Location;

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
          imageKey: imageKey,
          description: desc,
          author: author,
          price: price,
        };

        // Create a new campground and save to DB
        Campground.create(newCampground, async function (err, newlyCreated) {
          if (err) {
            console.log(err);
            await unlinkFile(req.file.path);
          } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            await unlinkFile(req.file.path);
            res.redirect("/campgrounds");
          }
        });
      }
    });
  }
);

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("image/new");
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
        res.render("image/show", { campground: foundCampground });
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
      res.render("image/edit", { campground: foundCampground });
    });
  }
);

//Update Route
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
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

// Delete image
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
  Campground.findById(req.params.id, async (error, response) => {
    if (error) {
      console.log("ERROR");
      console.log(error);
      res.redirect("/campgrounds");
    } else {
      console.log("ELSE HAPPEND, AND RESULT IS: ");
      console.log(response);

      const result = await deleteFile(response.imageKey);

      Campground.deleteOne({ _id: req.params.id }, (err) => {
        if (err) res.redirect("/campgrounds");
        else res.redirect("/campgrounds");
      });
    }
  });
});

module.exports = router;
