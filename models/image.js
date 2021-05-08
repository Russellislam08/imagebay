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
  price: Number,
});

module.exports = mongoose.model("image", imageSchema);
