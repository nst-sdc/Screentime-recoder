export const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  provider: 'local'
};

export const validGoogleUser = {
  googleId: '123456789',
  name: 'Google User',
  email: 'google@example.com',
  provider: 'google',
  picture: 'https://example.com/avatar.jpg'
};

export const invalidUser = {
  name: '',
  email: 'invalid-email',
  password: '123'
};

export const userUpdateData = {
  name: 'Updated User Name'
};

export const loginCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

export const invalidLoginCredentials = {
  email: 'test@example.com',
  password: 'wrongpassword'
};
