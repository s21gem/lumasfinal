import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, Plus, AlertCircle } from 'lucide-react';

interface Block {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string;
}

export default function ScheduleManager() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    fullDay: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/schedules/blocks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setBlocks(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/schedules/blocks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          date: formData.date,
          startTime: formData.fullDay ? null : formData.startTime,
          endTime: formData.fullDay ? null : formData.endTime,
          reason: formData.reason
        })
      });
      if (res.ok) {
        setFormData({ date: '', startTime: '', endTime: '', reason: '', fullDay: true });
        fetchBlocks();
      }
    } catch (error) {
      console.error('Failed to create block:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteBlock = async (id: string) => {
    if (!window.confirm('Delete this schedule block?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/schedules/blocks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBlocks();
      }
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Schedule Manager</h1>
        <p className="text-zinc-500">Block out dates or times when you are unavailable for meetings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add Block Form */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-500" />
            Add Unavailability
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-black dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="fullDay"
                checked={formData.fullDay}
                onChange={e => setFormData({...formData, fullDay: e.target.checked})}
                className="w-4 h-4 text-cyan-500 rounded border-gray-300"
              />
              <label htmlFor="fullDay" className="text-sm font-medium">Full Day Off</label>
            </div>

            {!formData.fullDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    required={!formData.fullDay}
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">End Time</label>
                  <input 
                    type="time" 
                    required={!formData.fullDay}
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-black dark:text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">Reason (Optional)</label>
              <input 
                type="text" 
                value={formData.reason}
                onChange={e => setFormData({...formData, reason: e.target.value})}
                placeholder="e.g., Public Holiday, On shoot"
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl px-4 py-3 text-black dark:text-white"
              />
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              {saving ? 'Adding...' : 'Add Block'}
            </button>
          </form>
        </div>

        {/* Existing Blocks List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-500" />
            Upcoming Blocks
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          ) : blocks.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5">
              <AlertCircle className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No schedule blocks found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blocks.map(block => (
                <div key={block.id} className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-5 flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-lg font-bold text-black dark:text-white">
                      <Calendar className="w-5 h-5 text-red-500" />
                      {new Date(block.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                      <Clock className="w-4 h-4" />
                      {block.startTime && block.endTime ? `${block.startTime} - ${block.endTime}` : 'Full Day'}
                    </div>
                    {block.reason && (
                      <div className="mt-2 text-sm italic bg-zinc-50 dark:bg-zinc-950 p-2 rounded border border-black/5 dark:border-white/5">
                        "{block.reason}"
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteBlock(block.id)}
                    className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 font-bold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Block
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
