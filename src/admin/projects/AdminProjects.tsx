import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Video, Image as ImageIcon, GripVertical, Loader2 } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

interface Project {
  id: string;
  title: string;
  category: string;
  clientName: string;
  thumbnailUrl: string | null;
  sortOrder: number;
  createdAt: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) return;

    let _projects = [...projects];
    const draggedItemContent = _projects.splice(dragItem.current, 1)[0];
    _projects.splice(dragOverItem.current, 0, draggedItemContent);

    _projects = _projects.map((p, index) => ({ ...p, sortOrder: index }));

    setProjects(_projects);
    dragItem.current = null;
    dragOverItem.current = null;

    setIsSavingOrder(true);
    try {
      const token = localStorage.getItem('adminToken');
      await fetch('/api/projects/reorder', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: _projects.map(p => ({ id: p.id, sortOrder: p.sortOrder }))
        })
      });
    } catch (error) {
      console.error('Failed to save order', error);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id));
      } else {
        alert('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black">Manage Projects</h1>
          <p className="text-zinc-500 mt-1">Drag and drop projects to reorder them on the website.</p>
        </div>
        <div className="flex items-center gap-4">
          {isSavingOrder && (
            <span className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin" /> Saving order...
            </span>
          )}
          <Link 
            to="/admin/projects/new" 
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Plus className="w-5 h-5" />
            Add New Project
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-zinc-500 mb-6">Create your first portfolio project to show it on the main site.</p>
            <Link to="/admin/projects/new" className="text-cyan-500 font-bold hover:underline">Create Project</Link>
          </div>
        ) : (
          projects.map((project, index) => (
            <div
              key={project.id}
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
              className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex items-center gap-6 cursor-move hover:border-cyan-500/50 transition-colors group"
            >
              <div className="text-zinc-400 cursor-grab active:cursor-grabbing p-2">
                <GripVertical className="w-6 h-6" />
              </div>

              <div className="w-12 h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center border border-black/5 dark:border-white/5 shrink-0">
                {project.thumbnailUrl ? (
                  <img src={getMediaUrl(project.thumbnailUrl)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold truncate">{project.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium text-zinc-600 dark:text-zinc-400">
                    {project.category}
                  </span>
                  {project.clientName && (
                    <span className="text-xs text-zinc-400">Client: {project.clientName}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link 
                  to={`/admin/projects/edit/${project.id}`}
                  className="p-2 text-zinc-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
