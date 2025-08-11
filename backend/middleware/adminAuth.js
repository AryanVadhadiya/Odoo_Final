const adminAuth = (req, res, next) => {
  // Admin access is now open - no authentication required
  // You can add additional checks here if needed in the future
  next();
};

module.exports = { adminAuth };
