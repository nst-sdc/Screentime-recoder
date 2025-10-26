import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateTokenString = (size = 32) => {
  return crypto.randomBytes(size).toString('hex');
};

export const hashToken = async (token) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(token, salt);
};

export const compareTokenHash = async (token, hash) => {
  return bcrypt.compare(token, hash);
};

export default { generateTokenString, hashToken, compareTokenHash };
