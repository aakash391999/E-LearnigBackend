// tokenBlacklist.js
const tokenBlacklist = new Set(); // In-memory store for blacklisted tokens

module.exports = {
  add: (token) => {
    tokenBlacklist.add(token);
  },
  isBlacklisted: (token) => {
    return tokenBlacklist.has(token);
  },
};
