import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

const ICON_OPTIONS = [
  'Lightbulb', 'PenTool', 'Camera', 'Scissors', 'Video', 'Film',
  'Settings', 'Zap', 'Target', 'Award', 'Star', 'TrendingUp',
  'CheckCircle', 'Send', 'Layers', 'Palette',
];

export default function NewProcessStep() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ number: '', title: '', description: '', iconIdentifier: 'Lightbulb' });

  useEffect(() => {
    if (isEditing) {
      fetch(`/api/process/${id}`).then(r => r.json()).then(data => {
        setFormData({ number: data.number || '', title: data.title || '', description: data.description || '', iconIdentifier: data.iconIdentifier || 'Lightbulb' });
      }).catch(() => setError('Failed to load')).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(isEditing ? `/api/process/${id}` : '/api/process', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save');
      navigate('/admin/process');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>;

  const inputClass = "w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-cyan-400 outline-none";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/process" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"><ArrowLeft className="w-6 h-6" /></Link>
        <h1 className="text-4xl font-black">{isEditing ? 'Edit Step' : 'New Process Step'}</h1>
      </div>
      {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Step Number *</label>
            <input type="text" value={formData.number} onChange={e => setFormData(p => ({ ...p, number: e.target.value }))} required className={inputClass} placeholder="01" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Title *</label>
            <input type="text" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required className={inputClass} placeholder="Strategy & Concept" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Description *</label>
          <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} required rows={3} className={inputClass + ' resize-none'} placeholder="We dig deep into your brand..." />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Icon</label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map(icon => (
              <button key={icon} type="button" onClick={() => setFormData(p => ({ ...p, iconIdentifier: icon }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.iconIdentifier === icon ? 'bg-cyan-400 text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <Link to="/admin/process" className="px-6 py-3 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditing ? 'Save Changes' : 'Create Step'}
          </button>
        </div>
      </form>
    </div>
  );
}
