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
  const [isConnected, setIsConnected] = useState(socket.connected);

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

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const handleNewMessage = (newMessage: Message) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMessage.id)) return prev;
        return [newMessage, ...prev];
      });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_message', handleNewMessage);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', handleNewMessage);
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
            {isConnected ? 'Real-time Active' : 'Disconnected'}
          </div>
          <div className="text-zinc-500 font-medium">
            {messages.filter(m => !m.isRead).length} Unread
          </div>
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
              className={`bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 ${
                !msg.isRead 
                  ? 'border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.1)] bg-cyan-50/10 dark:bg-cyan-500/5' 
                  : 'border-black/5 dark:border-white/5'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight truncate">{msg.name}</h3>
                    {!msg.isRead && (
                      <span className="px-3 py-1 bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shrink-0 shadow-lg shadow-cyan-500/20">NEW</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <a href={`mailto:${msg.email}`} className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 hover:text-cyan-500 transition-colors text-sm font-medium truncate max-w-full">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{msg.email}</span>
                    </a>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="relative group/msg">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-500 to-fuchsia-500 rounded-full opacity-20 group-hover/msg:opacity-100 transition-opacity" />
                    <p className="pl-6 text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap text-base md:text-lg">
                      {msg.message}
                    </p>
                  </div>
                </div>
                
                <div className="flex md:flex-col items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-black/5 dark:border-white/5">
                  <button 
                    onClick={() => markAsRead(msg.id, !msg.isRead)}
                    className={`flex-1 md:flex-none w-full md:w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                      msg.isRead 
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-500' 
                        : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    }`}
                    title={msg.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                  
                  <a 
                    href={`mailto:${msg.email}?subject=Reply to your message&body=Hi ${msg.name},\n\n`}
                    className="flex-1 md:flex-none w-full md:w-12 h-12 flex items-center justify-center bg-blue-500 text-white rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95"
                    title="Reply via Email"
                  >
                    <Mail className="w-6 h-6" />
                  </a>

                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    className="flex-1 md:flex-none w-full md:w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-300 group/del"
                    title="Delete message"
                  >
                    <Trash2 className="w-6 h-6 transition-transform group-hover/del:scale-110" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
