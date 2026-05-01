import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { X, Search, Maximize2 } from 'lucide-react';

export default function GallerySection() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800', size: 'large' },
    { url: 'https://images.unsplash.com/photo-1613553507747-5986f2791617?auto=format&fit=crop&q=80&w=600', size: 'small' },
    { url: 'https://images.unsplash.com/photo-1628744276520-63e44f144454?auto=format&fit=crop&q=80&w=600', size: 'small' },
    { url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800', size: 'medium' },
    { url: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&q=80&w=600', size: 'small' },
    { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', size: 'large' },
  ];

  return (
    <section className={`py-40 font-sans ${isDark ? 'bg-neutral-900' : 'bg-gold-50'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-24">
          <span className="premium-label tracking-[0.4em]">Visual Narrative</span>
          <h2 className={`mt-6 text-5xl italic font-serif tracking-tight sm:text-7xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Experience <span className="text-gold-600">The Sanctuary.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-neutral-500 font-light tracking-wide italic">A curated exploration of our most exclusive residences and communal spaces, designed for the discerning traveler.</p>
        </div>

        <div className="columns-1 gap-12 sm:columns-2 lg:columns-3 space-y-12">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group relative overflow-hidden rounded-[3rem] cursor-zoom-in shadow-premium"
              onClick={() => setSelectedImage(img.url)}
            >
              <img 
                src={img.url} 
                className="w-full transition-transform duration-[1.5s] group-hover:scale-110" 
                alt="Property Gallery"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-neutral-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="luxury-button bg-white/20 backdrop-blur-xl border-white/30 text-white">
                  Enlarge
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 rounded-full bg-white/10 p-4 text-white hover:bg-white/20 backdrop-blur-md">
              <X className="h-6 w-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={selectedImage} 
              className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
