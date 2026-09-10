import React, { useState, useRef } from 'react';
import { Upload, Sparkles, X, Check, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: 'landscape' | 'square' | 'cover';
  placeholderText?: string;
}

const CURATED_FOOD_IMAGES = [
  { name: 'Tajine d’agneau', url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80' },
  { name: 'Pastilla dorée', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80' },
  { name: 'Salade fraîcheur', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80' },
  { name: 'Double Cheeseburger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80' },
  { name: 'Burger Truffe', url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80' },
  { name: 'Frites croustillantes', url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80' },
  { name: 'Brochettes grillées', url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80' },
  { name: 'Pizza artisanale', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80' },
  { name: 'Dessert gourmand', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80' },
  { name: 'Thé à la menthe', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80' },
  { name: 'Jus d’orange frais', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80' },
  { name: 'Restaurant Ambiance', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80' },
];

export function ImageUpload({
  value,
  onChange,
  label = 'Photo',
  aspectRatio = 'landscape',
  placeholderText = 'Glissez une image ou cliquez pour parcourir',
}: ImageUploadProps) {
  const [showGallery, setShowGallery] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    // 1. Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);

    // 2. Upload to Hostinger server storage (/uploads)
    try {
      setIsUploading(true);
      const res = await api.upload.uploadImage(file);
      if (res?.url) {
        onChange(res.url);
      }
    } catch (err) {
      console.warn('[TouchBizz Upload] Using local dataURL for image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const aspectClass =
    aspectRatio === 'cover'
      ? 'aspect-[16/7] w-full'
      : aspectRatio === 'square'
      ? 'aspect-square w-32'
      : 'aspect-[4/3] w-full max-w-sm';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-stone-800">{label}</label>
        <button
          type="button"
          onClick={() => setShowGallery(!showGallery)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {showGallery ? 'Fermer la bibliothèque' : 'Choisir une photo HD'}
        </button>
      </div>

      {/* Upload Zone & Preview */}
      {value ? (
        <div className={`relative ${aspectClass} rounded-xl overflow-hidden border border-stone-200 bg-stone-100 group shadow-xs`}>
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Téléchargement sur le serveur...</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-stone-900 text-xs font-semibold rounded-lg shadow-md hover:bg-stone-50 transition"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition flex flex-col items-center justify-center gap-2 ${
            isDragging ? 'border-amber-600 bg-amber-50/50' : 'border-stone-300 hover:border-stone-400 bg-stone-50/60'
          } ${aspectClass}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-stone-600">
              <Loader2 className="w-6 h-6 animate-spin text-amber-700" />
              <span className="text-xs font-medium">Téléchargement en cours...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-600">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs text-stone-600 font-medium">{placeholderText}</span>
              <span className="text-[11px] text-stone-600">PNG, JPG, WebP jusqu'à 5MB (Serveur Hostinger)</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Curated Gallery Drawer */}
      {showGallery && (
        <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-2">
          <p className="text-xs font-medium text-stone-600">Photos de restauration prêtes à l'emploi :</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
            {CURATED_FOOD_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(img.url);
                  setShowGallery(false);
                }}
                className={`relative aspect-square rounded-lg overflow-hidden border transition group ${
                  value === img.url ? 'ring-2 ring-amber-600 border-transparent' : 'border-stone-200 hover:border-amber-400'
                }`}
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                {value === img.url && (
                  <div className="absolute inset-0 bg-amber-600/30 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white truncate px-1 py-0.5 text-center">
                  {img.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
