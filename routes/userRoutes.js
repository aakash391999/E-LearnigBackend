const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

/**
 * @openapi
 * /api/signup:
 *   post:
 *     summary: Signup a new user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 description: The email of the user
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 description: The password for the user
 *                 format: password
 *                 example: strongPassword123
 *               role:
 *                 type: string
 *                 description: Role of the user (either 'user' or 'admin')
 *                 enum: [user, admin]
 *                 example: user
 *               profilePhoto:
 *                 type: string
 *                 description: URL for the user's profile photo (optional)
 *                 example: https://example.com/profile.jpg
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number of the user (optional)
 *                 example: +1234567890
 *               courses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of course names or IDs (optional)
 *                 example: ["course1", "course2"]
 *               knowledge:
 *                 type: string
 *                 description: Additional knowledge of the user (optional)
 *                 example: Web development, React, Node.js
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 12345
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *                     profilePhoto:
 *                       type: string
 *                       example: https://example.com/profile.jpg
 *                     phoneNumber:
 *                       type: string
 *                       example: +1234567890
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["course1", "course2"]
 *                     knowledge:
 *                       type: string
 *                       example: Web development, React, Node.js
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email or password
 */
router.post("/signup", userController.signup);


/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Login an existing user
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password for the user
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 */
router.post("/login", userController.login);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  userController.getAllUsers
);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password for the user
 *     responses:
 *       201:
 *         description: User created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  userController.createUser
);

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Get the profile of the authenticated user
 *     tags:
 *       - Users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */



const tokenBlacklist = [];

/**
 * @openapi
 * /api/logout:
 *   post:
 *     summary: Logout a user (invalidate the token)
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Token required
 *       403:
 *         description: Token has been blacklisted
 */
router.post("/logout", authenticateToken, (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (token) {
    tokenBlacklist.push(token); // Add token to blacklist
    return res.status(200).json({ message: "Logout successful" });
  }
  return res.status(400).json({ message: "Token required" });
});


router.get("/profile", authenticateToken, (req, res) => {
  console.log("Profile route accessed");
  console.log("Authenticated user:", req.user);

  res.json(req.user); // Respond with the user's data
});

module.exports = router;
