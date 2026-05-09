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
  privacyPolicy: string;
  termsOfService: string;
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
    privacyPolicy: '', termsOfService: '',
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
        privacyPolicy: data.privacyPolicy || '',
        termsOfService: data.termsOfService || '',
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
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  const openPolicy = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content || 'Content not yet provided.');
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closePolicy = () => {
    setModalOpen(false);
    document.body.style.overflow = 'unset';
  };

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
            <button 
              onClick={() => openPolicy('Privacy Policy', settings.privacyPolicy)}
              className="text-gray-500 hover:text-black active:text-black dark:hover:text-white dark:active:text-white text-sm transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button 
              onClick={() => openPolicy('Terms of Service', settings.termsOfService)}
              className="text-gray-500 hover:text-black active:text-black dark:hover:text-white dark:active:text-white text-sm transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Policy Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={closePolicy}
          />
          <div className="relative w-full max-w-4xl max-h-[80vh] bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white tracking-tighter">{modalTitle}</h2>
              <button 
                onClick={closePolicy}
                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div 
                className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm md:text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: modalContent.replace(/\n/g, '<br />') }}
              />
            </div>
            <div className="p-6 border-t border-black/5 dark:border-white/10 flex justify-end">
              <button 
                onClick={closePolicy}
                className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
