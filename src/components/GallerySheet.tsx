import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { getPhotos, deletePhoto, PhotoEntry } from '@/lib/gallery';
import { toast } from 'sonner';

interface GallerySheetProps {
  open: boolean;
  onClose: () => void;
}

export function GallerySheet({ open, onClose }: GallerySheetProps) {
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadPhotos();
    }
  }, [open]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const data = await getPhotos();
      setPhotos(data);
    } catch (err) {
      console.error('Gallery load error:', err);
      toast.error('Galeri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      toast.success('Silindi');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Silinemiyor');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] bg-black/95 border-t border-white/10 rounded-t-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0">
              <h2 className="text-lg font-bold">Galerim</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {loading ? (
                <p className="text-center text-white/50 py-8">Yükleniyor...</p>
              ) : photos.length === 0 ? (
                <p className="text-center text-white/50 py-8">Henüz fotoğraf yok</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group rounded-lg overflow-hidden bg-white/5"
                    >
                      <img
                        src={photo.dataUrl}
                        alt="Gallery item"
                        className="w-full h-32 object-cover"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                        <div className="text-xs">
                          <p className="font-bold text-amber-400">{photo.scoreOverall}</p>
                          <p className="text-white/70">{photo.mode}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
