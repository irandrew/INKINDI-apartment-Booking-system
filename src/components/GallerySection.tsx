import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { X, Search, Maximize2 } from 'lucide-react';

export default function GallerySection() {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const images = [
    { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800', size: 'large' },
    { url: 'https://images.unsplash.com/photo-1522770179533-24471fcdba45?auto=format&fit=crop&q=80&w=600', size: 'small' },
    { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=600', size: 'small' },
    { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800', size: 'medium' },
    { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600', size: 'small' },
    { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800', size: 'large' },
  ];

  return (
    <section className={`py-24 font-sans ${isDark ? 'bg-neutral-900' : 'bg-neutral-50'}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-600">Gallery</span>
          <h2 className={`mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl ${isDark ? 'text-white' : 'text-neutral-900'}`}>
            Experience <span className="text-blue-600">The Comfort.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-neutral-500">A visual tour of our finest apartments and amenities designed for your absolute relaxation.</p>
        </div>

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 space-y-6">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative overflow-hidden rounded-[2rem] cursor-zoom-in"
              onClick={() => setSelectedImage(img.url)}
            >
              <img 
                src={img.url} 
                className="w-full transition-transform duration-700 group-hover:scale-110" 
                alt="Property Gallery"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-md text-white">
                  <Maximize2 className="h-6 w-6" />
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
