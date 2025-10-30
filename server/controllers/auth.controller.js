import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { generateTokenString, hashToken, compareTokenHash } from '../utils/token.util.js';
import { sendEmail } from '../services/emailService.js';

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

    // Generate verification token
    const verificationToken = generateTokenString(24);
    newUser.emailVerificationToken = await hashToken(verificationToken);
    newUser.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await newUser.save();

    const token = generateToken(newUser);

    // send verification email (best-effort)
    try {
      // Use the server verification endpoint so the verification link does not open the frontend app directly.
      // If SERVER_URL is not provided, fall back to CLIENT_URL + '/api' (useful for local setups where API is hosted under same domain)
  const serverBase = process.env.SERVER_URL || (process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/$/, '')}/api` : `http://localhost:${process.env.PORT || 3000}/api`);
      const verifyUrl = `${serverBase}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(newUser.email)}`;
      await sendEmail({
        to: newUser.email,
        subject: 'Please verify your email',
        html: `<p>Hello ${newUser.name},</p><p>Please verify your email by clicking <a href="${verifyUrl}">here</a>.</p>`,
        text: `Please verify your email by visiting: ${verifyUrl}`
      });
    } catch (err) {
      console.error('Failed to send verification email', err);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email before logging in.',
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

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.'
      });
    }

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

export const verifyEmail = async (req, res) => {
  try {
    const { token, email } = req.query;
    if (!token || !email) {
      return res.status(400).set('Content-Type', 'text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Verification</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;"><div style="background:white;padding:24px;border-radius:8px;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.08);text-align:center;"><h2 style="margin-bottom:8px;color:#333">Invalid verification link</h2><p style="color:#555">The verification link is missing required information.</p></div></body></html>`);
    }

    const user = await User.findOne({ email });
  if (!user) return res.status(400).set('Content-Type', 'text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Verification</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;"><div style="background:white;padding:24px;border-radius:8px;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.08);text-align:center;"><h2 style="margin-bottom:8px;color:#333">Invalid verification link</h2><p style="color:#555">No account found for this verification request.</p></div></body></html>`);

  if (user.isEmailVerified) return res.status(200).set('Content-Type', 'text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Verification</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;"><div style="background:white;padding:24px;border-radius:8px;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.08);text-align:center;"><h2 style="margin-bottom:8px;color:#333">Email already verified</h2><p style="color:#555">Your email was already verified. You can sign in now.</p></div></body></html>`);

  if (!user.emailVerificationToken || !user.emailVerificationExpires) return res.status(400).set('Content-Type', 'text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Verification</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;"><div style="background:white;padding:24px;border-radius:8px;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.08);text-align:center;"><h2 style="margin-bottom:8px;color:#333">Invalid or expired verification link</h2><p style="color:#555">This verification link is invalid or has been used.</p></div></body></html>`);

  if (user.emailVerificationExpires < new Date()) return res.status(400).set('Content-Type', 'text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Verification</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;"><div style="background:white;padding:24px;border-radius:8px;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.08);text-align:center;"><h2 style="margin-bottom:8px;color:#333">Verification link expired</h2><p style="color:#555">This verification link has expired. Please request a new verification email.</p></div></body></html>`);

    const isValid = await compareTokenHash(token, user.emailVerificationToken);
  if (!isValid) return res.status(400).set('Content-Type', 'text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Verification</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;"><div style="background:white;padding:24px;border-radius:8px;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.08);text-align:center;"><h2 style="margin-bottom:8px;color:#333">Invalid verification token</h2><p style="color:#555">The verification token is not valid.</p></div></body></html>`);

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return res.status(200).set('Content-Type', 'text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Verified</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;"><div style="background:white;padding:24px;border-radius:8px;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.08);text-align:center;"><h2 style="margin-bottom:8px;color:#333">Email verified successfully</h2><p style="color:#555;margin-bottom:16px;">Your email has been verified. You can now sign in from your device.</p><a href="${process.env.CLIENT_URL || '/login'}" style="display:inline-block;padding:10px 16px;background:#10b981;color:white;border-radius:6px;text-decoration:none">Go to Login</a></div></body></html>`);
  } catch (err) {
    console.error('verifyEmail error', err);
    return res.status(500).set('Content-Type', 'text/html').send(`<!doctype html><html><head><meta charset="utf-8"><title>Verification Error</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5;"><div style="background:white;padding:24px;border-radius:8px;max-width:520px;box-shadow:0 6px 18px rgba(0,0,0,0.08);text-align:center;"><h2 style="margin-bottom:8px;color:#333">Internal server error</h2><p style="color:#555">Something went wrong while verifying your email. Please try again later.</p></div></body></html>`);
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'No user found' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email already verified' });

    const verificationToken = generateTokenString(24);
    user.emailVerificationToken = await hashToken(verificationToken);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      const serverBase = process.env.SERVER_URL || (process.env.CLIENT_URL ? `${process.env.CLIENT_URL.replace(/\/$/, '')}/api` : `http://localhost:${process.env.PORT || 3000}/api`);
      const verifyUrl = `${serverBase}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;
      await sendEmail({ to: user.email, subject: 'Please verify your email', html: `<p>Please verify: <a href="${verifyUrl}">Verify</a></p>`, text: `Verify: ${verifyUrl}` });
    } catch (err) {
      console.error('Failed to send verification email', err);
    }

    return res.json({ success: true, message: 'Verification email sent' });
  } catch (err) {
    console.error('resendVerification error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ success: true, message: 'If an account exists, a reset link will be sent' });

    const resetToken = generateTokenString(24);
    user.passwordResetToken = await hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
      await sendEmail({ to: user.email, subject: 'Password reset', html: `<p>Reset your password: <a href="${resetUrl}">Reset</a></p>`, text: `Reset: ${resetUrl}` });
    } catch (err) {
      console.error('Failed to send reset email', err);
    }

    return res.json({ success: true, message: 'If an account exists, a reset link will be sent' });
  } catch (err) {
    console.error('forgotPassword error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, email } = req.query;
    const { password } = req.body;

    if (!token || !email) return res.status(400).json({ success: false, message: 'Invalid reset link' });
    if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email });
    if (!user || !user.passwordResetToken || !user.passwordResetExpires) return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });

    if (user.passwordResetExpires < new Date()) return res.status(400).json({ success: false, message: 'Reset link expired' });

    const isValid = await compareTokenHash(token, user.passwordResetToken);
    if (!isValid) return res.status(400).json({ success: false, message: 'Invalid reset token' });

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.json({ success: true, message: 'Password has been reset' });
  } catch (err) {
    console.error('resetPassword error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
