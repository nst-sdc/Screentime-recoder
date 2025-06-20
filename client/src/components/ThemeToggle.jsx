import React, { useEffect, useState } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode'); 
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => { 
    const newTheme = !isDark;  
    setIsDark(newTheme); 

    if (newTheme) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark'); 
    } else { 
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light'); 
    }
  };

  return (
    <label className="switch">
      <input type="checkbox" checked={isDark} onChange={toggleTheme} />
      <span className="slider"></span>
    </label>
  );
};

export default ThemeToggle;