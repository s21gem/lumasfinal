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
  const [settings, setSettings] = useState<HeroSettings>({
    heroSubtitle: 'From Idea to Conversion — Turning Creativity into Growth.',
    heroTitle: 'Small in size,',
    heroTitleHighlight: 'Big in impact.',
    heroDescription: 'Creative Production and Post-production Studio helping brands with Commercial | Documentary | Podcast | VFX | Animation',
    heroVideoUrl: 'https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_24fps.mp4',
    calendlyUrl: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings(prev => ({
          heroSubtitle: data.heroSubtitle || prev.heroSubtitle,
          heroTitle: data.heroTitle || prev.heroTitle,
          heroTitleHighlight: data.heroTitleHighlight || prev.heroTitleHighlight,
          heroDescription: data.heroDescription || prev.heroDescription,
          heroVideoUrl: data.heroVideoUrl || prev.heroVideoUrl,
          calendlyUrl: data.calendlyUrl || '',
        }));
      })
      .catch(console.error);
  }, []);

  return (
    <section id="home" className="relative w-full h-screen flex flex-col justify-between overflow-hidden bg-white dark:bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-40"
          src={getMediaUrl(settings.heroVideoUrl, 'video')}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-white dark:from-black/60 dark:via-black/20 dark:to-black"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto mt-20">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-cyan-600 dark:text-cyan-400 font-semibold tracking-widest uppercase text-sm md:text-base mb-6"
        >
          {settings.heroSubtitle}
        </motion.p>
        
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-black dark:text-white tracking-tighter leading-[1.1] mb-8"
        >
          {settings.heroTitle} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">{settings.heroTitleHighlight}</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-gray-700 dark:text-gray-300 text-lg md:text-xl max-w-2xl font-light leading-relaxed"
        >
          {settings.heroDescription}
        </motion.p>
      </div>

      {/* Bottom Marquee */}
      <div className="relative z-10 w-full pb-8">
        <TrustedBy />
      </div>
    </section>
  );
}
