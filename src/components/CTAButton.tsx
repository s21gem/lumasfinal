import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface CTAButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  href?: string;
}

export default function CTAButton({ text, onClick, className = '', href }: CTAButtonProps) {
  const [calendlyUrl, setCalendlyUrl] = useState('');

  useEffect(() => {
    // Only fetch if this is a "Book a Meeting" button with no custom onClick/href
    if (text.toLowerCase().includes('book') && !onClick && !href) {
      fetch('/api/settings')
        .then(r => r.json())
        .then(data => {
          if (data.calendlyUrl) setCalendlyUrl(data.calendlyUrl);
        })
        .catch(console.error);
    }
  }, [text, onClick, href]);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.open(href, '_blank');
    } else if (calendlyUrl) {
      window.open(calendlyUrl, '_blank');
    } else {
      // Scroll to contact section as fallback
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-semibold py-3 px-8 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] active:shadow-[0_0_25px_rgba(217,70,239,0.6)] transition-shadow duration-300 ${className}`}
    >
      {text}
    </motion.button>
  );
}
