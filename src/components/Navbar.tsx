import React, { useState, useEffect } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import CTAButton from './CTAButton';
import { useTheme } from './ThemeContext';
import Logo from './Logo';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

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
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/#portfolio' },
    { name: 'Services', href: '/#services' },
    { name: 'Process', href: '/#process' },
  ];

  const [activeLink, setActiveLink] = useState('/');

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      setActiveLink(`/${location.hash}`);
    } else {
      setActiveLink(location.pathname);
    }
  }, [location]);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    setActiveLink(href);
    
    if (location.pathname !== '/' && href.startsWith('/#')) {
      return;
    }

    if (location.pathname === '/' && href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    if (href === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <div className="border-beam-container p-[1.5px] rounded-full shadow-[0_0_25px_rgba(34,211,238,0.15)]">
              <div className="flex items-center gap-2 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl px-2 py-2 rounded-full relative z-10">
                {navLinks.map((link) => (
                  <div key={link.name} className="relative px-4 py-1.5">
                    <Link 
                      to={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className={`relative z-10 text-sm font-bold transition-colors duration-300 ${
                        activeLink === link.href 
                          ? 'text-cyan-500 dark:text-cyan-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-cyan-500/70 dark:hover:text-cyan-400/70'
                      }`}
                    >
                      {link.name}
                    </Link>
                    {activeLink === link.href && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-400/15 rounded-full"
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                      />
                    )}
                  </div>
                ))}
                <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-2"></div>
                <button 
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 transition-colors focus:outline-none"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>
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
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-black border-t border-cyan-500/30 dark:border-cyan-400/30 shadow-[0_10px_40px_rgba(34,211,238,0.15)] flex flex-col items-center py-8 gap-6 animate-in slide-in-from-top-2">
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
