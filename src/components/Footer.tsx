import React, { useState, useEffect } from 'react';
import { Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import Logo from './Logo';

interface FooterSettings {
  footerTagline: string;
  copyrightText: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  instagramUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

interface ServiceItem {
  id: string;
  title: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<FooterSettings>({
    footerTagline: 'A creative production and post-production studio helping brands turn ideas into conversion-driven assets.',
    copyrightText: 'Lumas Creative Studio',
    phone: '', email: '', address: '123 Creative Blvd, Suite 400', city: 'Los Angeles, CA 90015',
    instagramUrl: '', twitterUrl: '', linkedinUrl: '', youtubeUrl: '',
  });
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(data => {
      setSettings(prev => ({
        footerTagline: data.footerTagline || prev.footerTagline,
        copyrightText: data.copyrightText || prev.copyrightText,
        phone: data.phone || prev.phone,
        email: data.email || prev.email,
        address: data.address || prev.address,
        city: data.city || prev.city,
        instagramUrl: data.instagramUrl || '',
        twitterUrl: data.twitterUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        youtubeUrl: data.youtubeUrl || '',
      }));
    }).catch(console.error);

    fetch('/api/services').then(r => r.json()).then(setServices).catch(console.error);
  }, []);

  const socialLinks = [
    { url: settings.instagramUrl, icon: Instagram },
    { url: settings.twitterUrl, icon: Twitter },
    { url: settings.linkedinUrl, icon: Linkedin },
    { url: settings.youtubeUrl, icon: Youtube },
  ].filter(s => s.url);

  return (
    <footer className="bg-white dark:bg-black py-16 border-t border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 text-center md:text-left">
          
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <a href="#home" className="hover:opacity-80 active:opacity-80 transition-opacity inline-block">
              <Logo className="h-16 md:h-20" />
            </a>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
              {settings.footerTagline}
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-black dark:text-white font-semibold mb-2">Quick Links</h4>
            <a href="#home" className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 text-sm transition-colors">Home</a>
            <a href="#portfolio" className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 text-sm transition-colors">Portfolio</a>
            <a href="#services" className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 text-sm transition-colors">Services</a>
            <a href="#process" className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 text-sm transition-colors">Process</a>
            <a href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 text-sm transition-colors">Contact</a>
          </div>

          {/* Services */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="text-black dark:text-white font-semibold mb-2">Services</h4>
            {(services.length > 0 ? services.slice(0, 5) : [
              { id: '1', title: 'Real Estate Production' },
              { id: '2', title: 'Commercial Production' },
              { id: '3', title: 'VSL & Talking Head' },
              { id: '4', title: 'Event Coverage' },
              { id: '5', title: 'Podcast Production' },
            ]).map(service => (
              <a key={service.id} href="#services" className="text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 text-sm transition-colors">{service.title}</a>
            ))}
          </div>

          {/* Contact & Social */}
          <div className="flex flex-col items-center md:items-start gap-6">
            <h4 className="text-black dark:text-white font-semibold mb-2">Connect</h4>
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 hover:bg-zinc-200 active:bg-zinc-200 dark:hover:bg-zinc-800 dark:active:bg-zinc-800 transition-all">
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            )}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {settings.address && <p>{settings.address}</p>}
              {settings.city && <p>{settings.city}</p>}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} {settings.copyrightText}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-black active:text-black dark:hover:text-white dark:active:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-black active:text-black dark:hover:text-white dark:active:text-white text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
