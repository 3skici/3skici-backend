const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  // Check if there's an Authorization header and if it starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Extract the token from the header (after 'Bearer ')
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check the decoded payload to make sure the structure is correct

    // If the payload has a "user" field, attach it to the request object
    if (decoded.user) {
      req.user = decoded.user;
    } else {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    next();
  } catch (err) {
    console.error('Authentication Error:', err);
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = isAuthenticated;
