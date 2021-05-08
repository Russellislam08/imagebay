var express = require("express");
var router = express.Router();
var Image = require("../models/image");
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

//INDEX - show all images

router.get("/market", middleware.isLoggedIn, (req, res) => {
  Image.find({}, function (err, allImages) {
    if (err) {
      console.log(err);
    } else {
      res.render("image/market", { images: allImages });
    }
  });
})

router.post("/buy/:id", middleware.isLoggedIn, (req, res) => {
  // get current user
  // check if they have balance
  const userID = req.user._id;
  User.findById(userID, (uError, user) => {
    if (uError) res.redirect("/images")

    // find image
    Image.findById(req.params.id, (iError, image) => {
      // check balance
      if (user.balance < image.price) {
        req.flash ("error", "Not enough money for this image.")
        res.redirect("/images/"+req.params.id)

      } else {

        const oldAuthor = image.author.id;
        const newBalance = user.balance - image.price;
        const newAuthor = {id: userID, username: user.username}

        Image.findByIdAndUpdate(image._id, {author: newAuthor, forSale: false}, (err, resp) => {
          if (err) {
            req.flash("error", err)
            res.redirect("/images/")
          } else {
            User.findByIdAndUpdate(userID, {balance: newBalance}, (err2, resp2) => {
              if (err2) {
                req.flash("error", err2)
                res.redirect("/images/")
              } else {

                User.findById(oldAuthor, (err3, oldUser) => {
                  if (err3) {
                    req.flash("error", err3)
                    res.redirect("/images")
                  }
                    const oldUserBalance = oldUser.balance + image.price

                    User.findByIdAndUpdate(oldAuthor, {balance: oldUserBalance}, (err4, res4) => {
                      if (err4) {
                        req.flash("error", err4)
                        res.redirect("/images")
                      }
                      req.flash("success", "Successfully purchased image.")
                      res.redirect("/images")
                    })
                })
              }
            })
          }
        })
      }
    })

  })

})


router.get("/", middleware.isLoggedIn, function (req, res) {
  // Get all images from DB
  Image.find({ "author.id": req.user._id }, function (err, allImages) {
    if (err) {
      console.log(err);
    } else {
      res.render("image/images", { images: allImages });
    }
  });
});

//CREATE - add new image to DB
router.post(
  "/",
  [middleware.isLoggedIn, uploadImage],
  async function (req, res) {
    // get data from form and add to images array
    // upload image to s3

    const userID = req.user._id;
    const result = await uploadFile(req.file);

    const imageKey = result.Key;
    const imageUrl = result.Location;

    // find user and update images
    User.findOne({ _id: userID }, (error, response) => {
      if (error) res.status(400).redirect("/images");
      else {
        // create object
        var name = req.body.name;
        var image = imageUrl;
        var desc = req.body.description;
        var author = {
          id: req.user._id,
          username: req.user.username,
        };
        // var price = req.body.price;
        var newImage = {
          name: name,
          image: image,
          imageKey: imageKey,
          description: desc,
          author: author,
          // price: price,
        };

        // Create a new image and save to DB
        Image.create(newImage, async function (err, newlyCreated) {
          if (err) {
            console.log(err);
            await unlinkFile(req.file.path);
          } else {
            //redirect back to images page
            console.log(newlyCreated);
            await unlinkFile(req.file.path);
            res.redirect("/images");
          }
        });
      }
    });
  }
);

//NEW - show form to create new image
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("image/new");
});

// SHOW - shows more info about one image
router.get("/:id", function (req, res) {
  //find the image with provided ID
  Image.findById(req.params.id)
    .populate("comments")
    .exec(function (err, foundImage) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundImage);
        //render show template with that image
        res.render("image/show", { image: foundImage });
      }
    });
});

//Edit route
router.get("/:id/edit", middleware.checkImageOwnership, function (req, res) {
  //Check if user is logged in
  Image.findById(req.params.id, function (err, foundImage) {
    console.log(foundImage);
    res.render("image/edit", { image: foundImage });
  });
});

//Update Route
router.put("/:id", middleware.checkImageOwnership, function (req, res) {
  Image.findByIdAndUpdate(
    req.params.id,
    req.body.image,
    function (err, foundImage) {
      if (err) res.redirect("/images");
      else {
        res.redirect("/images/" + req.params.id);
      }
    }
  );
  //
});

// Delete image
router.delete("/:id", middleware.checkImageOwnership, function (req, res) {
  Image.findById(req.params.id, async (error, response) => {
    if (error) {
      console.log("ERROR");
      console.log(error);
      res.redirect("/images");
    } else {
      console.log("ELSE HAPPEND, AND RESULT IS: ");
      console.log(response);

      const result = await deleteFile(response.imageKey);

      Image.deleteOne({ _id: req.params.id }, (err) => {
        if (err) res.redirect("/images");
        else res.redirect("/images");
      });
    }
  });
});


router.get("/sell/:id", middleware.checkImageOwnership, (req, res) => {
  Image.findById(req.params.id, (error, foundImage) => {
    res.render("image/sell", { image: foundImage });
  });
});

router.post("/sell/remove/:id", middleware.checkImageOwnership, (req, res) => {

  console.log("THIS ONE HAPPENS")


  Image.findByIdAndUpdate(req.params.id, {"forSale": false}, (error, foundImage) => {
    if (error) res.redirect("/images")
    res.redirect("/images/market")
  })
})

router.post("/sell/:id", middleware.checkImageOwnership, (req, res) => {

  console.log("TRYING TO SELL")
  console.log(req.body)

  let updatedImage = req.body.image;
  updatedImage["forSale"] = true;
  Image.findByIdAndUpdate(
    req.params.id,
    updatedImage,
    (error, foundImage) => {
      if (error) res.redirect("/images");
      else res.redirect("/images");
    }
  );
});


module.exports = router;
