import React from 'react';
import { Link } from 'react-router-dom';
import footerGraphic from '../assets/footer-graphic.svg';

const Footer = () => {
  return (
   <footer className="bg-gradient-to-r from-green-100 via-green-200 to-green-100 dark:from-[#0f1b22] dark:via-[#121b22] dark:to-[#0f1b22] text-gray-800 dark:text-gray-300 pt-16 px-6 relative z-10 rounded-t-lg backdrop-blur-md shadow-inner border-t border-green-300 dark:border-green-700">
  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none rounded-t-lg"></div>
  <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-green-300 dark:border-green-700">
  <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-center justify-center">
      <img
        src={footerGraphic}
        alt="Screentime Illustration"
        className="w-full max-w-[220px] object-contain rounded-lg shadow-lg"
      />
    </div>
   
    <div>
      <h2 className="text-3xl font-extrabold text-green-700 dark:text-green-400 mb-3 tracking-wide">
        Screentime Recorder
      </h2>
      <p className="text-base text-gray-700 dark:text-gray-400 leading-relaxed max-w-xs">
        Helping you understand and improve your digital habits — with privacy-first tools.
      </p>
    </div>

    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white tracking-wide">Quick Links</h3>
      <ul className="space-y-3 text-sm font-medium">
        <li><Link to="/register" className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200">Create Account</Link></li>
        <li><Link to="/login" className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200">Login</Link></li>
        <li><Link to="/dashboard" className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200">Dashboard</Link></li>
      </ul>
    </div>

   
    <div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white tracking-wide">Connect</h3>
      <div className="flex items-center space-x-5 mt-3">
        <a
          href="https://github.com/nst-sdc/Screentime-recoder"
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-2 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
          aria-label="GitHub"
        >
          <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24" role="img" aria-hidden="true" focusable="false">
          <path d="M12 0C5.37 0 0 5.373 0 12a12 12 0 008.207 11.386c.6.11.793-.26.793-.577v-2.256c-3.338.727-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.754-1.333-1.754-1.09-.745.082-.73.082-.73 1.206.085 1.84 1.245 1.84 1.245 1.07 1.837 2.807 1.306 3.49.998.108-.776.42-1.307.763-1.608-2.665-.3-5.467-1.35-5.467-6.003 0-1.326.467-2.41 1.235-3.258-.123-.303-.535-1.52.117-3.167 0 0 1.007-.322 3.3 1.24a11.47 11.47 0 013.004-.403c1.02.005 2.05.138 3.004.403 2.29-1.562 3.295-1.24 3.295-1.24.654 1.647.242 2.864.12 3.167.77.848 1.234 1.932 1.234 3.258 0 4.665-2.807 5.7-5.48 6.002.43.37.823 1.096.823 2.21v3.283c0 .32.192.694.8.576A12.006 12.006 0 0024 12c0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-lg font-semibold">GitHub</span>
        </a>
      </div>
    </div>
  </div>

  <div className="text-center text-sm py-6 text-gray-700 dark:text-gray-500 font-medium">
    © 2025 Screentime Recorder. All rights reserved.
  </div>
</footer>
  );
};

export default Footer;
