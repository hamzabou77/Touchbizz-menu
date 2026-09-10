import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, ExternalLink, X, Smartphone, Wifi } from 'lucide-react';
import { Restaurant } from '../types';

interface QRCodeModalProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ restaurant, isOpen, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [includeBranding, setIncludeBranding] = useState(true);

  const publicUrl = `${window.location.origin}/r/${restaurant.slug}`;

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(
      publicUrl,
      {
        width: 600,
        margin: 2,
        color: {
          dark: restaurant.primary_color || '#1C1917',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, publicUrl, restaurant.primary_color]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;

    if (!includeBranding) {
      const link = document.createElement('a');
      link.download = `qrcode-${restaurant.slug}.png`;
      link.href = qrDataUrl;
      link.click();
      return;
    }

    // Generate branded card for printing (table tent / sticker format)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1050;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Brand Accent
    ctx.fillStyle = restaurant.primary_color || '#9A3412';
    ctx.fillRect(0, 0, canvas.width, 24);

    // Restaurant Name
    ctx.fillStyle = '#1C1917';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(restaurant.name, canvas.width / 2, 90);

    // Subtitle
    ctx.fillStyle = '#78716C';
    ctx.font = '20px sans-serif';
    ctx.fillText('Scannez pour découvrir notre menu digital', canvas.width / 2, 130);

    // QR Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 100, 170, 600, 600);

      // NFC Badge indicator
      ctx.fillStyle = '#F5F5F4';
      ctx.beginPath();
      ctx.roundRect(160, 810, 480, 70, 35);
      ctx.fill();

      ctx.fillStyle = '#1C1917';
      ctx.font = '600 22px sans-serif';
      ctx.fillText('📱 Scannez le QR ou Touchez la carte NFC', canvas.width / 2, 852);

      // Footer
      ctx.fillStyle = '#A8A29E';
      ctx.font = '16px sans-serif';
      ctx.fillText(`menu.touchbizz.com/r/${restaurant.slug}`, canvas.width / 2, 940);
      ctx.fillText('Powered by TouchBizz Menu', canvas.width / 2, 980);

      const downloadLink = document.createElement('a');
      downloadLink.download = `touchbizz-table-card-${restaurant.slug}.png`;
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.click();
    };
    img.src = qrDataUrl;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">QR Code & Support NFC</h3>
              <p className="text-xs text-stone-500">{restaurant.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-200/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-md flex flex-col items-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code pour ${restaurant.name}`}
                  className="w-56 h-56 object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-stone-400">
                  Génération du QR Code...
                </div>
              )}
              <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
                <Wifi className="w-3.5 h-3.5 text-amber-700" />
                <span>Compatible Cartes & Tags NFC</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs font-medium text-stone-500">Lien public permanent :</span>
              <p className="text-xs font-mono text-stone-800 bg-stone-100 px-2.5 py-1 rounded-md mt-1 select-all break-all">
                {publicUrl}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleDownloadQR}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Télécharger le QR (PNG)
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-xl transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Lien copié !' : 'Copier l’URL'}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeBranding}
                onChange={e => setIncludeBranding(e.target.checked)}
                className="rounded border-stone-300 text-amber-700 focus:ring-amber-600"
              />
              <span>Télécharger au format chevalet de table prêt à imprimer</span>
            </label>
            <a
              href={`/r/${restaurant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 hover:underline inline-flex items-center gap-1 font-medium"
            >
              Tester le lien <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* NFC Hardware Info Card */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Smartphone className="w-4 h-4 text-amber-800" />
              Configuration NFC TouchBizz (Sans contact)
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Pour vos chevalets ou cartes NFC : encodez simplement l’URL ci-dessus avec n’importe quelle application d’écriture NFC (comme <em>NFC Tools</em> sur iPhone ou Android). Aucune application requise pour vos clients.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-sm font-semibold rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
