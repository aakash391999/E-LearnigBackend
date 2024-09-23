const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String }, // New field to store the image path
});

module.exports = mongoose.model("Course", courseSchema);
