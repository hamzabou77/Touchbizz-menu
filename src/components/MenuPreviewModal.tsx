import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Smartphone, Monitor, RotateCcw } from 'lucide-react';
import { Restaurant } from '../types';

interface MenuPreviewModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export function MenuPreviewModal({ restaurant, isOpen, onClose }: MenuPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'mobile' | 'tablet'>('mobile');
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/r/${restaurant.slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 w-full max-w-4xl h-[95vh] rounded-3xl shadow-2xl border border-stone-700 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-stone-800 bg-stone-950/90 text-white shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Aperçu du Menu Client
                </h3>
                <span className="text-[10px] font-semibold bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                  {restaurant.name}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono hidden sm:block truncate max-w-sm">
                {publicUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700">
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'mobile'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Format Smartphone (NFC/QR)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Mobile</span>
              </button>
              <button
                onClick={() => setViewMode('tablet')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewMode === 'tablet'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Format Tablette / Écran large"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">Large</span>
              </button>
            </div>

            {/* Refresh iframe */}
            <button
              onClick={handleRefresh}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition cursor-pointer"
              title="Rafraîchir l'aperçu"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Copy Public Link */}
            <button
              onClick={handleCopy}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier URL'}</span>
            </button>

            {/* Open in New Tab ("Voir le menu") */}
            <a
              href={`/r/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-stone-900 hover:bg-stone-100 text-xs font-bold rounded-xl transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Voir en plein écran</span>
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Simulator Viewport */}
        <div className="flex-1 bg-stone-950 p-3 sm:p-6 flex items-center justify-center overflow-hidden">
          <div
            className={`h-full bg-black rounded-3xl shadow-2xl border-4 sm:border-8 border-stone-800 flex flex-col overflow-hidden transition-all duration-300 ${
              viewMode === 'mobile' ? 'w-full max-w-sm sm:max-w-[390px]' : 'w-full max-w-2xl'
            }`}
          >
            {/* Phone Speaker & Camera Notch */}
            <div className="w-full bg-stone-900 py-1.5 flex items-center justify-center shrink-0">
              <div className="w-20 h-3 bg-stone-800 rounded-full" />
            </div>

            {/* Iframe with customer public route */}
            <iframe
              key={iframeKey}
              src={`/r/${restaurant.slug}`}
              title={`Menu client de ${restaurant.name}`}
              className="w-full flex-1 border-0 bg-white"
            />
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-6 py-2.5 bg-stone-950 border-t border-stone-800 text-center text-xs text-stone-400 shrink-0">
          Ce que vos clients voient lorsqu’ils scannent le QR code ou posent leur smartphone sur la puce NFC TouchBizz.
        </div>
      </div>
    </div>
  );
}
