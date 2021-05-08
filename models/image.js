var mongoose = require("mongoose");

var imageSchema = new mongoose.Schema({
  name: String,
  image: String,
  imageKey: String,
  description: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
  price: {
    type: Number,
    default: 0,
  },
  forSale: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("image", imageSchema);
