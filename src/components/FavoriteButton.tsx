import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface FavoriteButtonProps {
  apartmentId: string;
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ apartmentId, className = '' }) => {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !apartmentId) {
      setLoading(false);
      return;
    }

    const favoriteRef = doc(db, 'users', user.uid, 'favorites', apartmentId);
    const unsubscribe = onSnapshot(favoriteRef, (docSnap) => {
      setIsFavorite(docSnap.exists());
      setLoading(false);
    }, (error) => {
      console.error("Error fetching favorite status:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, apartmentId]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Could trigger login modal here if one exists
      return;
    }

    const favoriteRef = doc(db, 'users', user.uid, 'favorites', apartmentId);

    try {
      if (isFavorite) {
        await deleteDoc(favoriteRef);
      } else {
        await setDoc(favoriteRef, {
          apartmentId,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/favorites/${apartmentId}`);
    }
  };

  if (!user) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleFavorite}
      className={`group flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-xl border border-white/20 transition-all duration-300 ${isFavorite ? 'bg-gold-500/80 border-gold-400' : 'bg-white/10 hover:bg-white/20'} ${className}`}
      disabled={loading}
    >
      <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-white text-white' : 'text-white group-hover:text-gold-500'}`} />
    </motion.button>
  );
};
