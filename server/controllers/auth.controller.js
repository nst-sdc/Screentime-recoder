import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

export const googleSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed'
      });
    }

    const token = generateToken(req.user);

    req.user.lastLogin = new Date();
    await req.user.save();

    res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
  } catch (error) {
    console.error('Google success error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
  }
};

export const googleFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?error=authentication_failed`);
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    delete updates.googleId;
    delete updates.email;
    delete updates.password;
    delete updates.provider;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...updates, lastLogin: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  });
};

export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      token: req.header('Authorization')?.replace('Bearer ', '')
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    const newUser = new User({
      name,
      email,
      password,
      provider: 'local',
      isEmailVerified: false
    });

    await newUser.save();

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        provider: newUser.provider,
        isEmailVerified: newUser.isEmailVerified
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findByCredentials(email, password);

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        isEmailVerified: user.isEmailVerified,
        picture: user.picture,
        lastLogin: user.lastLogin
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid email or password'
    });
  }
};
