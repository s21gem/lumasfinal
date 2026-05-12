import React from 'react';
import { motion } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import CTAButton from './CTAButton';
import { useData } from '../context/DataContext';

interface ServiceData {
  id: string;
  title: string;
  description: string;
  iconIdentifier: string | null;
}

// Map icon name strings to Lucide components
const getIcon = (name: string | null) => {
  if (!name) return LucideIcons.Zap;
  const icon = (LucideIcons as any)[name];
  return icon || LucideIcons.Zap;
};

export default function Services() {
  const { services, loading } = useData();

  // Fallback content if no services exist
  const displayServices = services.length > 0 ? services : [
    { id: '1', title: 'Real Estate Production', description: 'Cinematic property tours and aerial drone footage that sell lifestyle, not just square footage.', iconIdentifier: 'Video' },
    { id: '2', title: 'VSL & Talking Head', description: 'High-converting Video Sales Letters and expert positioning content designed to build trust instantly.', iconIdentifier: 'MonitorPlay' },
    { id: '3', title: 'Commercial Production', description: 'Brand anthems and product commercials that look like a million bucks without the agency bloat.', iconIdentifier: 'Clapperboard' },
    { id: '4', title: 'Event Coverage', description: 'Dynamic highlight reels and full-session recordings that capture the energy of your live events.', iconIdentifier: 'CalendarDays' },
    { id: '5', title: 'Podcast Production', description: 'End-to-end audio/video podcast production, from set design to editing and distribution strategy.', iconIdentifier: 'Mic' },
    { id: '6', title: 'Social Media Ads', description: 'Short-form, hook-driven creative optimized for TikTok, Reels, and YouTube Shorts algorithms.', iconIdentifier: 'Share2' },
  ];

  return (
    <section id="services" className="py-24 bg-white dark:bg-[#000d11] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter mb-6">Our Services</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            We are your full-stack creative partners, handling everything from concept to final cut.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-2xl animate-pulse h-64" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {displayServices.map((service, index) => {
              const Icon = getIcon(service.iconIdentifier);
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  tabIndex={0}
                  className="group bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 hover:border-cyan-500/30 active:border-cyan-500/30 focus:border-cyan-500/30 focus:outline-none cursor-pointer p-8 rounded-2xl transition-colors duration-300"
                >
                  <div className="w-16 h-16 bg-white dark:bg-[#000d11] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-active:scale-110 group-focus:scale-110 transition-transform duration-300 shadow-inner shadow-black/5 dark:shadow-white/5">
                    <Icon className="w-8 h-8 text-cyan-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-black dark:text-white mb-4">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{service.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <CTAButton text="Book a Meeting" />
        </div>
      </div>
    </section>
  );
}
