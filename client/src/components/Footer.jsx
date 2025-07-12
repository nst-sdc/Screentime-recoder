import React from 'react';
import { Link } from 'react-router-dom';
import footerGraphic from '../assets/footer-graphic.svg';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-green-100 via-green-200 to-green-100 dark:from-[#0f1b22] dark:via-[#121b22] dark:to-[#0f1b22] text-gray-800 dark:text-gray-300 px-6 pt-14 pb-8 mt-10 rounded-t-2xl border-t border-green-300 dark:border-green-700 relative overflow-hidden shadow-inner">
     
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 items-start text-center sm:text-left">
        
        <div className="flex justify-center sm:justify-start">
          <img
            src={footerGraphic}
            alt="Illustration"
            className="w-48 sm:w-56 md:w-64 object-contain rounded-lg shadow-md"
          />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
            Screentime Recorder
          </h2>
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-400 max-w-sm mx-auto sm:mx-0">
            Helping you understand and improve your digital habits — with privacy-first tools.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm font-medium">
            <li><Link to="/register" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Create Account</Link></li>
            <li><Link to="/login" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Login</Link></li>
            <li><Link to="/dashboard" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Connect</h3>
          <a
            href="https://github.com/nst-sdc/Screentime-recoder"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-2 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.373 0 12a12 12 0 008.207 11.386c.6.11.793-.26.793-.577v-2.256c-3.338.727-4.042-1.61-4.042-1.61-.546-1.386-1.333-1.754-1.333-1.754-1.09-.745.082-.73.082-.73 1.206.085 1.84 1.245 1.84 1.245 1.07 1.837 2.807 1.306 3.49.998.108-.776.42-1.307.763-1.608-2.665-.3-5.467-1.35-5.467-6.003 0-1.326.467-2.41 1.235-3.258-.123-.303-.535-1.52.117-3.167 0 0 1.007-.322 3.3 1.24a11.47 11.47 0 013.004-.403c1.02.005 2.05.138 3.004.403 2.29-1.562 3.295-1.24 3.295-1.24.654 1.647.242 2.864.12 3.167.77.848 1.234 1.932 1.234 3.258 0 4.665-2.807 5.7-5.48 6.002.43.37.823 1.096.823 2.21v3.283c0 .32.192.694.8.576A12.006 12.006 0 0024 12c0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-sm font-semibold">GitHub</span>
          </a>
        </div>
      </div>

      <div className="relative z-10 mt-10 text-center text-xs text-gray-600 dark:text-gray-500 font-medium">
        © 2025 Screentime Recorder. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
