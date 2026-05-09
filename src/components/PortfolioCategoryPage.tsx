import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useAnimationFrame, useMotionValue } from 'motion/react';
import { ArrowLeft, Play, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMediaUrl } from '../utils/media';

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

const ProjectMedia = ({ project, onPlay }: { project: Project, onPlay: () => void }) => {
  if (project.contentType !== 'video' || !project.videoUrl) {
    return (
      <>
        {project.thumbnailUrl ? (
          <img
            src={getMediaUrl(project.thumbnailUrl)}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
            No Preview
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full h-full relative group">
      {project.thumbnailUrl ? (
        <img
          src={getMediaUrl(project.thumbnailUrl)}
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
          No Preview
        </div>
      )}
      <button
        onClick={onPlay}
        className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors"
      >
        <div className="w-16 h-16 rounded-full bg-cyan-400/90 backdrop-blur-sm flex items-center justify-center text-black shadow-xl transform group-hover:scale-110 transition-transform duration-300">
          <Play className="w-6 h-6 ml-1" fill="currentColor" />
        </div>
      </button>
    </div>
  );
};

const ProjectCard = ({ project, isRow = false, onPlay }: { project: Project, isRow?: boolean, onPlay: () => void }) => (
  <div className={`flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-black/5 dark:border-white/5 ${isRow ? 'w-[240px] md:w-[280px] lg:w-[320px] shrink-0' : 'w-full'}`}>
    {/* Media */}
    <div className="w-full aspect-video relative bg-zinc-100 dark:bg-black">
      <ProjectMedia project={project} onPlay={onPlay} />
    </div>
    
    {/* Info */}
    <div className="p-3 flex flex-col justify-center shrink-0">
      {project.clientName && (
        <span className="text-cyan-500 dark:text-cyan-400 text-[9px] font-black tracking-[0.2em] uppercase mb-1 block">
          {project.clientName}
        </span>
      )}
      <h2 className="text-sm md:text-base font-black tracking-tight text-black dark:text-white leading-snug mb-1 line-clamp-1">
        {project.title}
      </h2>
      {project.shortDescription && (
        <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed mb-2 line-clamp-2">
          {project.shortDescription}
        </p>
      )}
      {project.results && (
        <div className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 px-2 py-1 rounded-lg w-fit mt-auto">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
          <span className="font-bold text-[9px] text-black dark:text-white">{project.results}</span>
        </div>
      )}
    </div>
  </div>
);

const ProjectColumnSet = React.forwardRef(({ projects, onPlay }: { projects: Project[], onPlay: (p: Project) => void }, ref: React.ForwardedRef<HTMLDivElement>) => (
  <div ref={ref} className="flex flex-col gap-6 pb-6">
    {projects.map((project, index) => (
      <ProjectCard key={`${project.id}-${index}`} project={project} isRow={false} onPlay={() => onPlay(project)} />
    ))}
  </div>
));

const ProjectRowSet = React.forwardRef(({ projects, onPlay }: { projects: Project[], onPlay: (p: Project) => void }, ref: React.ForwardedRef<HTMLDivElement>) => (
  <div ref={ref} className="flex flex-row gap-4 pr-4">
    {projects.map((project, index) => (
      <ProjectCard key={`${project.id}-${index}`} project={project} isRow={true} onPlay={() => onPlay(project)} />
    ))}
  </div>
));

export interface InfiniteScrollHandle {
  scrollBy: (amount: number) => void;
}

const InfiniteColumn = React.forwardRef(({ projects, direction, speed = 1, onPlay }: { projects: Project[], direction: 'up' | 'down', speed?: number, onPlay: (p: Project) => void }, ref: React.ForwardedRef<InfiniteScrollHandle>) => {
  const [contentHeight, setContentHeight] = useState(0);
  const setRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const velocityFactor = useMotionValue(1);
  const isDragging = useRef(false);
  const lastY = useRef(0);

  const duplicatedProjects = [...projects, ...projects, ...projects, ...projects];

  useEffect(() => {
    if (!setRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContentHeight(entries[0].target.offsetHeight);
    });
    observer.observe(setRef.current);
    return () => observer.disconnect();
  }, [projects]);

  React.useImperativeHandle(ref, () => ({
    scrollBy: (amount: number) => {
      let newY = y.get() + amount;
      if (contentHeight > 0) {
        if (newY <= -contentHeight) newY += contentHeight;
        else if (newY >= 0) newY -= contentHeight;
      }
      y.set(newY);
    }
  }));

  useAnimationFrame((t, delta) => {
    if (isDragging.current || contentHeight === 0) return;
    let moveBy = (direction === 'up' ? -1 : 1) * speed * velocityFactor.get() * (delta / 16);
    let newY = y.get() + moveBy;
    if (newY <= -contentHeight) newY += contentHeight;
    else if (newY >= 0) newY -= contentHeight;
    y.set(newY);
  });

  const handleWheel = (e: React.WheelEvent) => {
    let newY = y.get() - e.deltaY;
    if (contentHeight > 0) {
      if (newY <= -contentHeight) newY += contentHeight;
      else if (newY >= 0) newY -= contentHeight;
    }
    y.set(newY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - lastY.current;
    lastY.current = currentY;

    let newY = y.get() + deltaY;
    if (contentHeight > 0) {
      if (newY <= -contentHeight) newY += contentHeight;
      else if (newY >= 0) newY -= contentHeight;
    }
    y.set(newY);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div 
      className="w-full h-full overflow-hidden"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <motion.div style={{ y }} className="flex flex-col">
        <ProjectColumnSet ref={setRef} projects={projects} onPlay={onPlay} />
        <ProjectColumnSet projects={projects} onPlay={onPlay} />
        <ProjectColumnSet projects={projects} onPlay={onPlay} />
        <ProjectColumnSet projects={projects} onPlay={onPlay} />
      </motion.div>
    </div>
  );
});

const InfiniteRow = React.forwardRef(({ projects, direction, speed = 1, onPlay }: { projects: Project[], direction: 'left' | 'right', speed?: number, onPlay: (p: Project) => void }, ref: React.ForwardedRef<InfiniteScrollHandle>) => {
  const [contentWidth, setContentWidth] = useState(0);
  const setRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const velocityFactor = useMotionValue(1);
  const isDragging = useRef(false);
  const lastX = useRef(0);

  const duplicatedProjects = [...projects, ...projects, ...projects, ...projects, ...projects, ...projects];

  useEffect(() => {
    if (!setRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContentWidth(entries[0].target.offsetWidth);
    });
    observer.observe(setRef.current);
    return () => observer.disconnect();
  }, [projects]);

  React.useImperativeHandle(ref, () => ({
    scrollBy: (amount: number) => {
      let newX = x.get() + amount;
      if (contentWidth > 0) {
        if (newX <= -contentWidth) newX += contentWidth;
        else if (newX >= 0) newX -= contentWidth;
      }
      x.set(newX);
    }
  }));

  useAnimationFrame((t, delta) => {
    if (isDragging.current || contentWidth === 0) return;
    let moveBy = (direction === 'left' ? -1 : 1) * speed * velocityFactor.get() * (delta / 16);
    let newX = x.get() + moveBy;
    if (newX <= -contentWidth) newX += contentWidth;
    else if (newX >= 0) newX -= contentWidth;
    x.set(newX);
  });

  const handleWheel = (e: React.WheelEvent) => {
    let newX = x.get() - (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY);
    if (contentWidth > 0) {
      if (newX <= -contentWidth) newX += contentWidth;
      else if (newX >= 0) newX -= contentWidth;
    }
    x.set(newX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    lastX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - lastX.current;
    lastX.current = currentX;

    let newX = x.get() + deltaX;
    if (contentWidth > 0) {
      if (newX <= -contentWidth) newX += contentWidth;
      else if (newX >= 0) newX -= contentWidth;
    }
    x.set(newX);
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div className="relative group/row">
      <div 
        className="w-full py-2 overflow-visible"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseEnter={() => velocityFactor.set(0.1)}
        onMouseLeave={() => velocityFactor.set(1)}
      >
        <motion.div style={{ x }} className="flex flex-row w-max">
          <ProjectRowSet ref={setRef} projects={projects} onPlay={onPlay} />
          <ProjectRowSet projects={projects} onPlay={onPlay} />
          <ProjectRowSet projects={projects} onPlay={onPlay} />
          <ProjectRowSet projects={projects} onPlay={onPlay} />
          <ProjectRowSet projects={projects} onPlay={onPlay} />
          <ProjectRowSet projects={projects} onPlay={onPlay} />
        </motion.div>
      </div>

      {/* Row Navigation Buttons (Visible on hover) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 z-10 hidden md:flex">
        <button 
          onClick={() => {
            let amount = direction === 'left' ? 300 : -300;
            let newX = x.get() + amount;
            if (contentWidth > 0) {
              if (newX <= -contentWidth) newX += contentWidth;
              else if (newX >= 0) newX -= contentWidth;
            }
            x.set(newX);
          }}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto"
          title="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
        </button>
        <button 
          onClick={() => {
            let amount = direction === 'left' ? -300 : 300;
            let newX = x.get() + amount;
            if (contentWidth > 0) {
              if (newX <= -contentWidth) newX += contentWidth;
              else if (newX >= 0) newX -= contentWidth;
            }
            x.set(newX);
          }}
          className="w-10 h-10 rounded-full bg-white/90 dark:bg-black/90 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all pointer-events-auto"
          title="Scroll Right"
        >
          <ChevronRight className="w-5 h-5 text-black dark:text-white" />
        </button>
      </div>
    </div>
  );
});

export default function PortfolioCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const decodedCategory = decodeURIComponent(category || '');

  const row1Ref = useRef<InfiniteScrollHandle>(null);
  const row2Ref = useRef<InfiniteScrollHandle>(null);
  const colRef = useRef<InfiniteScrollHandle>(null);

  const [activeVideo, setActiveVideo] = useState<Project | null>(null);

  useEffect(() => {
    if (category) {
      fetch(`/api/projects/category/${encodeURIComponent(decodedCategory)}`)
        .then(r => r.json())
        .then(setProjects)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category]);

  const handleManualColNav = (amount: number) => {
    if (colRef.current) colRef.current.scrollBy(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-28">
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-cyan-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white pt-28 px-6">
        <div className="max-w-7xl mx-auto py-20 text-center">
          <p className="text-xl text-zinc-500">No projects in this category yet.</p>
          <Link to="/" className="text-cyan-500 font-medium mt-4 inline-block hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const row1Projects = projects.filter((_, i) => i % 2 === 0);
  const row2Projects = projects.filter((_, i) => i % 2 === 1);

  return (
    <div className="h-screen bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white flex flex-col overflow-hidden relative">
      {/* Header with significantly reduced size */}
      <div className="pt-20 pb-4 px-6 bg-zinc-50 dark:bg-zinc-950 border-b border-black/5 dark:border-white/5 flex-shrink-0 z-10 shadow-sm relative">
        <div className="max-w-[1800px] mx-auto flex flex-row justify-between items-end gap-4 relative z-10">
          <div>
            <Link to="/#portfolio" className="inline-flex items-center gap-2 text-cyan-500 hover:text-cyan-400 font-medium mb-2 transition-colors uppercase tracking-widest text-[10px]">
              <ArrowLeft className="w-3 h-3" />
              Back to Portfolio
            </Link>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none">
              {decodedCategory}
            </h1>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-medium">
              {projects.length} projects
            </p>
          </div>
        </div>
      </div>

      <div className="flex-grow flex relative w-full h-full max-w-[1800px] mx-auto overflow-hidden">
        
        {/* Mobile View: Vertical Single Column */}
        <div className="md:hidden w-full h-full px-6 pt-4 pb-12 relative">
          <InfiniteColumn ref={colRef} projects={projects} direction="up" speed={1.5} onPlay={(p) => setActiveVideo(p)} />
          
          <div className="absolute right-6 bottom-4 flex flex-col gap-3 z-20">
            <button 
              onClick={() => handleManualColNav(400)}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-black/5 dark:border-white/5 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronUp className="w-4 h-4 text-black dark:text-white" />
            </button>
            <button 
              onClick={() => handleManualColNav(-400)}
              className="w-10 h-10 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-black/5 dark:border-white/5 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronDown className="w-4 h-4 text-black dark:text-white" />
            </button>
          </div>
        </div>

        {/* Desktop View: Single Horizontal Row */}
        <div className="hidden md:flex items-center justify-center h-full w-full overflow-hidden">
          <InfiniteRow ref={row1Ref} projects={projects} direction="left" speed={1.5} onPlay={(p) => setActiveVideo(p)} />
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 z-10"
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white z-20 transition-colors"
            >
              ✕
            </button>
            {activeVideo.videoUrl?.includes('youtube.com') || activeVideo.videoUrl?.includes('youtu.be') ? (
              <iframe
                src={activeVideo.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + "?autoplay=1"}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : activeVideo.videoUrl?.includes('drive.google.com') ? (
              <iframe
                src={activeVideo.videoUrl.replace('/view', '/preview')}
                className="w-full h-full border-0"
                allow="autoplay"
                allowFullScreen
              ></iframe>
            ) : (
              <video
                src={getMediaUrl(activeVideo.videoUrl!, 'video')}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
              />
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
