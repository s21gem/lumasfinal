import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Award } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  logoUrl: string | null;
}

export default function AdminTrustedBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => { fetchBrands(); }, []);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/trusted-brands');
      if (res.ok) setBrands(await res.json());
    } catch (error) {
      console.error('Failed to fetch brands', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch('/api/trusted-brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const brand = await res.json();
        setBrands([...brands, brand]);
        setNewName('');
      }
    } catch (error) {
      console.error('Error adding brand', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this brand?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/trusted-brands/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setBrands(brands.filter(b => b.id !== id));
    } catch (error) {
      console.error('Error deleting brand', error);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-black">Trusted Brands</h1>
        <p className="text-zinc-500 mt-1">Manage the "Trusted By" marquee on the homepage.</p>
      </div>

      {/* Quick Add Form */}
      <form onSubmit={handleAdd} className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 p-6 mb-8 shadow-sm">
        <label className="block text-sm font-semibold mb-3 text-zinc-600 dark:text-zinc-400">Add New Brand</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Brand name (e.g. NETFLIX, NIKE)"
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-cyan-400 outline-none"
          />
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Add
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
      ) : brands.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-12 text-center">
          <Award className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No brands yet</h3>
          <p className="text-zinc-500">Add brand names to show in the scrolling marquee.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-black/5 dark:border-white/5 px-5 py-3 flex items-center gap-3 group shadow-sm">
              <span className="font-bold text-lg tracking-tight">{brand.name}</span>
              <button
                onClick={() => handleDelete(brand.id)}
                className="p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {brands.length > 0 && (
        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-500 mb-4">PREVIEW (Marquee)</h3>
          <div className="flex gap-12 overflow-hidden">
            {brands.map((b, i) => (
              <span key={i} className="text-2xl font-black tracking-tighter text-black/20 dark:text-white/20 uppercase whitespace-nowrap">
                {b.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
