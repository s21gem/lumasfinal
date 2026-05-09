import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Upload } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';
import VideoPreview from '../VideoPreview';

export default function NewProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Commercial',
    clientName: '',
    shortDescription: '',
    results: '',
    videoUrl: '',
    thumbnailUrl: '',
    contentType: 'video',
  });

  const categories = ['Commercial', 'Real Estate', 'VSL', 'Documentary', 'Music Video', 'Corporate', 'Events', 'Podcast', 'Social Media Ads'];

  useEffect(() => {
    if (isEditing) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error('Failed to fetch project');
      const data = await res.json();
      setFormData({
        title: data.title || '',
        category: data.category || 'Commercial',
        clientName: data.clientName || '',
        shortDescription: data.shortDescription || '',
        results: data.results || '',
        videoUrl: data.videoUrl || '',
        thumbnailUrl: data.thumbnailUrl || '',
        contentType: data.contentType || 'video',
      });
    } catch (err) {
      setError('Failed to load project details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File, fieldName: string, setUploading: (v: boolean) => void) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'lumas-portfolio/projects');
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }
      const data = await res.json();
      setFormData(prev => ({ ...prev, [fieldName]: data.url }));
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
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
      const url = isEditing ? `/api/projects/${id}` : '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save project');
      }

      navigate('/admin/projects');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading project details...</div>;
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-cyan-400 outline-none";

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to="/admin/projects"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-4xl font-black">{isEditing ? 'Edit Project' : 'New Project'}</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-8 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Project Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="e.g. Nike Summer Campaign"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className={inputClass + ' appearance-none'}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Client Name</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. Nike Inc."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Short Description</label>
          <textarea
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            rows={3}
            className={inputClass + ' resize-none'}
            placeholder="Brief overview of the project..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Results / Impact</label>
          <input
            type="text"
            name="results"
            value={formData.results}
            onChange={handleChange}
            className={inputClass}
            placeholder="e.g. 2M+ Views, 45% Conversion Increase"
          />
        </div>

        <div className="border-t border-black/5 dark:border-white/5 pt-6 mt-6">
          <h3 className="text-lg font-bold mb-4">Media</h3>
          
          {/* Content Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Content Type</label>
            <div className="flex gap-2">
              {['video', 'image'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, contentType: type }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    formData.contentType === type ? 'bg-cyan-400 text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Video URL or Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">
                {formData.contentType === 'video' ? 'Video URL (YouTube/Vimeo/Direct)' : 'Image URL'}
              </label>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 {formData.contentType === 'video' ? 'Video: 1920×1080px (16:9) • MP4/WebM • Max 100MB' : 'Image: 1920×1080px (16:9) • JPG/PNG/WebP • Max 10MB'}</p>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className={inputClass}
                placeholder={formData.contentType === 'video' ? 'https://vimeo.com/...' : 'https://images.unsplash.com/...'}
              />
              <label className={`mt-3 flex items-center justify-center gap-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 cursor-pointer hover:border-cyan-400 transition-colors ${uploadingVideo ? 'opacity-50' : ''}`}>
                {uploadingVideo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-zinc-400" />}
                <span className="text-zinc-500 text-sm">{uploadingVideo ? 'Uploading...' : `Upload ${formData.contentType === 'video' ? 'Video' : 'Image'}`}</span>
                <input type="file" accept={formData.contentType === 'video' ? 'video/*' : 'image/*'} className="hidden" disabled={uploadingVideo} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'videoUrl', setUploadingVideo);
                }} />
              </label>
              {formData.videoUrl && (
                <div className="mt-4">
                  {formData.contentType === 'video' ? (
                    <VideoPreview url={formData.videoUrl} />
                  ) : (
                    <div className="w-32 h-40 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img src={getMediaUrl(formData.videoUrl)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-zinc-600 dark:text-zinc-400">Thumbnail Image</label>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 1280×720px (16:9) • JPG/PNG/WebP • Max 5MB</p>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleChange}
                className={inputClass}
                placeholder="https://images.unsplash.com/..."
              />
              <label className={`mt-3 flex items-center justify-center gap-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-4 cursor-pointer hover:border-cyan-400 transition-colors ${uploadingThumb ? 'opacity-50' : ''}`}>
                {uploadingThumb ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-zinc-400" />}
                <span className="text-zinc-500 text-sm">{uploadingThumb ? 'Uploading...' : 'Upload Thumbnail'}</span>
                <input type="file" accept="image/*" className="hidden" disabled={uploadingThumb} onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'thumbnailUrl', setUploadingThumb);
                }} />
              </label>
              {formData.thumbnailUrl && (
                <div className="mt-3 w-32 h-40 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                  <img src={getMediaUrl(formData.thumbnailUrl)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isEditing ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
