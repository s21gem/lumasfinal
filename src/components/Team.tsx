import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { getMediaUrl } from '../utils/media';
import { useData } from '../context/DataContext';
import { TeamSkeleton } from './ui/Skeleton';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  imageUrl: string | null;
}

export default function Team() {
  const { teamMembers, settings, loading } = useData();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const carouselY = useTransform(scrollYProgress, [0, 1], [200, -200]);

  if (loading) {
    return (
      <section ref={containerRef} className="relative min-h-screen bg-white dark:bg-[#000d11] overflow-hidden flex flex-col items-center justify-center py-24 md:py-32">
        <TeamSkeleton />
      </section>
    );
  }

  if (!settings) return null;

  const carouselDistance = settings.teamCarouselDistance ?? 380;
  const cardSize = settings.teamCarouselCardSize ?? 280;
  const isGrayscale = settings.teamCarouselGrayscale ?? true;
  const headerTitle = settings.teamHeaderTitle ?? 'Compact team,';
  const headerHighlight = settings.teamHeaderHighlight ?? 'Big Production.';
  const bgText = settings.teamBackgroundText ?? 'big results';
  const bgTextSize = settings.teamBackgroundTextSize ?? 50;
  const bgTextLineHeight = settings.teamBackgroundTextLineHeight ?? 0.9;
  const stairOffset = settings.teamCarouselStairOffset ?? 100;

  // Remove the static random yOffsets. We will calculate it dynamically.
  const rotations = [-4, 3, -5, 4, -3, 5, -6, 2, -4, 3, -5, 4];

  return (
    <section ref={containerRef} className="relative min-h-screen bg-white dark:bg-[#000d11] overflow-hidden flex flex-col items-center justify-center py-24 md:py-32">
      <style>{`
        .perspective-container {
          perspective: 1200px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .carousel-card {
          --tz: ${carouselDistance}px;
        }
      `}</style>
      <style>{`
        .carousel-card {
          transition: z-index 0s, transform 0.4s ease, filter 0.5s ease;
        }
        .carousel-card:hover {
          z-index: 100 !important;
          transform: rotateY(var(--card-angle)) translateZ(var(--tz)) translateY(var(--card-y)) rotateZ(0deg) scale(1.15) !important;
          filter: grayscale(0) !important;
        }
      `}</style>

      {/* Massive Background Text with Parallax */}
      <motion.div
        style={{ y: textY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
      >
        <h2 
          className="font-black text-cyan-600/15 dark:text-white/10 tracking-tighter text-center lowercase select-none whitespace-pre-line"
          style={{
            fontSize: `clamp(40px, ${bgTextSize}vw, 800px)`,
            lineHeight: bgTextLineHeight
          }}
        >
          {bgText}
        </h2>
      </motion.div>

      {/* Header Text */}
      <div className="relative md:absolute md:top-24 text-center z-20 px-6 mb-16 md:mb-0">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-black dark:text-white tracking-tighter mb-6">
          {headerTitle} <br />
          <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text">{headerHighlight}</span>
        </h2>
      </div>

      {teamMembers.length === 0 ? (
        <div className="relative z-10 w-full flex items-center justify-center min-h-[500px]">
          <p className="text-zinc-500 dark:text-zinc-400">No team members found.</p>
        </div>
      ) : (
        <>
          {/* Mobile View: Vertical List */}
          <div className="relative z-10 w-full flex flex-col items-center gap-12 md:hidden px-6 mt-8">
            {teamMembers.map((member, index) => {
              const rotation = rotations[index % rotations.length];
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  tabIndex={0}
                  className="relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden border-2 border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 shadow-2xl group focus:outline-none cursor-pointer"
                  style={{ rotateZ: rotation }}
                >
                  {member.imageUrl ? (
                    <img
                      src={getMediaUrl(member.imageUrl, 'team')}
                      alt={member.name}
                      className={`w-full h-full object-cover transition-all duration-500 ${isGrayscale ? 'grayscale group-hover:grayscale-0 group-active:grayscale-0 group-focus:grayscale-0' : ''}`}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                      No Image
                    </div>
                  )}
                  
                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                    <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                    <p className="text-cyan-400 text-sm font-medium">{member.role}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop View: 3D Merry-Go-Round Carousel */}
          <div 
            className="relative z-10 w-full h-[500px] perspective-container hidden md:flex items-center justify-center mt-32"
            onMouseEnter={() => setIsCarouselHovered(true)}
            onMouseLeave={() => setIsCarouselHovered(false)}
          >
            <motion.div
              style={{ y: carouselY, rotateX: -8 }}
              className="relative w-full h-full flex items-center justify-center preserve-3d"
            >
              {/* Continuous Rotation Inner Container */}
              <motion.div
                animate={{ rotateY: [0, -360] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="relative preserve-3d"
                style={{ 
                  animationPlayState: isCarouselHovered ? 'paused' : 'running',
                  width: `${cardSize}px`,
                  height: `${cardSize * 1.25}px`
                }}
              >
                {teamMembers.map((member, index) => {
                  const total = teamMembers.length;
                  const angle = (index / total) * 360;
                  
                  // Staircase hierarchy: subtle difference from top to bottom
                  // Reduced span to make the "stair steps" much smaller
                  const yOffset = -(stairOffset / 2) + (index * (stairOffset / Math.max(1, total - 1))); 
                  
                  // Keep a slight organic tilt
                  const rotation = rotations[index % rotations.length];

                  // "Slightly forward" illusion can be enhanced by slightly altering the Z translation
                  // but in a rotating carousel, constant radius is usually best to avoid clipping.
                  // We'll add a tiny scale boost to the front-most cards based on their index if needed,
                  // but standard 3D perspective already handles the "forward" feeling dynamically as they rotate.

                  return (
                    <div
                      key={member.id}
                      tabIndex={0}
                      className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 carousel-card group shadow-2xl focus:outline-none cursor-pointer"
                      style={{
                        '--card-angle': `${angle}deg`,
                        '--card-y': `${yOffset}px`,
                        transform: `rotateY(${angle}deg) translateZ(var(--tz)) translateY(${yOffset}px) rotateZ(${rotation}deg)`,
                        backfaceVisibility: 'visible',
                      } as React.CSSProperties}
                    >
                      {member.imageUrl ? (
                        <img
                          src={getMediaUrl(member.imageUrl, 'team')}
                          alt={member.name}
                          className={`w-full h-full object-cover transition-all duration-500 ${isGrayscale ? 'grayscale group-hover:grayscale-0 group-active:grayscale-0 group-focus:grayscale-0' : ''}`}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                          No Image
                        </div>
                      )}
                      
                      {/* Overlay Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                        <p className="text-cyan-400 text-sm font-medium">{member.role}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </section>
  );
}
