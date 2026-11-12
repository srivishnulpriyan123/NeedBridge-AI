import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ max: 150 })
      .withMessage('Name must not exceed 150 characters.'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long.'),
    body('role')
      .optional()
      .isIn(['beneficiary', 'donor', 'admin'])
      .withMessage('Role must be one of: beneficiary, donor, admin.')
  ],
  register
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required.')
  ],
  login
);

router.get('/profile', protect, getProfile);

export default router;

