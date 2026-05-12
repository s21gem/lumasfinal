import React from 'react';
import { motion } from 'motion/react';
import { getMediaUrl } from '../utils/media';
import { useData } from '../context/DataContext';

interface Brand {
  id: string;
  name: string;
  logoUrl: string | null;
}

export default function TrustedBy() {
  const { trustedBrands, settings, loading } = useData();

  if (loading) return null; // Or a smaller skeleton

  const grayscale = settings?.trustedBrandsGrayscale ?? true;
  const marqueeSpeed = settings?.trustedBrandsMarqueeSpeed ?? 40;
  const brands = trustedBrands;

  // Fallback brands if none exist in DB
  const displayBrands: Brand[] = brands.length > 0 
    ? brands
    : [
        { id: '1', name: 'NETFLIX', logoUrl: null },
        { id: '2', name: 'ASUS', logoUrl: null },
        { id: '3', name: 'VIVO', logoUrl: null },
        { id: '4', name: 'RED BULL', logoUrl: null },
        { id: '5', name: 'SONY', logoUrl: null },
        { id: '6', name: 'NIKE', logoUrl: null }
      ];

  const renderBrand = (brand: Brand, index: number) => {
    return (
      <div key={`${brand.id}-${index}`} className="flex items-center justify-center">
        {brand.logoUrl ? (
          <img 
            src={getMediaUrl(brand.logoUrl)} 
            alt={brand.name} 
            className={`h-8 md:h-12 w-auto object-contain transition-all duration-300 ${grayscale ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100' : ''}`}
          />
        ) : (
          <div className="text-2xl md:text-4xl font-black tracking-tighter text-black/20 dark:text-white/20 uppercase transition-colors hover:text-black/50 dark:hover:text-white/50">
            {brand.name}
          </div>
        )}
      </div>
    );
  };

  // Dynamically duplicate brands until we have enough to overflow the screen (at least 20 items)
  let baseBrands = [...displayBrands];
  while (baseBrands.length > 0 && baseBrands.length < 20) {
    baseBrands = [...baseBrands, ...displayBrands];
  }
  // Duplicate exactly one more time to ensure a perfect -50% translation loop
  const duplicatedBrands = [...baseBrands, ...baseBrands];

  return (
    <div className="w-full overflow-hidden bg-white/50 dark:bg-[#000d11]/50 py-8 border-y border-black/5 dark:border-white/5 flex">
      
      <div className="w-full overflow-hidden relative group">
        <div className="max-w-7xl mx-auto px-6 mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">Trusted by industry leaders</p>
        </div>
        <motion.div
          key={marqueeSpeed}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ ease: 'linear', duration: marqueeSpeed, repeat: Infinity }}
          className="flex whitespace-nowrap items-center gap-16 w-max"
        >
          {duplicatedBrands.map((brand, index) => renderBrand(brand, index))}
        </motion.div>
      </div>
    </div>
  );
}
