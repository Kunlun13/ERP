import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import { logActivity } from '../services/activityService.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

export const register = asyncHandler(async (req, res) => {
  const { name, email, mobileNo, password, role } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw ApiError.badRequest('Email already registered');

  const user = await User.create({ name, email, mobileNo, password, role });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) throw ApiError.forbidden('Account is deactivated');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  await logActivity({
    userId: user._id,
    action: ACTIVITY_TYPES.LOGIN,
    module: 'auth',
    description: `${user.name} logged in`,
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobileNo: user.mobileNo,
        role: user.role,
        profilePhoto: user.profilePhoto,
      },
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, mobileNo } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, mobileNo, ...(req.file && { profilePhoto: `/uploads/profiles/${req.file.filename}` }) },
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: user });
});

export const logout = asyncHandler(async (req, res) => {
  await logActivity({
    userId: req.user._id,
    sessionId: req.headers['x-session-id'],
    action: ACTIVITY_TYPES.LOGOUT,
    module: 'auth',
    description: `${req.user.name} logged out`,
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'Logged out successfully' });
});
