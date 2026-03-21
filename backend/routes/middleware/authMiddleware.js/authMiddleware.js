const jwt = require("jsonwebtoken");


// AUTHENTICATION MIDDLEWARE
const protect = (req, res, next) => {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {

    const decoded = jwt.verify(token, "secretkey");

    req.user = decoded;

    next();

  } catch (error) {

    res.status(401).json({ message: "Invalid token" });

  }

};



// ROLE-BASED AUTHORIZATION
const authorizeRoles = (...roles) => {

  return (req, res, next) => {

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    next();

  };

};


module.exports = {
  protect,
  authorizeRoles
};