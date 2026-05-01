import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`rounded-xl ${isDark ? 'bg-white/5' : 'bg-neutral-100'} ${className}`}
    />
  );
};

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold-500 border-t-transparent"></div>
    </div>
  );
};
