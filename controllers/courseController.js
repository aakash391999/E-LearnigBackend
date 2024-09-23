const Course = require("../models/course");

// Controller to create a new course
exports.createCourse = async (req, res) => {
  const { title, description, author, price, category } = req.body;
  try {
    const course = new Course({ title, description, author, price, category });
    const newCourse = await course.save();
    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller to list all courses
exports.listCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
