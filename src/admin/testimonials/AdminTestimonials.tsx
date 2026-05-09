import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Quote, Loader2 } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

interface Testimonial {
  id: string;
  clientName: string;
  role: string | null;
  company: string | null;
  quote: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials/all');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setTestimonials(testimonials.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting testimonial', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">Testimonials</h1>
          <p className="text-zinc-500 mt-1">Manage client stories and reviews.</p>
        </div>
        <Link
          to="/admin/testimonials/new"
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-12 text-center">
          <Quote className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No testimonials yet</h3>
          <p className="text-zinc-500 mb-6">Add client stories to display on the website.</p>
          <Link to="/admin/testimonials/new" className="text-cyan-500 font-bold hover:underline">Add First Testimonial</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 p-6 shadow-sm group relative">
              <Quote className="w-8 h-8 text-cyan-400/20 mb-3" />
              <p className="text-zinc-700 dark:text-zinc-300 mb-4 line-clamp-3">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                {t.imageUrl ? (
                  <img src={getMediaUrl(t.imageUrl)} alt={t.clientName} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-500 font-bold text-sm">
                    {t.clientName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{t.clientName}</p>
                  <p className="text-zinc-500 text-xs">{[t.role, t.company].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/admin/testimonials/edit/${t.id}`}
                  className="p-2 text-zinc-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
