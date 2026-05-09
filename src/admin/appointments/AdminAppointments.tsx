import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, XCircle, Trash2, Edit, MessageCircle, Send } from 'lucide-react';
import socket from '../../utils/socket';

interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  date: string;
  timeSlot: string;
  notes: string;
  status: string;
  createdAt: string;
}

const getEmailLink = (apt: Appointment) => {
  const subject = encodeURIComponent(`Regarding your appointment with Lumas Creative Studio`);
  let body = '';
  if (apt.status === 'APPROVED') {
    body = `Hi ${apt.clientName},\n\nGreat news! Your appointment for ${apt.serviceType} on ${new Date(apt.date).toLocaleDateString()} at ${apt.timeSlot} has been confirmed.\n\nLooking forward to our meeting.\n\nBest,\nLumas Creative Studio`;
  } else if (apt.status === 'REJECTED') {
    body = `Hi ${apt.clientName},\n\nThank you for reaching out. Unfortunately, we are unable to accommodate your appointment request for ${apt.serviceType} on ${new Date(apt.date).toLocaleDateString()} at ${apt.timeSlot}.\n\nPlease feel free to book another time slot on our website.\n\nBest,\nLumas Creative Studio`;
  } else {
    body = `Hi ${apt.clientName},\n\nRegarding your appointment request for ${apt.serviceType} on ${new Date(apt.date).toLocaleDateString()} at ${apt.timeSlot}...\n\n`;
  }
  return `mailto:${apt.clientEmail}?subject=${subject}&body=${encodeURIComponent(body)}`;
};

const getWhatsAppLink = (apt: Appointment) => {
  let body = '';
  if (apt.status === 'APPROVED') {
    body = `Hi ${apt.clientName},\n\nGreat news! Your appointment for *${apt.serviceType}* on *${new Date(apt.date).toLocaleDateString()}* at *${apt.timeSlot}* has been confirmed.\n\nLooking forward to our meeting.\n\nBest,\nLumas Creative Studio`;
  } else if (apt.status === 'REJECTED') {
    body = `Hi ${apt.clientName},\n\nThank you for reaching out. Unfortunately, we are unable to accommodate your appointment request for *${apt.serviceType}* on *${new Date(apt.date).toLocaleDateString()}* at *${apt.timeSlot}*.\n\nPlease feel free to book another time slot on our website.\n\nBest,\nLumas Creative Studio`;
  } else {
    body = `Hi ${apt.clientName},\n\nRegarding your appointment request for *${apt.serviceType}* on *${new Date(apt.date).toLocaleDateString()}* at *${apt.timeSlot}*...\n\n`;
  }
  const phone = apt.clientPhone.replace(/[\s+]/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED, CANCELLED

  useEffect(() => {
    fetchAppointments();

    socket.on('new_appointment', (newApt: Appointment) => {
      setAppointments(prev => [newApt, ...prev]);
      if (Notification.permission === "granted") {
        new Notification("New Appointment from " + newApt.clientName);
      }
    });

    socket.on('appointment_updated', (updatedApt: Appointment) => {
      setAppointments(prev => prev.map(a => a.id === updatedApt.id ? updatedApt : a));
    });

    return () => {
      socket.off('new_appointment');
      socket.off('appointment_updated');
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const deleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    }
  };

  const filteredAppointments = filter === 'ALL' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Appointments</h1>
          <p className="text-zinc-500">Manage client booking requests and schedules.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-black/5 dark:border-white/5">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
              filter === f 
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-105' 
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5">
          <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No appointments found</h3>
          <p className="text-zinc-500">You don't have any {filter.toLowerCase()} appointments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredAppointments.map((apt) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group"
            >
              <div className="flex-1 space-y-4 w-full">
                <div className="flex items-center justify-between md:justify-start gap-4">
                  <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-cyan-500" />
                    {apt.clientName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                    apt.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                    apt.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    apt.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                    'bg-zinc-100 text-zinc-700 dark:bg-zinc-500/20 dark:text-zinc-400'
                  }`}>
                    {apt.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    {new Date(apt.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    {apt.timeSlot}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 shrink-0" />
                    {apt.clientEmail}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" />
                    {apt.clientPhone}
                  </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-black/5 dark:border-white/5">
                  <div className="font-semibold text-black dark:text-white mb-1">Service: {apt.serviceType}</div>
                  {apt.notes && (
                    <p className="text-sm italic mt-2">"{apt.notes}"</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                {apt.status === 'PENDING' && (
                  <>
                    <button onClick={() => updateStatus(apt.id, 'APPROVED')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button onClick={() => updateStatus(apt.id, 'REJECTED')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </>
                )}
                {apt.status === 'APPROVED' && (
                  <button onClick={() => updateStatus(apt.id, 'CANCELLED')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg font-bold transition-colors">
                    <XCircle className="w-4 h-4" /> Cancel
                  </button>
                )}
                
                <div className="flex gap-2">
                  <a href={getEmailLink(apt)} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-bold transition-colors">
                    <Send className="w-4 h-4" /> Email
                  </a>
                  <a href={getWhatsAppLink(apt)} target="_blank" rel="noreferrer" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] px-4 py-2 rounded-lg font-bold transition-colors">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </div>

                <button onClick={() => deleteAppointment(apt.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-bold transition-colors mt-2 md:mt-0">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
