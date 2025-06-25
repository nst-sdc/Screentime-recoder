import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          existingUser.lastLogin = new Date();
          existingUser.name = profile.displayName || existingUser.name;
          existingUser.picture = profile.photos?.[0]?.value || existingUser.picture;
          await existingUser.save();
          return done(null, existingUser);
        }

        const existingEmailUser = await User.findOne({ 
          email: profile.emails?.[0]?.value 
        });

        if (existingEmailUser) {
          existingEmailUser.googleId = profile.id;
          existingEmailUser.provider = 'google';
          existingEmailUser.picture = profile.photos?.[0]?.value || existingEmailUser.picture;
          existingEmailUser.lastLogin = new Date();
          await existingEmailUser.save();
          return done(null, existingEmailUser);
        }

        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          picture: profile.photos?.[0]?.value,
          provider: 'google',
          lastLogin: new Date()
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        console.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
