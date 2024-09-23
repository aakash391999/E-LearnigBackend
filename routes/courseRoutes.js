const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Upload folder for course images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with unique name
  },
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

/**
 * @openapi
 * /api/admin/courses:
 *   post:
 *     summary: Add a new course (admin only)
 *     tags:
 *       - Courses
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the course
 *               description:
 *                 type: string
 *                 description: A brief description of the course
 *               instructor:
 *                 type: string
 *                 description: The name of the instructor
 *               price:
 *                 type: number
 *                 description: The price of the course
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The course image
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/admin/courses",
  authenticateToken,
  authorizeRoles("admin"),
  upload.single("image"), // Add multer middleware for single file upload
  async (req, res) => {
    try {
      const { title, description, instructor, price } = req.body;
      const courseData = {
        title,
        description,
        instructor,
        price,
        image: req.file ? req.file.path : null, // Save image path
      };

      const newCourse = new Course(courseData);
      await newCourse.save();
      res.status(201).json(newCourse);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.post(
  "/admin/courses",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const newCourse = new Course(req.body);
      await newCourse.save();
      res.status(201).json(newCourse);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @openapi
 * /api/admin/courses/{id}:
 *   delete:
 *     summary: Delete a course (admin only)
 *     tags:
 *       - Courses
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.delete(
  "/admin/courses/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const course = await Course.findByIdAndDelete(req.params.id);
      if (!course) return res.status(404).json({ error: "Course not found" });
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @openapi
 * /api/courses:
 *   get:
 *     summary: List all courses
 *     tags:
 *       - Courses
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of courses
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/courses", authenticateToken, async (req, res) => {
  try {
    let courses;
    if (req.user.role === "admin") {
      courses = await Course.find(); // Admin gets all course data
    } else {
      courses = await Course.find({}, "title description"); // Users get limited course data
    }
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/courses/{id}:
 *   get:
 *     summary: courcse by id
 *     tags:
 *       - Courses
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: courses found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/courses/:id", authenticateToken, async (req, res) => {
  try {
    let courses;
    courses = await Course.findById(req.params.id);
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/admin/courses/{id}:
 *   put:
 *     summary: Update a course (admin only)
 *     tags:
 *       - Courses
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               instructor:
 *                 type: string
 *               price:
 *                 type: number
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The course image (optional)
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
router.put(
  "/admin/courses/:id",
  authenticateToken,
  authorizeRoles("admin"),
  upload.single("image"), // Add multer middleware to handle image upload
  async (req, res) => {
    try {
      const { title, description, instructor, price } = req.body;

      // Build the update object
      const updateData = {
        title,
        description,
        instructor,
        price,
      };

      // If a new image is uploaded, add the image path to the update object
      if (req.file) {
        updateData.image = req.file.path;
      }

      // Find the course and update it with new data
      const course = await Course.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.status(200).json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
