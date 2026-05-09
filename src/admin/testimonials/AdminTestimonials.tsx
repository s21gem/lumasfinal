import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Quote, Loader2, GripVertical, Save } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

interface Testimonial {
  id: string;
  clientName: string;
  role: string | null;
  company: string | null;
  quote: string;
  imageUrl: string | null;
  createdAt: string;
  sortOrder: number;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

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

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;
    
    let _testimonials = [...testimonials];
    const draggedItemContent = _testimonials.splice(dragItem.current, 1)[0];
    _testimonials.splice(dragOverItem.current, 0, draggedItemContent);
    
    _testimonials = _testimonials.map((t, index) => ({ ...t, sortOrder: index }));
    
    setTestimonials(_testimonials);
    dragItem.current = null;
    dragOverItem.current = null;

    setIsSavingOrder(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/testimonials/reorder', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          items: _testimonials.map(t => ({ id: t.id, sortOrder: t.sortOrder }))
        })
      });
    } catch (error) {
      console.error('Failed to save order', error);
    } finally {
      setIsSavingOrder(false);
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
          <p className="text-zinc-500 mt-1">Manage client stories and their display order (drag to reorder).</p>
        </div>
        <div className="flex items-center gap-4">
          {isSavingOrder && (
            <span className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving order...
            </span>
          )}
          <Link
            to="/admin/testimonials/new"
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add Testimonial
          </Link>
        </div>
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
        <div className="flex flex-col gap-4">
          {testimonials.map((t, index) => (
            <div
              key={t.id}
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 p-4 shadow-sm group relative flex items-center gap-6 cursor-move hover:border-cyan-500/50 transition-colors"
            >
              <div className="text-zinc-400 cursor-grab active:cursor-grabbing p-2">
                <GripVertical className="w-6 h-6" />
              </div>
              
              <div className="flex items-center gap-4 w-48 shrink-0">
                {t.imageUrl ? (
                  <img src={getMediaUrl(t.imageUrl)} alt={t.clientName} className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-500 font-bold text-lg">
                    {t.clientName.charAt(0)}
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-bold text-sm truncate">{t.clientName}</p>
                  <p className="text-zinc-500 text-xs truncate">{[t.role, t.company].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              
              <div className="flex-1 relative">
                <Quote className="w-4 h-4 text-cyan-400/20 absolute -left-2 -top-2" />
                <p className="text-zinc-700 dark:text-zinc-300 text-sm line-clamp-2 pl-4 italic">"{t.quote}"</p>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                <Link
                  to={`/admin/testimonials/edit/${t.id}`}
                  className="p-2 text-zinc-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(t.id);
                  }}
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
