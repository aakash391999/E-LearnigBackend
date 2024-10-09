const User = require("../models/User");
const jwt = require("jsonwebtoken");
const tokenBlacklist = require("../utils/tokenBlacklist"); // Import the blacklist utility

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new user (Admin functionality)
exports.createUser = async (req, res) => {
  const { name, email, password, role, profilePhoto, phoneNumber, courses, knowledge } = req.body;
  const user = new User({ name, email, password, role, profilePhoto, phoneNumber, courses, knowledge });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Signup
exports.signup = async (req, res) => {
  const { name, email, password, role, profilePhoto, phoneNumber, courses, knowledge } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = new User({
      name,
      email,
      password,
      role: role || "user", // Default to 'user'
      profilePhoto,
      phoneNumber,
      courses,
      knowledge
    });
    const newUser = await user.save();

    // Generate JWT token on signup and return it
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    
    // Return the user object and token for immediate login after signup
    res.status(201).json({ 
      message: "User created successfully", 
      user: newUser,
      token, // Include the token for auto-login
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token on login
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ 
      message: "Login successful", 
      token, 
      user 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout
exports.logout = (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from Authorization header
  if (token) {
    tokenBlacklist.add(token); // Add token to blacklist
  }
  res.json({ message: "Logout successful" });
};

// Get Profile
exports.getProfile = (req, res) => {
  res.json(req.user); // Respond with the user's data
};
