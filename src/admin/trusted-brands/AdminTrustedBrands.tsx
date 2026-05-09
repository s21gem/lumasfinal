import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Loader2, Award, Upload, Image as ImageIcon } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

interface Brand {
  id: string;
  name: string;
  logoUrl: string | null;
}

export default function AdminTrustedBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  const handleFileUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'lumas-portfolio/brands');
      formData.append('type', 'logo'); // Use the same auto-crop logic for logos if needed

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setNewLogoUrl(data.url);
    } catch (error) {
      alert('Logo upload failed');
    } finally {
      setUploadingLogo(false);
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
        body: JSON.stringify({ name: newName.trim(), logoUrl: newLogoUrl || null }),
      });
      if (res.ok) {
        const brand = await res.json();
        setBrands([...brands, brand]);
        setNewName('');
        setNewLogoUrl('');
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
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Brand name (e.g. NETFLIX, NIKE)"
              className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 focus:ring-2 focus:ring-cyan-400 outline-none"
            />
          </div>
          
          <div className="flex-1 flex gap-3 items-center">
            {newLogoUrl && (
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center p-2 border border-black/5">
                <img src={getMediaUrl(newLogoUrl)} alt="Preview" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2 cursor-pointer hover:border-cyan-400 transition-colors ${uploadingLogo ? 'opacity-50' : ''}`}>
              {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-zinc-400" />}
              <span className="text-zinc-500 text-sm whitespace-nowrap">{uploadingLogo ? 'Uploading...' : (newLogoUrl ? 'Change Logo' : 'Upload Logo (Optional)')}</span>
              <span className="text-[10px] text-zinc-400 whitespace-nowrap">📐 200×80px • PNG (transparent)</span>
              <input type="file" accept="image/*" className="hidden" disabled={uploadingLogo} onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }} />
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Add Brand
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
      ) : brands.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-12 text-center">
          <Award className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No brands yet</h3>
          <p className="text-zinc-500">Add brand names or logos to show in the scrolling marquee.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {brands.map((brand) => (
            <div key={brand.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-black/5 dark:border-white/5 px-5 py-3 flex items-center gap-4 group shadow-sm">
              {brand.logoUrl ? (
                <img src={getMediaUrl(brand.logoUrl)} alt={brand.name} className="h-6 w-auto object-contain" />
              ) : (
                <span className="font-bold text-lg tracking-tight">{brand.name}</span>
              )}
              <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-2 hidden group-hover:block"></div>
              <button
                onClick={() => handleDelete(brand.id)}
                className="p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                title="Delete Brand"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview */}
      {brands.length > 0 && (
        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 p-6 shadow-sm overflow-hidden">
          <h3 className="text-sm font-semibold text-zinc-500 mb-4">PREVIEW (Marquee)</h3>
          <div className="flex items-center gap-12 overflow-hidden bg-black/5 dark:bg-white/5 p-8 rounded-xl">
            {brands.map((b, i) => (
              <React.Fragment key={i}>
                {b.logoUrl ? (
                  <img src={getMediaUrl(b.logoUrl)} alt={b.name} className="h-8 md:h-12 w-auto object-contain opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
                ) : (
                  <span className="text-2xl font-black tracking-tighter text-black/20 dark:text-white/20 uppercase whitespace-nowrap">
                    {b.name}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
