import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Play, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  category: string;
  clientName: string | null;
  shortDescription: string | null;
  results: string | null;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  contentType: string;
}

export default function PortfolioCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const decodedCategory = decodeURIComponent(category || '');

  useEffect(() => {
    if (category) {
      fetch(`/api/projects/category/${encodeURIComponent(decodedCategory)}`)
        .then(r => r.json())
        .then(setProjects)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category]);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Header */}
      <div className="pt-28 pb-16 px-6 bg-zinc-50 dark:bg-zinc-950 border-b border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <Link to="/#portfolio" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 font-medium mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter mb-4"
          >
            {decodedCategory}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400 text-lg"
          >
            {projects.length} project{projects.length !== 1 ? 's' : ''} in this category
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-zinc-500">No projects in this category yet.</p>
            <Link to="/" className="text-cyan-500 font-medium mt-4 inline-block hover:underline">Go Home</Link>
          </div>
        ) : (
          <div className="space-y-20">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 items-center`}
              >
                {/* Media */}
                <div className="w-full lg:w-3/5 relative rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 aspect-video group">
                  {playingId === project.id && project.videoUrl ? (
                    <video
                      src={project.videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      autoPlay
                    />
                  ) : (
                    <>
                      {project.thumbnailUrl ? (
                        <img
                          src={project.thumbnailUrl}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                          No Preview
                        </div>
                      )}
                      {project.videoUrl && project.contentType === 'video' && (
                        <button
                          onClick={() => setPlayingId(project.id)}
                          className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"
                        >
                          <div className="w-20 h-20 rounded-full bg-cyan-400/90 backdrop-blur-sm flex items-center justify-center text-black shadow-xl transform group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-8 h-8 ml-1" fill="currentColor" />
                          </div>
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Info */}
                <div className="w-full lg:w-2/5 flex flex-col justify-center">
                  {project.clientName && (
                    <span className="text-cyan-500 dark:text-cyan-400 text-sm font-bold tracking-wider uppercase mb-3">
                      {project.clientName}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                    {project.title}
                  </h2>
                  {project.shortDescription && (
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
                      {project.shortDescription}
                    </p>
                  )}
                  {project.results && (
                    <div className="inline-flex items-center gap-3 bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 px-5 py-3 rounded-xl w-fit">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="font-bold text-lg">{project.results}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
