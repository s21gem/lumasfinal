import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Loader2, GitBranch } from 'lucide-react';

interface ProcessStepType {
  id: string;
  number: string;
  title: string;
  description: string;
  iconIdentifier: string | null;
}

export default function AdminProcess() {
  const [steps, setSteps] = useState<ProcessStepType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSteps(); }, []);

  const fetchSteps = async () => {
    try {
      const res = await fetch('/api/process');
      if (res.ok) setSteps(await res.json());
    } catch (error) {
      console.error('Failed to fetch process steps', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this process step?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/process/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setSteps(steps.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting step', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">Process Steps</h1>
          <p className="text-zinc-500 mt-1">Manage the workflow steps displayed on the website.</p>
        </div>
        <Link to="/admin/process/new" className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" /> Add Step
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
      ) : steps.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 p-12 text-center">
          <GitBranch className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No process steps yet</h3>
          <p className="text-zinc-500 mb-6">Define your workflow to display on the website.</p>
          <Link to="/admin/process/new" className="text-cyan-500 font-bold hover:underline">Add First Step</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-black/5 dark:border-white/5 p-6 shadow-sm flex items-center gap-6 group">
              <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-cyan-400">{step.number}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-zinc-500 text-sm line-clamp-1">{step.description}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Link to={`/admin/process/edit/${step.id}`} className="p-2 text-zinc-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(step.id)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
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
