const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Topic" }],
  content: { type: String}, 
});

module.exports = mongoose.model("Lesson", lessonSchema);
