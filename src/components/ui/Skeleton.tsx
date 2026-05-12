import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  key?: React.Key;
}

export function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full mb-2',
  };

  return (
    <div 
      className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 ${variantClasses[variant]} ${className}`}
    />
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-screen bg-white dark:bg-[#000d11] flex flex-col items-center justify-center px-6">
      <Skeleton className="w-48 h-6 mb-8" />
      <Skeleton className="w-full max-w-3xl h-24 mb-10" />
      <Skeleton className="w-full max-w-xl h-12 mb-12" />
      <div className="flex gap-4">
        <Skeleton className="w-40 h-14 rounded-full" />
        <Skeleton className="w-40 h-14 rounded-full" />
      </div>
    </div>
  );
}

export function TeamSkeleton() {
  return (
    <div className="py-24 flex flex-col items-center">
      <Skeleton className="w-64 h-12 mb-12" />
      <div className="flex gap-8 overflow-hidden w-full justify-center">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="w-72 aspect-[4/5] rounded-3xl" />
        ))}
      </div>
    </div>
  );
}

export function PortfolioSkeleton() {
  return (
    <div className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-16">
        <div>
          <Skeleton className="w-48 h-12 mb-4" />
          <Skeleton className="w-96 h-6" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-20 h-10 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
