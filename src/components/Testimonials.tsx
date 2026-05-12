import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight, X } from 'lucide-react';
import CTAButton from './CTAButton';
import { getMediaUrl } from '../utils/media';
import { useData } from '../context/DataContext';

interface TestimonialData {
  id: string;
  clientName: string;
  role: string | null;
  company: string | null;
  quote: string;
  videoUrl: string | null;
  imageUrl: string | null;
  ytSubscribers: string | null;
  ytViews: string | null;
  igFollowers: string | null;
  fbFollowers: string | null;
  tiktokFollowers: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Dedicated component to handle synchronous play() calls for native videos
const TestimonialMedia = ({ testimonial }: { testimonial: TestimonialData }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  const isYouTube = testimonial.videoUrl?.includes('youtube.com') || testimonial.videoUrl?.includes('youtu.be');
  const isDrive = testimonial.videoUrl?.includes('drive.google.com');
  const isNativeVideo = testimonial.videoUrl && !isYouTube && !isDrive;

  return (
    <div className="w-full h-full relative group">
      {isNativeVideo && (
        <video
          ref={videoRef}
          src={getMediaUrl(testimonial.videoUrl, 'video')}
          className={`w-full h-full object-contain bg-black ${isPlaying ? 'block' : 'hidden'}`}
          controls={isPlaying}
          playsInline
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {(isYouTube || isDrive) && isPlaying && (
        <div className="w-full h-full bg-black">
          {isYouTube ? (
            <iframe
              src={testimonial.videoUrl!.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/') + "?autoplay=1"}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <iframe
              src={testimonial.videoUrl!.replace('/view', '/preview')}
              className="w-full h-full border-0"
              allow="autoplay"
              allowFullScreen
            ></iframe>
          )}
        </div>
      )}

      {!isPlaying && (
        <>
          {testimonial.imageUrl ? (
            <img
              src={getMediaUrl(testimonial.imageUrl)}
              alt={`${testimonial.clientName} Testimonial`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-active:scale-105 group-focus:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
              <Quote className="w-20 h-20 text-white/20" />
            </div>
          )}
          {testimonial.videoUrl && (
            <div 
              className="absolute inset-0 bg-black/20 group-hover:bg-black/40 group-active:bg-black/40 group-focus:bg-black/40 transition-colors duration-500 flex items-center justify-center cursor-pointer z-10"
              onClick={handlePlayClick}
            >
              <div className="w-16 h-16 rounded-full bg-cyan-500/90 backdrop-blur-sm flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 group-active:scale-110 group-focus:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function Testimonials() {
  const { testimonials: initialTestimonials, loading: globalLoading } = useData();
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(initialTestimonials.slice(0, 2));
  const [pagination, setPagination] = useState<PaginationData>({ 
    page: 1, 
    limit: 2, 
    total: initialTestimonials.length, 
    totalPages: Math.ceil(initialTestimonials.length / 2) 
  });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync with global data when it arrives
  useEffect(() => {
    if (!globalLoading && initialTestimonials.length > 0) {
      setTestimonials(initialTestimonials.slice(0, 2));
      setPagination({
        page: 1,
        limit: 2,
        total: initialTestimonials.length,
        totalPages: Math.ceil(initialTestimonials.length / 2)
      });
    }
  }, [globalLoading, initialTestimonials]);

  const fetchTestimonials = async (page: number) => {
    if (page === 1 && initialTestimonials.length > 0) {
       setTestimonials(initialTestimonials.slice(0, 2));
       setLoading(false);
       return;
    }
    try {
      const res = await fetch(`/api/testimonials?page=${page}&limit=2`);
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      fetchTestimonials(currentPage);
    }
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
  };

  // Fallback if no testimonials exist
  if (!loading && testimonials.length === 0 && pagination.total === 0) {
    return (
      <section className="py-24 bg-zinc-50 dark:bg-[#000d11] border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter mb-6">Client Stories</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our partners have to say.
            </p>
          </div>
          <p className="text-center text-zinc-500">Testimonials coming soon.</p>
          <div className="flex justify-center mt-12">
            <CTAButton text="Book a Meeting" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-zinc-50 dark:bg-[#000d11] border-t border-black/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter mb-6">Client Stories</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our partners have to say.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-24 mb-20"
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
                >
                  {/* Video/Image Side */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 1 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    tabIndex={0}
                    className="w-full lg:w-1/2 relative group rounded-3xl overflow-hidden aspect-video bg-zinc-200 dark:bg-zinc-900 focus:outline-none cursor-pointer"
                  >
                    <TestimonialMedia testimonial={testimonial} />
                  </motion.div>

                  {/* Quote Side */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 1 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full lg:w-1/2 flex flex-col justify-center"
                  >
                    <Quote className="w-12 h-12 text-cyan-500/20 mb-6" />
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-black dark:text-white leading-tight mb-8">
                      "{testimonial.quote}"
                    </h3>
                    
                    <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-6">
                      <div>
                        <p className="text-black dark:text-white font-bold text-lg">{testimonial.clientName}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {[testimonial.role, testimonial.company].filter(Boolean).join(', ')}
                        </p>
                      </div>
                      {testimonial.company && (
                        <div className="text-xl font-black tracking-widest text-black/30 dark:text-white/30 uppercase">
                          {testimonial.company}
                        </div>
                      )}
                    </div>

                    {/* Social Media Stats */}
                    {(testimonial.ytSubscribers || testimonial.ytViews || testimonial.igFollowers || testimonial.fbFollowers || testimonial.tiktokFollowers) && (
                      <div className="flex flex-wrap gap-3 mt-5">
                        {testimonial.ytSubscribers && (
                          <div className="flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-bold">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            {testimonial.ytSubscribers} subs
                          </div>
                        )}
                        {testimonial.ytViews && (
                          <div className="flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-bold">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            {testimonial.ytViews} views
                          </div>
                        )}
                        {testimonial.igFollowers && (
                          <div className="flex items-center gap-1.5 bg-pink-500/10 text-pink-600 dark:text-pink-400 px-3 py-1.5 rounded-full text-xs font-bold">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            {testimonial.igFollowers}
                          </div>
                        )}
                        {testimonial.fbFollowers && (
                          <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            {testimonial.fbFollowers}
                          </div>
                        )}
                        {testimonial.tiktokFollowers && (
                          <div className="flex items-center gap-1.5 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-full text-xs font-bold">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                            {testimonial.tiktokFollowers}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Pagination Numbers */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mb-20">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg scale-110'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex justify-center">
          <CTAButton text="Book a Meeting" />
        </div>
      </div>
    </section>
  );
}
