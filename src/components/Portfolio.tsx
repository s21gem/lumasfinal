import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { getMediaUrl } from '../utils/media';

interface Project {
  id: string;
  title: string;
  category: string;
  clientName: string | null;
  results: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  contentType: string;
}

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { setProjects(data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Derive unique categories from projects
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

  const filteredItems = activeFilter === 'All' 
    ? projects 
    : projects.filter(item => item.category === activeFilter);

  const handleCardClick = (category: string) => {
    navigate(`/portfolio/${encodeURIComponent(category)}`);
  };

  return (
    <section id="portfolio" className="py-24 bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter mb-4">Our Work</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl">
              We don't just make things look pretty. We build creative assets designed to convert.
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeFilter === category 
                    ? 'bg-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]' 
                    : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-black/10 active:bg-black/10 dark:hover:bg-white/10 dark:active:bg-white/10 hover:text-black active:text-black dark:hover:text-white dark:active:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <p className="text-xl">No projects found. Add projects from the admin panel.</p>
          </div>
        ) : (
          /* Grid */
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  tabIndex={0}
                  onClick={() => handleCardClick(item.category)}
                  className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer bg-zinc-100 dark:bg-zinc-900 focus:outline-none"
                >
                  {/* Thumbnail Image */}
                  {item.thumbnailUrl ? (
                    <img 
                      src={getMediaUrl(item.thumbnailUrl)} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-active:scale-105 group-focus:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : item.videoUrl && item.contentType === 'video' && !item.videoUrl.includes('youtube.com') && !item.videoUrl.includes('youtu.be') && !item.videoUrl.includes('drive.google.com') ? (
                    <video
                      src={getMediaUrl(item.videoUrl, 'video')}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      loop
                      onMouseEnter={e => (e.target as HTMLVideoElement).play().catch(() => {})}
                      onMouseLeave={e => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0; }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                      No Preview
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/70 group-active:bg-black/70 group-focus:bg-black/70 transition-colors duration-500 z-10" />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end z-20 opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-500 translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 group-focus:translate-y-0">
                    {item.clientName && (
                      <span className="text-cyan-400 text-sm font-bold tracking-wider uppercase mb-2">
                        {item.clientName}
                      </span>
                    )}
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                      {item.title}
                    </h3>
                    <div className="h-px w-12 bg-cyan-400/50 my-4" />
                    <p className="text-gray-300 text-sm mb-4">
                      {item.category}
                    </p>
                    {item.results && (
                      <div className="inline-flex items-center gap-2 text-white font-semibold bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg w-fit">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        {item.results}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
