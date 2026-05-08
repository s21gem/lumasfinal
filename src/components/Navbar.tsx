import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import CTAButton from './CTAButton';
import { useTheme } from './ThemeContext';
import Logo from './Logo';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Portfolio', href: '/#portfolio' },
    { name: 'Services', href: '/#services' },
    { name: 'Process', href: '/#process' },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    
    // If we're not on the home page and trying to navigate to a hash link,
    // we let the Link component handle the routing to '/' first
    if (location.pathname !== '/' && href.startsWith('/#')) {
      return;
    }

    // If we're already on the home page, smoothly scroll to the section
    if (location.pathname === '/' && href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm py-4' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" onClick={() => setIsOpen(false)} className="hover:opacity-80 active:opacity-80 transition-opacity">
            <Logo className="h-8 md:h-10" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 bg-white/50 dark:bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-black/5 dark:border-white/5 shadow-sm">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700"></div>
              <button 
                onClick={toggleTheme}
                className="text-gray-700 dark:text-gray-300 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 transition-colors focus:outline-none"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
            <CTAButton text="Book a Meeting" />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="text-black dark:text-white hover:text-cyan-500 active:text-cyan-500 focus:outline-none"
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-black dark:text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-black border-t border-black/5 dark:border-white/5 shadow-lg flex flex-col items-center py-8 gap-6 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-xl font-bold text-gray-800 dark:text-gray-200 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="mt-4">
            <CTAButton text="Book a Meeting" onClick={() => {
              setIsOpen(false);
              const el = document.getElementById('contact');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />
          </div>
        </div>
      )}
    </nav>
  );
}
