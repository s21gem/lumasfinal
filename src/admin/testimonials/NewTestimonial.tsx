import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

export default function NewTestimonial() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    clientName: '',
    role: '',
    company: '',
    quote: '',
    videoUrl: '',
    imageUrl: '',
    ytSubscribers: '',
    ytViews: '',
    igFollowers: '',
    fbFollowers: '',
    tiktokFollowers: '',
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
        ytSubscribers: data.ytSubscribers || '',
        ytViews: data.ytViews || '',
        igFollowers: data.igFollowers || '',
        fbFollowers: data.fbFollowers || '',
        tiktokFollowers: data.tiktokFollowers || '',
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

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'lumas-portfolio/testimonials/videos');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, videoUrl: data.url }));
    } catch {
      alert('Video upload failed. Check Cloudinary config or file size.');
    } finally {
      setUploadingVideo(false);
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
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 1920×1080px (16:9) or 1080×1920px (9:16 Reels) • MP4/WebM • Max 100MB</p>
              <input type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} className={inputClass} placeholder="https://youtube.com/watch?v=... or upload below" />
              <label className={`mt-2 flex items-center justify-center gap-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-3 cursor-pointer hover:border-cyan-400 transition-colors ${uploadingVideo ? 'opacity-50' : ''}`}>
                {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-zinc-400" />}
                <span className="text-zinc-500 text-sm">{uploadingVideo ? 'Uploading Video...' : 'Upload Video File'}</span>
                <input type="file" accept="video/*" className="hidden" disabled={uploadingVideo} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleVideoUpload(file);
                }} />
              </label>
              {formData.videoUrl && (
                <div className="mt-4 w-full aspect-video rounded-xl overflow-hidden bg-black border border-black/5 dark:border-white/5">
                  {formData.videoUrl.includes('youtube.com') || formData.videoUrl.includes('youtu.be') ? (
                    <iframe
                      src={formData.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full border-0"
                      allowFullScreen
                    ></iframe>
                  ) : formData.videoUrl.includes('drive.google.com') ? (
                    <iframe
                      src={formData.videoUrl.replace('/view', '/preview')}
                      className="w-full h-full border-0"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video
                      src={getMediaUrl(formData.videoUrl, 'video')}
                      className="w-full h-full object-contain"
                      controls
                    ></video>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Video Thumbnail / Image</label>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 400×400px (1:1 Square) • JPG/PNG/WebP • Max 5MB</p>
              <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputClass} placeholder="Image URL or upload below" />
              <label className={`mt-2 flex items-center justify-center gap-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-3 cursor-pointer hover:border-cyan-400 transition-colors ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-zinc-400" />}
                <span className="text-zinc-500 text-sm">{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }} />
              </label>
              {formData.imageUrl && (
                <div className="mt-3 w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/5">
                  <img src={getMediaUrl(formData.imageUrl)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Media Stats (Optional) */}
        <div className="border-t border-black/5 dark:border-white/5 pt-6">
          <h3 className="text-lg font-bold mb-2">Social Media Stats</h3>
          <p className="text-xs text-zinc-500 mb-4">Optional — leave empty to hide. Use shorthand like "1.2M", "500K", "10K+"</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                YT Subscribers
              </label>
              <input type="text" name="ytSubscribers" value={formData.ytSubscribers} onChange={handleChange} className={inputClass} placeholder="e.g. 1.2M" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                YT Total Views
              </label>
              <input type="text" name="ytViews" value={formData.ytViews} onChange={handleChange} className={inputClass} placeholder="e.g. 50M+" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                IG Followers
              </label>
              <input type="text" name="igFollowers" value={formData.igFollowers} onChange={handleChange} className={inputClass} placeholder="e.g. 500K" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                FB Followers
              </label>
              <input type="text" name="fbFollowers" value={formData.fbFollowers} onChange={handleChange} className={inputClass} placeholder="e.g. 200K" />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                TikTok Followers
              </label>
              <input type="text" name="tiktokFollowers" value={formData.tiktokFollowers} onChange={handleChange} className={inputClass} placeholder="e.g. 300K" />
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
