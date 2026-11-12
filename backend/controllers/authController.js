import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { query } from '../config/db.js';

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'needbridge_jwt_super_secret_development_key_2026!',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { name, email, password, role = 'beneficiary' } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const insertResult = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name.trim(), normalizedEmail, hashedPassword, role]
    );

    const newUser = insertResult.rows[0];
    const token = generateToken(newUser.id, newUser.role);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: newUser,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const userResult = await query(
      'SELECT id, name, email, password, role, created_at FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user.id, user.role);

    // Exclude password from response
    delete user.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const userResult = await query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const user = userResult.rows[0];
    let metrics = {};

    if (user.role === 'beneficiary') {
      const stats = await query(
        `SELECT 
          COUNT(*)::int AS total_requests,
          COUNT(CASE WHEN status = 'approved' THEN 1 END)::int AS approved_requests,
          COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_requests,
          COALESCE(SUM(funds_raised), 0)::numeric AS total_funds_raised
         FROM aid_requests WHERE beneficiary_id = $1`,
        [user.id]
      );
      metrics = stats.rows[0];
    } else if (user.role === 'donor') {
      const stats = await query(
        `SELECT 
          COUNT(*)::int AS total_donations,
          COALESCE(SUM(amount), 0)::numeric AS total_contributed
         FROM donations WHERE donor_id = $1 AND payment_status = 'completed'`,
        [user.id]
      );
      metrics = stats.rows[0];
    } else if (user.role === 'admin') {
      const stats = await query(
        `SELECT 
          (SELECT COUNT(*)::int FROM users) AS total_users,
          (SELECT COUNT(*)::int FROM aid_requests WHERE status = 'pending') AS pending_reviews,
          (SELECT COUNT(*)::int FROM aid_requests WHERE status = 'approved') AS total_approved,
          (SELECT COALESCE(SUM(amount), 0)::numeric FROM donations WHERE payment_status = 'completed') AS total_donations_volume`
      );
      metrics = stats.rows[0];
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        metrics
      }
    });
  } catch (error) {
    next(error);
  }
};

