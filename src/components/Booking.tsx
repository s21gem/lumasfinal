import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, MessageCircle, Phone, Mail, CheckCircle, AlertCircle, Loader2, Clock, User, ChevronRight, ChevronLeft } from 'lucide-react';

interface ContactSettings {
  phone: string;
  email: string;
  whatsappNumber: string;
}

interface Service {
  id: string;
  title: string;
}

export default function Booking() {
  const [settings, setSettings] = useState<ContactSettings>({
    phone: '+1 (555) 123-4567',
    email: 'hello@lumascreative.com',
    whatsappNumber: '',
  });

  const [mode, setMode] = useState<'book' | 'message'>('book');

  // Booking State
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Data
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [details, setDetails] = useState({ name: '', email: '', phone: '', notes: '' });

  // Message State
  const [messageData, setMessageData] = useState({ name: '', email: '', message: '' });
  const [sendingMsg, setSendingMsg] = useState(false);

  useEffect(() => {
    // Fetch Settings
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setSettings({
          phone: data.phone || '+1 (555) 123-4567',
          email: data.email || 'hello@lumascreative.com',
          whatsappNumber: data.whatsappNumber || '',
        });
      }).catch(console.error);

    // Fetch Services
    fetch('/api/services')
      .then(r => r.json())
      .then(data => {
        setServices(data);
        if (data.length > 0) setSelectedService(data[0].title);
      }).catch(console.error);
  }, []);

  // Fetch available slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    fetch(`/api/schedules/available-slots?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => {
        setAvailableSlots(data.availableSlots || []);
        setSelectedSlot('');
      })
      .catch(console.error)
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedSlot || !details.name || !details.email || !details.phone) {
      setStatus({ type: 'error', message: 'Please fill out all required fields.' });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: details.name,
          clientEmail: details.email,
          clientPhone: details.phone,
          serviceType: selectedService,
          date: selectedDate,
          timeSlot: selectedSlot,
          notes: details.notes
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'Appointment requested successfully! We will contact you soon.' });
        setStep(4); // Success step
      } else {
        throw new Error(data.error || 'Failed to book appointment');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMsg(true);
    setStatus(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message || 'Message sent successfully!' });
        setMessageData({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setSendingMsg(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  const handleWhatsApp = () => {
    if (settings.whatsappNumber) {
      window.open(`https://wa.me/${settings.whatsappNumber}`, '_blank');
    } else {
      alert('WhatsApp number is not configured yet. Contact the admin.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="contact" className="py-32 bg-white dark:bg-black border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-400/5 blur-[200px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left Side: Booking System */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-8 w-fit border-beam-container p-[1.5px] rounded-full shadow-[0_0_25px_rgba(34,211,238,0.15)]">
              <div className="flex items-center bg-zinc-100/90 dark:bg-zinc-900/90 backdrop-blur-xl p-1 rounded-full relative z-10">
                <button 
                  onClick={() => { setMode('book'); setStatus(null); }}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${mode === 'book' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                  Book Session
                </button>
                <button 
                  onClick={() => { setMode('message'); setStatus(null); }}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${mode === 'message' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                  Send Message
                </button>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter mb-4 leading-[1.1]">
              {mode === 'book' ? (
                <>Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Session.</span></>
              ) : (
                <>Send Us A <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Message.</span></>
              )}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 max-w-md">
              {mode === 'book' 
                ? 'Schedule a meeting with our creative team directly. Choose a time that works for you.'
                : 'Have a quick question or general inquiry? Drop us a message below.'}
            </p>

            {status && (mode === 'message' || step !== 4) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-center gap-3 p-4 rounded-xl mb-6 font-medium ${
                  status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}
              >
                {status.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                {status.message}
              </motion.div>
            )}

            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-6 md:p-8 rounded-3xl backdrop-blur-sm">
              <AnimatePresence mode="wait">
                
                {/* MESSAGE MODE */}
                {mode === 'message' && (
                  <motion.div key="message" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                    <form className="flex flex-col gap-6" onSubmit={handleMessageSubmit}>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={messageData.name}
                          onChange={e => setMessageData(p => ({ ...p, name: e.target.value }))}
                          placeholder="John Doe"
                          className="bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-4 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-shadow"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="contact-email" className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                        <input
                          type="email"
                          id="contact-email"
                          required
                          value={messageData.email}
                          onChange={e => setMessageData(p => ({ ...p, email: e.target.value }))}
                          placeholder="john@example.com"
                          className="bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-4 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-shadow"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="message" className="text-sm font-medium text-gray-600 dark:text-gray-400">Message</label>
                        <textarea
                          id="message"
                          rows={4}
                          required
                          value={messageData.message}
                          onChange={e => setMessageData(p => ({ ...p, message: e.target.value }))}
                          placeholder="Tell us about your project..."
                          className="bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-4 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-shadow resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sendingMsg}
                        className="w-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-60"
                      >
                        {sendingMsg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                        {sendingMsg ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* BOOKING MODE */}
                {mode === 'book' && step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-black dark:text-white">1. Select Service & Date</h3>
                      <span className="text-sm font-bold text-cyan-500">Step 1 of 3</span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">What do you need help with?</label>
                        <select 
                          value={selectedService}
                          onChange={e => setSelectedService(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select a service</option>
                          {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                          <option value="General Inquiry">General Inquiry / Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Select a Date</label>
                        <input 
                          type="date"
                          min={today}
                          value={selectedDate}
                          onChange={e => setSelectedDate(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => setStep(2)}
                      disabled={!selectedService || !selectedDate}
                      className="w-full mt-4 bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Choose Time <ChevronRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2: Time Slot */}
                {mode === 'book' && step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-black dark:text-white">2. Select Time</h3>
                      <span className="text-sm font-bold text-cyan-500">Step 2 of 3</span>
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                      <Calendar className="w-4 h-4" />
                      Availability for {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>

                    {loadingSlots ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">No available slots on this date. Please select another date.</div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
                        {availableSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${
                              selectedSlot === slot 
                                ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg scale-105' 
                                : 'bg-white dark:bg-zinc-800 border-black/10 dark:border-white/10 text-black dark:text-white hover:border-cyan-500'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 mt-6">
                      <button onClick={() => setStep(1)} className="px-4 py-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
                      </button>
                      <button 
                        onClick={() => setStep(3)}
                        disabled={!selectedSlot}
                        className="flex-1 bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next: Your Details <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Details */}
                {mode === 'book' && step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-black dark:text-white">3. Your Details</h3>
                      <span className="text-sm font-bold text-cyan-500">Step 3 of 3</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <input type="text" required placeholder="Full Name" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="email" required placeholder="Email Address" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
                        <input type="tel" required placeholder="Phone Number" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none" />
                      </div>
                      <div>
                        <textarea rows={3} placeholder="Any notes or details about your project? (Optional)" value={details.notes} onChange={e => setDetails({...details, notes: e.target.value})} className="w-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-cyan-400 outline-none resize-none" />
                      </div>

                      <div className="bg-cyan-500/10 p-4 rounded-xl mt-4">
                        <p className="text-sm text-cyan-700 dark:text-cyan-400 font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4" /> Booking for {selectedService} on {new Date(selectedDate).toLocaleDateString()} at {selectedSlot}
                        </p>
                      </div>

                      <div className="flex gap-4 pt-2">
                        <button type="button" onClick={() => setStep(2)} className="px-4 py-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                          <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
                        </button>
                        <button 
                          type="submit"
                          disabled={submitting || !details.name || !details.email || !details.phone}
                          className="flex-1 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50"
                        >
                          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* STEP 4: Success */}
                {mode === 'book' && step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-4">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-black dark:text-white">Request Received!</h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                      Thank you, {details.name.split(' ')[0]}. We have received your booking request for {selectedSlot}. Our team will review and confirm shortly.
                    </p>
                    <button 
                      onClick={() => {
                        setStep(1);
                        setSelectedDate('');
                        setSelectedSlot('');
                        setDetails({ name: '', email: '', phone: '', notes: '' });
                      }}
                      className="mt-8 px-6 py-3 bg-black/5 dark:bg-white/5 text-black dark:text-white font-bold rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      Book Another Session
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
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
