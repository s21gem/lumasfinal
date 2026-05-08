import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, MessageCircle, Phone, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import CTAButton from './CTAButton';

interface ContactSettings {
  phone: string;
  email: string;
  whatsappNumber: string;
  calendlyUrl: string;
}

export default function Booking() {
  const [settings, setSettings] = useState<ContactSettings>({
    phone: '+1 (555) 123-4567',
    email: 'hello@lumascreative.com',
    whatsappNumber: '',
    calendlyUrl: '',
  });
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings({
          phone: data.phone || '+1 (555) 123-4567',
          email: data.email || 'hello@lumascreative.com',
          whatsappNumber: data.whatsappNumber || '',
          calendlyUrl: data.calendlyUrl || '',
        });
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'Message sent successfully!' });
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSending(false);
      // Auto-hide status after 5 seconds
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const handleCalendly = () => {
    if (settings.calendlyUrl) {
      window.open(settings.calendlyUrl, '_blank');
    } else {
      alert('Calendly booking link is not configured yet. Contact the admin.');
    }
  };

  const handleWhatsApp = () => {
    if (settings.whatsappNumber) {
      window.open(`https://wa.me/${settings.whatsappNumber}`, '_blank');
    } else {
      alert('WhatsApp number is not configured yet. Contact the admin.');
    }
  };

  return (
    <section id="contact" className="py-32 bg-white dark:bg-black border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-400/5 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Side: Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter mb-6 leading-[1.1]">
              Let's Create <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Something Powerful</span> <br />
              Together.
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-12 max-w-md">
              Fill out the form below or book a direct meeting to discuss your next big project.
            </p>

            {/* Status Messages */}
            {status && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl mb-6 font-medium ${
                  status.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                {status.message}
              </motion.div>
            )}

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  className="bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-email" className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                <input
                  type="email"
                  id="contact-email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-600 dark:text-gray-400">Message</label>
                <textarea
                  id="message"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us about your project..."
                  className="bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-xl px-4 py-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full mt-4 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-semibold py-4 px-8 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)] hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] transition-shadow duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {sending && <Loader2 className="w-5 h-5 animate-spin" />}
                {sending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* Right Side: Direct Contact */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center bg-zinc-100/50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-3xl p-10 lg:p-16 backdrop-blur-sm"
          >
            <h3 className="text-2xl font-bold text-black dark:text-white mb-8">Direct Contact</h3>
            
            <div className="flex flex-col gap-6 mb-12">
              <button
                onClick={handleCalendly}
                className="flex items-center gap-4 w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-4 px-6 rounded-xl hover:bg-gray-800 active:bg-gray-800 dark:hover:bg-gray-200 dark:active:bg-gray-200 transition-colors group"
              >
                <Calendar className="w-6 h-6 group-hover:scale-110 group-active:scale-110 transition-transform" />
                <span>Book via Calendly</span>
              </button>
              
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-4 w-full bg-[#25D366] text-white font-semibold py-4 px-6 rounded-xl hover:bg-[#20bd5a] active:bg-[#20bd5a] transition-colors group"
              >
                <MessageCircle className="w-6 h-6 group-hover:scale-110 group-active:scale-110 transition-transform" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>

            <div className="flex flex-col gap-6 pt-8 border-t border-black/10 dark:border-white/10">
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-black flex items-center justify-center border border-black/5 dark:border-white/5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Call Us</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{settings.phone}</p>
                </div>
              </a>
              
              <a href={`mailto:${settings.email}`} className="flex items-center gap-4 text-gray-600 dark:text-gray-400 hover:text-cyan-500 active:text-cyan-500 dark:hover:text-cyan-400 dark:active:text-cyan-400 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-black flex items-center justify-center border border-black/5 dark:border-white/5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Us</p>
                  <p className="text-lg font-semibold text-black dark:text-white">{settings.email}</p>
                </div>
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
