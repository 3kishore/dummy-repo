const jwt = require('jsonwebtoken');
require('dotenv').config()
function verifyToken(req, res, next) {
  let jwtSecretKey = process.env.JWT_SECRET_KEY;
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
    try {
      const decoded = jwt.verify(token, jwtSecretKey);
      req.userId = decoded.userId;
        next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
 };

module.exports = verifyToken;
