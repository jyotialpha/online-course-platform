const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // console.log('Auth middleware: Checking authentication...');
  // console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  
  // Check for Bearer token in Authorization header first, then cookie
  const authHeader = req.headers.authorization;
  const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const token = bearer || req.cookies?.jwt;
  
  // console.log('Auth middleware: Token found:', !!token);
  // console.log('Auth middleware: Headers:', req.headers);
  
  if (!token) {
    // console.log('Auth middleware: No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // console.log('Auth middleware: Invalid token:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    // console.log('Auth middleware: User authenticated:', user);
    req.user = user;
    next();
  });
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    // console.log('RestrictTo middleware: Checking roles:', roles);
    // console.log('RestrictTo middleware: User role:', req.user?.role);
    if (!roles.includes(req.user.role)) {
      // console.log('RestrictTo middleware: Access denied for role:', req.user?.role);
      return res.status(403).json({ message: 'Access denied' });
    }
    // console.log('RestrictTo middleware: Access granted for role:', req.user?.role);
    next();
  };
};

module.exports = { authenticateToken, restrictTo };