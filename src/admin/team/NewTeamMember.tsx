import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

export default function NewTeamMember() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (isEditing) {
      const fetchMember = async () => {
        try {
          const response = await fetch(`/api/team/${id}`);
          if (!response.ok) throw new Error('Failed to fetch team member');
          const data = await response.json();
          setFormData({
            name: data.name || '',
            role: data.role || '',
            imageUrl: data.imageUrl || '',
          });
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchMember();
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const url = isEditing ? `/api/team/${id}` : '/api/team';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save team member');
      }

      navigate('/admin/team');
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          to="/admin/team"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Edit Team Member' : 'New Team Member'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {isEditing ? 'Update team member details.' : 'Add a new member to your team.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-black/5 dark:border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium">
              Role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              placeholder="e.g. Creative Director"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium">
              Image URL
            </label>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-2">📐 800×800px (1:1) • JPG/PNG/WebP • Max 5MB</p>
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-sm text-zinc-500 mt-2">
                  Provide a direct link to an image. Square images work best.
                </p>
              </div>
              
              <div className="w-24 h-24 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-black/5 dark:border-white/5 overflow-hidden flex items-center justify-center">
                {formData.imageUrl ? (
                  <img
                    src={getMediaUrl(formData.imageUrl)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <ImageIcon className={`w-8 h-8 text-zinc-400 ${formData.imageUrl ? 'hidden' : ''}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-black/5 dark:border-white/5 flex justify-end gap-4">
          <Link
            to="/admin/team"
            className="px-6 py-3 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEditing ? 'Update Member' : 'Save Member'}
          </button>
        </div>
      </form>
    </div>
  );
}
