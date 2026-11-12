import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access denied: Empty Bearer token provided.'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'needbridge_jwt_super_secret_development_key_2026!'
        );
      } catch (jwtErr) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: Invalid or expired token.',
          error: jwtErr.message
        });
      }

      const userResult = await query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'The user belonging to this token no longer exists.'
        });
      }

      req.user = userResult.rows[0];
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid authentication state.',
        error: error.message
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided in Bearer header.'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user?.role || 'unauthenticated'}' is not authorized to access this resource. Required: [${roles.join(', ')}]`
      });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'needbridge_jwt_super_secret_development_key_2026!'
      );
      const userResult = await query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [decoded.id]
      );
      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
      }
    } catch (e) {
      // Continue without user
    }
  }
  next();
};

