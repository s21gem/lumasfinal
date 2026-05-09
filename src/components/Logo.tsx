import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { getMediaUrl } from '../utils/media';

interface LogoSettings {
  logoLightUrl: string;
  logoDarkUrl: string;
}

export default function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  const { theme } = useTheme();
  const [logos, setLogos] = useState<LogoSettings>({ logoLightUrl: '', logoDarkUrl: '' });
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setLogos({
          logoLightUrl: data.logoLightUrl || '',
          logoDarkUrl: data.logoDarkUrl || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset error state when theme or logos change
  useEffect(() => {
    setImgError(false);
  }, [theme, logos]);

  const preferredLogo = theme === 'dark' ? logos.logoDarkUrl : logos.logoLightUrl;
  const alternativeLogo = theme === 'dark' ? logos.logoLightUrl : logos.logoDarkUrl;
  const currentLogo = preferredLogo || alternativeLogo;

  // Don't render anything while initially checking settings to avoid flashing fallback
  if (loading) {
    return <div className={`flex items-center justify-center ${className} min-w-[100px] animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded`}></div>;
  }

  return (
    <div className={`flex items-center justify-center ${className} min-w-[100px]`}>
      {!imgError && currentLogo ? (
        <img 
          src={getMediaUrl(currentLogo, 'logo')} 
          alt="Logo" 
          className="h-full w-auto object-contain"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-2xl font-black tracking-tighter text-black dark:text-white">
          LUMAS
        </span>
      )}
    </div>
  );
}
