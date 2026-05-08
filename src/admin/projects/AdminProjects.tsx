import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Video } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  category: string;
  clientName: string;
  createdAt: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h1 className="text-4xl font-black">Manage Projects</h1>
        <Link 
          to="/admin/projects/new" 
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add New Project
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-zinc-500 mb-6">Create your first portfolio project to show it on the main site.</p>
            <Link to="/admin/projects/new" className="text-cyan-500 font-bold hover:underline">Create Project</Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/50">
                <th className="px-6 py-4 font-semibold text-zinc-500">Title</th>
                <th className="px-6 py-4 font-semibold text-zinc-500">Category</th>
                <th className="px-6 py-4 font-semibold text-zinc-500">Client</th>
                <th className="px-6 py-4 font-semibold text-zinc-500">Date Added</th>
                <th className="px-6 py-4 font-semibold text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id} className="border-b border-black/5 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold">{project.title}</td>
                  <td className="px-6 py-4">
                    <span className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-sm font-medium">
                      {project.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{project.clientName || '-'}</td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
