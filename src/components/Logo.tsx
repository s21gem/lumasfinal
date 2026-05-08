import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';

interface LogoSettings {
  logoLightUrl: string;
  logoDarkUrl: string;
}

export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  const { theme } = useTheme();
  const [logos, setLogos] = useState<LogoSettings>({ logoLightUrl: '', logoDarkUrl: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setLogos({
          logoLightUrl: data.logoLightUrl || '',
          logoDarkUrl: data.logoDarkUrl || '',
        });
      })
      .catch(console.error);
  }, []);

  const currentLogo = theme === 'dark' ? logos.logoDarkUrl : logos.logoLightUrl;
  const fallbackSrc = theme === 'dark' ? '/logo-dark.png' : '/logo-light.png';

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {currentLogo ? (
        <img 
          src={currentLogo} 
          alt="Logo" 
          className="h-full w-auto object-contain"
          onError={(e) => {
            // Fallback to local files
            (e.target as HTMLImageElement).src = fallbackSrc;
          }}
        />
      ) : (
        <img 
          src={fallbackSrc} 
          alt="Lumas Creative Logo" 
          className="h-full w-auto object-contain"
          onError={(e) => {
            // Ultimate fallback: show text
            (e.target as HTMLImageElement).style.display = 'none';
            const parent = (e.target as HTMLImageElement).parentElement;
            if (parent && !parent.querySelector('span')) {
              const span = document.createElement('span');
              span.className = 'text-2xl font-black tracking-tighter';
              span.textContent = 'LUMAS';
              parent.appendChild(span);
            }
          }}
        />
      )}
    </div>
  );
}
