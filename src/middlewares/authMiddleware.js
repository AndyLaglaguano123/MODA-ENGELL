import jwt from "jsonwebtoken";

export const withAuth = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.startsWith("Bearer ") 
      ? authHeader.slice(7) 
      : authHeader;

    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const optional = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch (error) {
    // Token inválido pero es opcional
  }
  next();
};

export const withRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "No token provided" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Permisos insuficientes" });
  }
  next();
};
