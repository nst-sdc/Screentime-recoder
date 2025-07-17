import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import UndrawSVG from "../assets/undraw.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import CutLogo from "../assets/CutLogo.svg";


const Login = () => {
  const { login: googleLogin, loginWithCredentials, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return setError('Please enter both email and password');

    setIsSubmitting(true);
    setError('');

    try {
      const { token, user } = await loginWithCredentials(formData.email, formData.password);
      chrome?.storage?.local?.set({ token, authStatus: 'authenticated', user });
      navigate("/dashboard");
    } catch (error) {
      chrome?.storage?.local?.set({ authStatus: 'network_error' });
      setError(error.response?.data?.message || error.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => googleLogin();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-50 dark:from-[#121b22] dark:to-[#121b22]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-50 dark:from-[#121b22] dark:to-[#121b22] px-6 py-24 relative">
<div className="absolute top-6 left-6">
  <img
    src={CutLogo}
    alt="Logo"
    className="h-32 w-32 max-w-[128px] object-contain"
  />
  <h1 className="text-xl font-semibold text-green-700 dark:text-whatsDark-text">
    
  </h1>
</div>


      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-14 bg-white dark:bg-[#1f2c33] shadow-2xl rounded-2xl overflow-hidden border border-green-200">
        {/* Left: Form Section */}
        <div className="flex flex-col justify-center px-8 sm:px-14 py-12">
          <h2 className="text-4xl font-bold text-green-700 dark:text-whatsDark-text mb-4">Welcome Back</h2>
          <p className="text-gray-600 dark:text-whatsDark-text text-lg mb-8">Login to manage your time and tasks efficiently.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-white text-black dark:bg-[#2a3942] dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 border border-gray-300 rounded-lg bg-white text-black dark:bg-[#2a3942] dark:text-white dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-white bg-transparent outline-none focus:outline-none focus:ring-0 hover:bg-transparent active:bg-transparent"
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </button>
            </div>

            <div className="text-right">
              <a href="#" className="text-green-600 hover:text-green-700 text-sm hover:underline">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="px-4 text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full py-4 mt-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-medium hover:underline">
                Create one here
              </Link>
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col items-center justify-center bg-green-100 dark:bg-[#1f2c33] p-8 sm:p-12 space-y-6">
          <div className="w-full flex justify-center">
            <img src={UndrawSVG} alt="Undraw Illustration" className="w-full max-w-[220px] object-contain rounded-lg" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-green-800 dark:text-whatsDark-text">Secure Login</h2>
            <p className="text-green-700 dark:text-whatsDark-text max-w-sm mx-auto mt-2">
              Effortlessly manage your time and productivity
              <br />
              Stay on top of your tasks, track progress, and achieve more — all in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
