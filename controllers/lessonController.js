// controllers/lessonController.js

const Lesson = require("../models/lesson");

exports.createLesson = async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.status(200).json(lessons);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.status(200).json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.getLessonsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId });

    if (!lessons.length) {
      return res
        .status(404)
        .json({ error: "No lessons found for this course" });
    }

    res.status(200).json(lessons);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
