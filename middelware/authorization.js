const jwt=require('jsonwebtoken')

exports.authenticateJWT = (req, res, next) => {
  
  const token = req.header('Authorization')?.split(' ')[1];  // Get token from header
    
    if (!token) return res.status(403).send('Access denied. No token provided.');
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Save decoded payload to request object
      next();
    } catch (err) {
      console.log(err,'err');
      res.status(401).send('Invalid token');
    }
  };