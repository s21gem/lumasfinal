import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import CTAButton from './CTAButton';

interface TestimonialData {
  id: string;
  clientName: string;
  role: string | null;
  company: string | null;
  quote: string;
  videoUrl: string | null;
  imageUrl: string | null;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 2, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTestimonials = async (page: number) => {
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
    fetchTestimonials(currentPage);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setLoading(true);
    setCurrentPage(page);
  };

  // Fallback if no testimonials exist
  if (!loading && testimonials.length === 0 && pagination.total === 0) {
    return (
      <section className="py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-black/5 dark:border-white/5">
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
    <section className="py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-black/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white tracking-tighter mb-6">Client Stories</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our partners have to say.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-4 border-black/10 dark:border-white/10 border-t-cyan-400 rounded-full animate-spin" />
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
                    {testimonial.imageUrl ? (
                      <img
                        src={testimonial.imageUrl}
                        alt={`${testimonial.clientName} Testimonial`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 group-active:scale-105 group-focus:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 flex items-center justify-center">
                        <Quote className="w-20 h-20 text-white/20" />
                      </div>
                    )}
                    {testimonial.videoUrl && (
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 group-active:bg-black/40 group-focus:bg-black/40 transition-colors duration-500 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-cyan-400/90 backdrop-blur-sm flex items-center justify-center text-black shadow-xl transform group-hover:scale-110 group-active:scale-110 group-focus:scale-110 transition-transform duration-300 cursor-pointer">
                          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Quote Side */}
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 1 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full lg:w-1/2 flex flex-col justify-center"
                  >
                    <Quote className="w-12 h-12 text-cyan-400/20 mb-6" />
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
