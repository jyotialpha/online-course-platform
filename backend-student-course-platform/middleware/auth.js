const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // Check for Bearer token in Authorization header first, then cookie
  const authHeader = req.headers.authorization;
  const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const token = bearer || req.cookies?.jwt;
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticateToken, restrictTo };