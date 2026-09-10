import React, { useState, useEffect } from 'react';
import {
  Save,
  Palette,
  Store,
  Check,
  Copy,
  Layout,
  Globe,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { ImageUpload } from '../components/ImageUpload';
import { api } from '../lib/api';
import { THEMES } from '../lib/themes';
import { ThemeType } from '../types';
import { MenuPreviewModal } from '../components/MenuPreviewModal';
import { Eye } from 'lucide-react';

const COLOR_PRESETS = [
  { name: 'Ambre Terracotta', hex: '#9A3412' },
  { name: 'Noir Ébène', hex: '#18181B' },
  { name: 'Or Satiné', hex: '#D4AF37' },
  { name: 'Vert Émeraude', hex: '#047857' },
  { name: 'Bleu Majorelle', hex: '#1E40AF' },
  { name: 'Bordeaux Velours', hex: '#831843' },
];

export function Settings() {
  const { activeRestaurant, updateRestaurant } = useRestaurant();

  const [name, setName] = useState(activeRestaurant?.name || '');
  const [slug, setSlug] = useState(activeRestaurant?.slug || '');
  const [description, setDescription] = useState(activeRestaurant?.description || '');
  const [phone, setPhone] = useState(activeRestaurant?.phone || '');
  const [address, setAddress] = useState(activeRestaurant?.address || '');
  const [currency, setCurrency] = useState(activeRestaurant?.currency || 'DH');
  const [primaryColor, setPrimaryColor] = useState(activeRestaurant?.primary_color || '#9A3412');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(activeRestaurant?.theme || 'modern');
  const [logoUrl, setLogoUrl] = useState(activeRestaurant?.logo_url || '');
  const [coverUrl, setCoverUrl] = useState(activeRestaurant?.cover_image_url || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ isConfigured: boolean; isConnected: boolean; host?: string; database?: string } | null>(null);

  useEffect(() => {
    api.health()
      .then(res => {
        if (res?.database) setDbStatus(res.database);
      })
      .catch(() => {
        setDbStatus({ isConfigured: false, isConnected: false });
      });
  }, []);

  useEffect(() => {
    if (activeRestaurant) {
      setName(activeRestaurant.name);
      setSlug(activeRestaurant.slug);
      setDescription(activeRestaurant.description || '');
      setPhone(activeRestaurant.phone || '');
      setAddress(activeRestaurant.address || '');
      setCurrency(activeRestaurant.currency || 'DH');
      setPrimaryColor(activeRestaurant.primary_color || '#9A3412');
      setSelectedTheme(activeRestaurant.theme || 'modern');
      setLogoUrl(activeRestaurant.logo_url || '');
      setCoverUrl(activeRestaurant.cover_image_url || '');
    }
  }, [activeRestaurant]);

  if (!activeRestaurant) {
    return <div className="p-8 text-stone-500">Aucun restaurant sélectionné.</div>;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateRestaurant({
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, ''),
      description,
      phone,
      address,
      currency,
      primary_color: primaryColor,
      theme: selectedTheme,
      logo_url: logoUrl,
      cover_image_url: coverUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const themeList: ThemeType[] = ['modern', 'luxury', 'moroccan', 'minimal'];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-stone-950 tracking-tight">
            Paramètres & Identité
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Gérez les coordonnées, le thème visuel et la personnalisation de votre menu client.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Enregistré !
            </span>
          )}
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Prévisualiser le menu</span>
          </button>
          <button
            onClick={handleSaveProfile}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-8">
        {/* 10. THEMES SELECTION (Modern Premium, Luxury, Moroccan, Minimal) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Layout className="w-5 h-5 text-amber-700" />
              <div>
                <h2 className="text-base font-bold text-stone-900">Thème du Menu Public</h2>
                <p className="text-xs text-stone-500">
                  Choisissez l'identité visuelle appliquée instantanément sur votre menu NFC & QR Code.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full">
              4 identités disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {themeList.map(themeKey => {
              const theme = THEMES[themeKey];
              const isSelected = selectedTheme === themeKey;
              return (
                <div
                  key={themeKey}
                  onClick={() => setSelectedTheme(themeKey)}
                  className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-stone-900 bg-stone-50 shadow-md ring-2 ring-stone-900/10'
                      : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50/50'
                  }`}
                >
                  <div>
                    {/* Visual miniature mockup */}
                    <div
                      className="w-full h-24 rounded-xl mb-3 p-2.5 flex flex-col justify-between overflow-hidden shadow-inner border border-black/5"
                      style={{ backgroundColor: theme.previewBg }}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: theme.previewAccent }}
                        >
                          T
                        </div>
                        <div
                          className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm"
                          style={{
                            backgroundColor: theme.previewAccent,
                            color: themeKey === 'luxury' ? '#1c1917' : '#ffffff',
                          }}
                        >
                          Menu
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div
                          className="h-2 rounded-full w-2/3"
                          style={{ backgroundColor: theme.previewText, opacity: 0.85 }}
                        />
                        <div
                          className="h-1.5 rounded-full w-1/2"
                          style={{ backgroundColor: theme.previewAccent, opacity: 0.6 }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-stone-950">{theme.name}</h3>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-stone-900 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                      {theme.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600">
                      {isSelected ? 'Sélectionné' : 'Cliquer pour choisir'}
                    </span>
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs"
                      style={{ backgroundColor: theme.previewAccent }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Restaurant Profile Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
            <Store className="w-5 h-5 text-amber-700" />
            <h2 className="text-base font-bold text-stone-900">Coordonnées de l'établissement</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nom du restaurant *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Identifiant URL (Slug) *
              </label>
              <div className="flex items-center rounded-xl border border-stone-300 px-3 bg-stone-50 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-600 focus-within:bg-white transition">
                <span className="text-xs text-stone-600 font-mono">/r/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full py-2 bg-transparent text-xs font-mono text-stone-800 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-stone-600 mt-1">
                URL publique : https://menu.touchbizz.ma/r/{slug || 'votre-restaurant'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Téléphone de contact
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+212 5 22 00 00 00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Devise d'affichage
              </label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              >
                <option value="DH">DH (Dirham Marocain)</option>
                <option value="MAD">MAD</option>
                <option value="€">€ (Euro)</option>
                <option value="$">$ (Dollar)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Adresse physique
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ex: 42 Rue Yves Saint Laurent, Guéliz, Marrakech"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Description / Message d'accueil
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Une brève présentation accueillant vos clients lors de l'ouverture du menu..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Visual Identity & Branding Card */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2.5">
              <Palette className="w-5 h-5 text-amber-700" />
              <h2 className="text-base font-bold text-stone-900">Charte graphique & Visuels</h2>
            </div>
            <span className="text-xs font-bold text-stone-500">Personnalisation</span>
          </div>

          {/* Primary Color Picker */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-stone-700">
              Couleur d'accentuation
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {COLOR_PRESETS.map(preset => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setPrimaryColor(preset.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    primaryColor.toLowerCase() === preset.hex.toLowerCase()
                      ? 'border-stone-900 bg-stone-50 shadow-2xs font-bold'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: preset.hex }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}

              <div className="flex items-center gap-2 pl-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5"
                />
                <span className="text-xs font-mono text-stone-500">{primaryColor}</span>
              </div>
            </div>
          </div>

          {/* Images Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <ImageUpload
              value={coverUrl}
              onChange={setCoverUrl}
              label="Photo de couverture (Bannière haute du menu)"
              aspectRatio="cover"
              placeholderText="Ajoutez une photo panoramique de votre salle ou cuisine"
            />

            <ImageUpload
              value={logoUrl}
              onChange={setLogoUrl}
              label="Logo du restaurant"
              aspectRatio="square"
              placeholderText="Ajoutez votre logo officiel"
            />
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-stone-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </form>

      {/* Hostinger MySQL & Multi-tenant Infrastructure Card */}
      <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-stone-900">Base de Données MySQL & Hébergement Hostinger</h3>
              <p className="text-xs text-stone-500">
                Isolation stricte par <code>restaurant_id</code> avec requêtes paramétrées sécurisées
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                dbStatus?.isConnected
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {dbStatus?.isConnected ? `MySQL Connecté (${dbStatus.host || 'Hostinger'})` : 'Mode Développeur (In-Memory & Local)'}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          Le schéma SQL complet avec toutes les tables MySQL (<code>users</code>, <code>restaurants</code>, <code>categories</code>,{' '}
          <code>menu_items</code>), index et données d'initialisation est disponible dans{' '}
          <code>schema.sql</code>. Compatible avec phpMyAdmin et tout serveur MySQL Hostinger.
        </p>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(`-- Consultez /schema.sql pour le script MySQL Hostinger complet`);
              setCopiedSql(true);
              setTimeout(() => setCopiedSql(false), 2000);
            }}
            className="px-3.5 py-1.5 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copié !' : 'Copier référence schema.sql'}</span>
          </button>
          <span className="text-[11px] text-stone-500">
            Prêt à importer dans phpMyAdmin sur votre compte Hostinger.
          </span>
        </div>
      </div>

      {isPreviewModalOpen && activeRestaurant && (
        <MenuPreviewModal
          restaurant={activeRestaurant}
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
        />
      )}
    </div>
  );
}
