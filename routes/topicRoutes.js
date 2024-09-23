const express = require("express");
const router = express.Router();
const Topic = require("../models/topic");
const Lesson = require("../models/lesson");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const path = require("path");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending the extension
  },
});

const upload = multer({ storage: storage });

/**
 * @openapi
 * /api/admin/topics:
 *   post:
 *     summary: Add a new topic (admin only)
 *     tags:
 *       - Topics
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
 *               description:
 *                 type: string
 *               lessonId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Topic created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/admin/topics",
  authenticateToken,
  authorizeRoles("admin"),
  upload.single("image"), // Ensure the upload middleware is used
  async (req, res) => {
    try {
      const { title, description, lessonId } = req.body;
      const image = req.file ? req.file.path : null; // Get the image path

      // Create a new topic
      const topic = new Topic({ title, description, lessonId, image });
      await topic.save();

      // Find the lesson and add the topic to its topics array
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        console.log("Lesson not found:", lessonId); // Logging for debugging
        return res.status(404).json({ error: "Lesson not found" });
      }
      lesson.topics.push(topic._id);
      await lesson.save();
      res.status(201).json(topic);
    } catch (error) {
      console.error("Error creating topic:", error); // Add logging
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @openapi
 * /api/topics:
 *   get:
 *     summary: List all topics (admin and users)
 *     tags:
 *       - Topics
 *     responses:
 *       200:
 *         description: A list of topics
 */
router.get("/topics", authenticateToken, async (req, res) => {
  try {
    const topics = await Topic.find();
    res.status(200).json(topics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/topics/{id}:
 *   get:
 *     summary: Get a topic by ID (admin and users)
 *     tags:
 *       - Topics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Topic found successfully
 *       404:
 *         description: Topic not found
 */
router.get("/topics/:id", authenticateToken, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.status(200).json(topic);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @openapi
 * /api/admin/topics/{id}:
 *   put:
 *     summary: Update a topic with an optional image (admin only)
 *     tags:
 *       - Topics
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
 *               lessonId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Topic updated successfully
 */
router.put(
  "/admin/topics/:id",
  authenticateToken,
  authorizeRoles("admin"),
  upload.single("image"), // Use multer for single file upload
  async (req, res) => {
    try {
      const { title, description, lessonId } = req.body;
      const image = req.file ? req.file.path : null;

      const updatedData = { title, description, lessonId };
      if (image) {
        updatedData.image = image; // Include the image if there's a new upload
      }

      const topic = await Topic.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
      });

      if (!topic) return res.status(404).json({ error: "Topic not found" });
      res.status(200).json(topic);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * @openapi
 * /api/admin/topics/{id}:
 *   delete:
 *     summary: Delete a topic (admin only)
 *     tags:
 *       - Topics
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
 *         description: Topic deleted successfully
 *       404:
 *         description: Topic not found
 */
router.delete(
  "/admin/topics/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const topic = await Topic.findByIdAndDelete(req.params.id);
      if (!topic) return res.status(404).json({ error: "Topic not found" });

      // Optionally, remove the topic from the lesson as well
      const lesson = await Lesson.findById(topic.lessonId);
      if (lesson) {
        lesson.topics.pull(topic._id);
        await lesson.save();
      }

      res.status(200).json({ message: "Topic deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
