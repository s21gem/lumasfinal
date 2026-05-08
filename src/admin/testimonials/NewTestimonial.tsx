import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';

export default function NewTestimonial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    clientName: '',
    role: '',
    company: '',
    quote: '',
    videoUrl: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (isEditing) {
      fetchTestimonial();
    }
  }, [id]);

  const fetchTestimonial = async () => {
    try {
      const res = await fetch(`/api/testimonials/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setFormData({
        clientName: data.clientName || '',
        role: data.role || '',
        company: data.company || '',
        quote: data.quote || '',
        videoUrl: data.videoUrl || '',
        imageUrl: data.imageUrl || '',
      });
    } catch (err) {
      setError('Failed to load testimonial');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'lumas-portfolio/testimonials');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, imageUrl: data.url }));
    } catch {
      alert('Upload failed. Check Cloudinary config.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(isEditing ? `/api/testimonials/${id}` : '/api/testimonials', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save');
      navigate('/admin/testimonials');
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
        <Link to="/admin/testimonials" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-4xl font-black">{isEditing ? 'Edit Testimonial' : 'New Testimonial'}</h1>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Client Name *</label>
            <input type="text" name="clientName" value={formData.clientName} onChange={handleChange} required className={inputClass} placeholder="David Chen" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Role / Position</label>
            <input type="text" name="role" value={formData.role} onChange={handleChange} className={inputClass} placeholder="CMO" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Company</label>
          <input type="text" name="company" value={formData.company} onChange={handleChange} className={inputClass} placeholder="TechStart" />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Quote / Review *</label>
          <textarea name="quote" value={formData.quote} onChange={handleChange} required rows={4} className={inputClass + ' resize-none'} placeholder="What the client said about your work..." />
        </div>

        <div className="border-t border-black/5 dark:border-white/5 pt-6">
          <h3 className="text-lg font-bold mb-4">Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Video Testimonial URL</label>
              <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className={inputClass} placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Client Photo</label>
              <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputClass} placeholder="Image URL or upload below" />
              <label className={`mt-2 flex items-center justify-center gap-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-3 cursor-pointer hover:border-cyan-400 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-zinc-400" />}
                <span className="text-zinc-500 text-sm">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }} />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Link to="/admin/testimonials" className="px-6 py-3 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditing ? 'Save Changes' : 'Create Testimonial'}
          </button>
        </div>
      </form>
    </div>
  );
}
