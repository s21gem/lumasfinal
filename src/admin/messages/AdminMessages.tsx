import React, { useEffect, useState } from 'react';
import { Mail, Trash2, CheckCircle, Clock } from 'lucide-react';
import socket from '../../utils/socket';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/messages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.on('new_message', (newMessage: Message) => {
      setMessages(prev => [newMessage, ...prev]);
      
      // Optional: Play sound or show browser notification
      if (Notification.permission === "granted") {
        new Notification("New Message from " + newMessage.name);
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, []);

  const markAsRead = async (id: string, isRead: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isRead })
      });
      setMessages(messages.map(m => m.id === id ? { ...m, isRead } : m));
    } catch (error) {
      console.error('Failed to update message');
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessages(messages.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete message');
    }
  };

  if (loading) return <div className="p-8 text-center text-zinc-500">Loading messages...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-black">Inbox</h1>
        <div className="text-zinc-500 font-medium">
          {messages.filter(m => !m.isRead).length} Unread
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 p-12 rounded-3xl border border-black/5 dark:border-white/5 text-center">
            <Mail className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-black/5 dark:border-white/5 transition-all ${!msg.isRead ? 'ring-2 ring-cyan-500 ring-inset' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{msg.name}</h3>
                    {!msg.isRead && (
                      <span className="px-2 py-0.5 bg-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">New</span>
                    )}
                  </div>
                  <a href={`mailto:${msg.email}`} className="text-cyan-600 dark:text-cyan-400 font-medium hover:underline mb-4 inline-block">
                    {msg.email}
                  </a>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    {msg.message}
                  </p>
                </div>
                
                <div className="flex md:flex-col gap-2 shrink-0">
                  <button 
                    onClick={() => markAsRead(msg.id, !msg.isRead)}
                    className={`p-2 rounded-xl transition-colors ${msg.isRead ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500' : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600'}`}
                    title={msg.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-xl transition-colors hover:bg-red-200 dark:hover:bg-red-500/30"
                    title="Delete message"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1.5 text-[12px] text-zinc-400 font-medium px-2 py-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
