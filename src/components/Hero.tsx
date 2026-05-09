import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import TrustedBy from './TrustedBy';
import { getMediaUrl } from '../utils/media';

interface HeroSettings {
  heroSubtitle: string;
  heroTitle: string;
  heroTitleHighlight: string;
  heroDescription: string;
  heroVideoUrl: string;
  calendlyUrl: string;
}

export default function Hero() {
  const [settings, setSettings] = useState<HeroSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings({
          heroSubtitle: data.heroSubtitle || '',
          heroTitle: data.heroTitle || '',
          heroTitleHighlight: data.heroTitleHighlight || '',
          heroDescription: data.heroDescription || '',
          heroVideoUrl: data.heroVideoUrl || '',
          calendlyUrl: data.calendlyUrl || '',
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="home" className="relative w-full h-screen flex flex-col justify-between overflow-hidden bg-white dark:bg-black !p-0">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none bg-black">
        {settings?.heroVideoUrl && (
          <>
            {(() => {
              const isYouTube = settings.heroVideoUrl.includes('youtube.com') || settings.heroVideoUrl.includes('youtu.be');
              
              if (isYouTube) {
                const ytMatch = settings.heroVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
                const videoId = ytMatch ? ytMatch[1] : '';
                
                if (videoId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&playsinline=1`}
                      className="absolute top-1/2 left-1/2 w-[400vw] h-[400vw] sm:w-[250vw] sm:h-[250vw] md:w-[150vw] md:h-[150vw] -translate-x-1/2 -translate-y-1/2 opacity-40"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{ border: 0 }}
                    ></iframe>
                  );
                }
              }
              
              return (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-40"
                  src={getMediaUrl(settings.heroVideoUrl, 'video')}
                />
              );
            })()}
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-white dark:from-black/60 dark:via-black/20 dark:to-black pointer-events-none"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto pt-24 pb-12">
        {!loading && settings && (
          <>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-cyan-600 dark:text-cyan-400 font-semibold tracking-widest uppercase text-xs md:text-base mb-4 md:mb-6"
            >
              {settings.heroSubtitle}
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-black dark:text-white tracking-tighter leading-[1.1] mb-6 md:mb-8"
            >
              {settings.heroTitle} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">{settings.heroTitleHighlight}</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-gray-700 dark:text-gray-300 text-base md:text-xl max-w-2xl font-light leading-relaxed"
            >
              {settings.heroDescription}
            </motion.p>
          </>
        )}
      </div>

      {/* Bottom Marquee */}
      <div className="relative z-10 w-full pb-8">
        <TrustedBy />
      </div>
    </section>
  );
}
