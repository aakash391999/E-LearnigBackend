const express = require("express");
const router = express.Router();
const Lesson = require("../models/lesson");
const Topic = require("../models/topic");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware"); // Assuming you have these middlewares

/**
 * @openapi
 * /api/lessons:
 *   post:
 *     summary: Create a new lesson (admin only)
 *     tags:
 *       - Lessons
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the lesson
 *               description:
 *                 type: string
 *                 description: A brief description of the lesson
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to which the lesson belongs
 *     responses:
 *       201:
 *         description: Lesson created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/lessons",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const lesson = new Lesson(req.body);
      await lesson.save();
      res.status(201).json(lesson);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @openapi
 * /api/lessons:
 *   get:
 *     summary: List all lessons (accessible by both users and admins)
 *     tags:
 *       - Lessons
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of lessons
 *       401:
 *         description: Unauthorized
 */
router.get("/lessons", authenticateToken, async (req, res) => {
  try {
    const lessons = await Lesson.find();
    res.status(200).json(lessons);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lessons/{id}:
 *   get:
 *     summary: Get a specific lesson by ID (accessible by both users and admins)
 *     tags:
 *       - Lessons
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
 *         description: Lesson found
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.get("/lessons/:id", authenticateToken, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.status(200).json(lesson);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/lessons/{id}:
 *   put:
 *     summary: Update a specific lesson by ID (admin only)
 *     tags:
 *       - Lessons
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the lesson
 *               description:
 *                 type: string
 *                 description: A brief description of the lesson
 *               courseId:
 *                 type: string
 *                 description: The ID of the course to which the lesson belongs
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 */
router.put(
  "/lessons/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });
      res.status(200).json(lesson);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @openapi
 * /api/lessons/{id}:
 *   delete:
 *     summary: Delete a specific lesson by ID (admin only)
 *     tags:
 *       - Lessons
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
 *         description: Lesson deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 */
router.delete(
  "/lessons/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const lesson = await Lesson.findByIdAndDelete(req.params.id);
      if (!lesson) return res.status(404).json({ error: "Lesson not found" });

      // Optionally, delete associated topics
      await Topic.deleteMany({ _id: { $in: lesson.topics } });

      res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @openapi
 * /api/lessons/{id}/topics:
 *   get:
 *     summary: Get all topics for a specific lesson (accessible by both users and admins)
 *     tags:
 *       - Lessons
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
 *         description: A list of topics for the specified lesson
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Lesson not found
 */
router.get("/lessons/:id/topics", authenticateToken, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("topics");
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });
    res.status(200).json(lesson.topics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

/**
 * @openapi
 * /api/lessons/course/{courseId}:
 *   get:
 *     summary: Get all lessons for a specific course by courseId
 *     tags:
 *       - Lessons
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course to which the lessons belong
 *     responses:
 *       200:
 *         description: A list of lessons for the specified course
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course or lessons not found
 */
router.get("/lessons/course/:courseId", authenticateToken, async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId });
    if (!lessons.length)
      return res
        .status(404)
        .json({ error: "No lessons found for this course" });
    res.status(200).json(lessons);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
