import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#333] text-white py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-sm text-center md:text-left">
          &copy; {new Date().getFullYear()} Screentime Recorder. All rights reserved.
        </p>
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="mailto:support@screentimeapp.com" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;