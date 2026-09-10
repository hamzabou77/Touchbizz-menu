import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  ExternalLink,
  Copy,
  Check,
  Download,
  QrCode,
  UtensilsCrossed,
  Layers,
  Store,
  Wifi,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { QRCodeModal } from '../components/QRCodeModal';
import { MenuPreviewModal } from '../components/MenuPreviewModal';

export function DashboardOverview() {
  const { activeRestaurant, categories, menuItems, togglePublish } = useRestaurant();
  const [copied, setCopied] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const publicUrl = activeRestaurant
    ? `${window.location.origin}/r/${activeRestaurant.slug}`
    : '';

  useEffect(() => {
    if (publicUrl && activeRestaurant) {
      QRCode.toDataURL(
        publicUrl,
        {
          width: 320,
          margin: 2,
          color: {
            dark: activeRestaurant.primary_color || '#1C1917',
            light: '#FFFFFF',
          },
        },
        (err, url) => {
          if (!err && url) setQrCodeData(url);
        }
      );
    }
  }, [publicUrl, activeRestaurant]);

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeData) return;
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `touchbizz-qr-${activeRestaurant.slug}.png`;
    link.click();
  };

  if (!activeRestaurant) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-stone-200">
        <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-800">Aucun restaurant configuré</h3>
        <p className="text-sm text-stone-500 mt-1">Commencez par créer votre premier établissement.</p>
      </div>
    );
  }

  const availableItems = menuItems.filter(i => i.is_available).length;
  const outOfStockItems = menuItems.length - availableItems;

  return (
    <div className="space-y-8">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-950 tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Gérez votre menu digital en direct pour vos clients NFC & QR Code.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border ${
              activeRestaurant.is_published
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/90 border-amber-200 text-amber-900'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                activeRestaurant.is_published ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
              }`}
            />
            <span className="text-xs font-bold">
              {activeRestaurant.is_published ? 'Menu en ligne' : 'Menu non publié'}
            </span>
          </div>

          <button
            onClick={() => togglePublish()}
            className="text-xs font-semibold text-stone-700 hover:text-stone-950 underline cursor-pointer"
          >
            {activeRestaurant.is_published ? 'Mettre en pause' : 'Mettre en ligne'}
          </button>
        </div>
      </div>

      {/* Restaurant Information & Main Hero Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Restaurant Info Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {activeRestaurant.logo_url ? (
                <img
                  src={activeRestaurant.logo_url}
                  alt={activeRestaurant.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-stone-100 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 font-bold text-xl flex items-center justify-center">
                  {activeRestaurant.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-stone-900 truncate">
                    {activeRestaurant.name}
                  </h2>
                  <span className="text-xs font-medium bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                    Devise : {activeRestaurant.currency}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                  {activeRestaurant.description || 'Aucune description renseignée.'}
                </p>
                <p className="text-xs text-stone-400 mt-1 truncate">
                  📍 {activeRestaurant.address || 'Marrakech, Maroc'} · 📞 {activeRestaurant.phone || 'Non renseigné'}
                </p>
              </div>
            </div>

            {/* Public Link Box */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">URL Publique du Menu Client</span>
                <span className="text-[11px] text-stone-500 font-medium">Lien direct NFC / QR</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono text-stone-700 truncate select-all">
                  {publicUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Copier le lien public"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              {/* Action Buttons for Preview and Direct View */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex-1 py-2 px-3 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-lg transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Prévisualiser le menu</span>
                </button>

                <a
                  href={`/r/${activeRestaurant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <span>Voir le menu</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
            <Link
              to="/dashboard/menu"
              className="text-stone-900 font-semibold hover:text-amber-800 inline-flex items-center gap-1"
            >
              Modifier les plats et catégories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/dashboard/settings"
              className="text-stone-500 hover:text-stone-800"
            >
              Modifier le branding & infos
            </Link>
          </div>
        </div>

        {/* Right Column: QR Code Direct Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col items-center text-center justify-between">
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                QR Code Table
              </span>
              <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Wifi className="w-3 h-3 text-amber-700" /> NFC Prêt
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              {qrCodeData ? (
                <img
                  src={qrCodeData}
                  alt="QR Code restaurant"
                  className="w-40 h-40 object-contain mx-auto"
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-stone-300 text-xs">
                  Chargement QR...
                </div>
              )}
            </div>

            <p className="text-xs text-stone-500 mt-3 max-w-xs">
              Ce QR Code ouvre instantanément votre menu sur tous les smartphones iOS et Android.
            </p>
          </div>

          <div className="w-full mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadQR}
              className="py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Télécharger</span>
            </button>
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 border border-stone-200 cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Fiche Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold text-stone-500">Catégories</span>
            <Layers className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-black text-stone-900">{categories.length}</p>
          <span className="text-[11px] text-stone-600 font-medium">Sections dans le menu</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold text-stone-500">Plats & Boissons</span>
            <UtensilsCrossed className="w-4 h-4 text-amber-700" />
          </div>
          <p className="text-2xl font-black text-stone-900">{menuItems.length}</p>
          <span className="text-[11px] text-stone-600 font-medium">Produits au catalogue</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold text-stone-500">Disponibles</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{availableItems}</p>
          <span className="text-[11px] text-stone-600 font-medium">En stock actuellement</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-semibold text-stone-500">En rupture</span>
            <AlertCircle className="w-4 h-4 text-stone-400" />
          </div>
          <p className={`text-2xl font-black ${outOfStockItems > 0 ? 'text-amber-800' : 'text-stone-400'}`}>
            {outOfStockItems}
          </p>
          <span className="text-[11px] text-stone-600 font-medium">Temporairement masqués</span>
        </div>
      </div>

      {/* Quick Launch Guide */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Déploiement en salle</span>
          </div>
          <h3 className="text-lg font-bold">Installez TouchBizz sur vos tables en 3 étapes</h3>
          <p className="text-xs text-stone-300 max-w-xl">
            1. Téléchargez le pack QR Code Haute Résolution. 2. Imprimez sur vos chevalets ou collez le sticker. 3. Vos clients scannent ou posent leur smartphone pour déguster.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/dashboard/menu"
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold rounded-xl transition shadow-xs"
          >
            Éditer le menu
          </Link>
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/15"
          >
            Imprimer le QR
          </button>
        </div>
      </div>

      {isQRModalOpen && (
        <QRCodeModal
          restaurant={activeRestaurant}
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}

      {isPreviewModalOpen && (
        <MenuPreviewModal
          restaurant={activeRestaurant}
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
        />
      )}
    </div>
  );
}
