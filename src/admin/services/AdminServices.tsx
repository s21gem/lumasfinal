import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Loader2, Zap, GripVertical } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  iconIdentifier: string | null;
  sortOrder: number;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) setServices(await res.json());
    } catch (error) {
      console.error('Failed to fetch services', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    let _services = [...services];
    const draggedItemContent = _services.splice(dragItem.current, 1)[0];
    _services.splice(dragOverItem.current, 0, draggedItemContent);

    _services = _services.map((s, index) => ({ ...s, sortOrder: index }));

    setServices(_services);
    dragItem.current = null;
    dragOverItem.current = null;

    setIsSavingOrder(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/services/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: _services.map(s => ({ id: s.id, sortOrder: s.sortOrder }))
        })
      });
    } catch (error) {
      console.error('Failed to save order', error);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting service', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">Services</h1>
          <p className="text-zinc-500 mt-1">Drag and drop services to reorder them.</p>
        </div>
        <div className="flex items-center gap-4">
          {isSavingOrder && (
            <span className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving order...
            </span>
          )}
          <Link to="/admin/services/new" className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Plus className="w-5 h-5" /> Add Service
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
      ) : services.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-12 text-center shadow-sm">
          <Zap className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No services yet</h3>
          <p className="text-zinc-500 mb-6">Add your services to display them on the website.</p>
          <Link to="/admin/services/new" className="text-cyan-500 font-bold hover:underline">Add First Service</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s, index) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 p-4 flex items-center gap-6 cursor-move hover:border-cyan-500/50 transition-colors group"
            >
              <div className="text-zinc-400 cursor-grab active:cursor-grabbing p-2">
                <GripVertical className="w-6 h-6" />
              </div>

              <div className="w-12 h-12 bg-cyan-400/10 rounded-xl flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">{s.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-1">{s.description}</p>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/admin/services/edit/${s.id}`} className="p-2 text-zinc-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
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
