import jwt from "jsonwebtoken";

export const SECRET = process.env.JWT_SECRET || "mediconnect-demo-secret-change-me";

// Checks the token sent by the website and finds out who is logged in
export function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Please log in first." });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    res.status(401).json({ message: "Your session has ended. Please log in again." });
  }
}

// Only lets the listed roles through
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "You are not allowed to do this." });
    next();
  };
}
