const jwt = require('jsonwebtoken');
const User = require('../models/User');
const tokenBlacklist = require('../utils/tokenBlacklist'); // Import your blacklist utility

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Check if the token is blacklisted
  if (tokenBlacklist.isBlacklisted(token)) {
    return res.status(403).json({ message: 'Token is blacklisted. Please log in again.' });
  }

  try {
    const userPayload = jwt.verify(token, process.env.JWT_SECRET);
    const dbUser = await User.findById(userPayload.id);
    if (!dbUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    req.user = dbUser; // Attach the user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(403).json({ message: 'Invalid token.' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next(); // Proceed if the user has the right role
  };
};

module.exports = { authenticateToken, authorizeRoles };
