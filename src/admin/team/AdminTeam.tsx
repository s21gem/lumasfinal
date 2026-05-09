import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Users, Settings2 } from 'lucide-react';
import { getMediaUrl } from '../../utils/media';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function AdminTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselDistance, setCarouselDistance] = useState(380);
  const [savingDistance, setSavingDistance] = useState(false);

  const fetchData = async () => {
    try {
      const [membersRes, settingsRes] = await Promise.all([
        fetch('/api/team'),
        fetch('/api/settings')
      ]);
      
      if (!membersRes.ok) throw new Error('Failed to fetch team members');
      const membersData = await membersRes.json();
      setMembers(membersData);

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCarouselDistance(settingsData.teamCarouselDistance || 380);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDistanceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDistance = parseInt(e.target.value, 10);
    setCarouselDistance(newDistance);
  };

  const saveDistance = async () => {
    setSavingDistance(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ teamCarouselDistance: carouselDistance }),
      });

      if (!response.ok) throw new Error('Failed to save settings');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingDistance(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/team/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete team member');
      
      setMembers(members.filter(m => m.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manage your team members and their roles.</p>
        </div>
        <Link
          to="/admin/team/new"
          className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add Member
        </Link>
      </div>

      {/* Settings Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings2 className="w-6 h-6 text-zinc-400" />
          <h3 className="text-xl font-bold">Display Settings</h3>
        </div>
        
        <div className="max-w-xl">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Desktop Carousel Distance (Radius)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="150"
              max="800"
              step="10"
              value={carouselDistance}
              onChange={handleDistanceChange}
              onMouseUp={saveDistance}
              onTouchEnd={saveDistance}
              className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
            />
            <span className="text-sm font-mono bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg min-w-[60px] text-center">
              {carouselDistance}px
            </span>
            {savingDistance && <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Adjust the distance between image cards in the 3D carousel. Decrease for fewer members, increase for more members.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden group">
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative">
              {member.imageUrl ? (
                <img
                  src={getMediaUrl(member.imageUrl)}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                  <ImageIcon className="w-12 h-12 opacity-50" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Link
                  to={`/admin/team/edit/${member.id}`}
                  className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform"
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-bold">{member.name}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">{member.role}</p>
            </div>
          </div>
        ))}

        {members.length === 0 && !error && (
          <div className="col-span-full text-center py-12 bg-white dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl">
            <Users className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No team members yet</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 mb-6">Add your first team member to get started.</p>
            <Link
              to="/admin/team/new"
              className="inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Member
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
