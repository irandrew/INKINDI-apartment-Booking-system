import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { ImageIcon, X, UploadCloud, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (urls: string[]) => void;
  initialUrls?: string[];
}

export default function ImageUpload({ onUploadComplete, initialUrls = [] }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setProgress(0);

    const newUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const storageRef = ref(storage, `apartments/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              // Simple progress calculation across all files
              setProgress(((i / totalFiles) * 100) + (p / totalFiles));
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              newUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }

      const updatedImages = [...images, ...newUrls];
      setImages(updatedImages);
      onUploadComplete(updatedImages);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onUploadComplete(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
        {images.map((url, index) => (
          <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100 ring-1 ring-neutral-200">
            <img src={url} alt={`Apartment ${index}`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        
        {uploading ? (
          <div className="flex aspect-square flex-col items-center justify-center rounded-xl bg-neutral-50 ring-1 ring-neutral-200">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="mt-2 text-[10px] font-bold text-neutral-500">{Math.round(progress)}%</span>
          </div>
        ) : (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 hover:border-blue-400 hover:bg-blue-50">
            <UploadCloud className="h-6 w-6 text-neutral-400" />
            <span className="mt-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Add Photo</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        )}
      </div>
    </div>
  );
}
