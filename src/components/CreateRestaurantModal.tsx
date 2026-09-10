import React, { useState } from 'react';
import { Store, X, ArrowRight } from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';

interface CreateRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateRestaurantModal({ isOpen, onClose }: CreateRestaurantModalProps) {
  const { createRestaurant } = useRestaurant();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [currency, setCurrency] = useState('DH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await createRestaurant({ name, slug, currency });
      setName('');
      setSlug('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900">Ajouter un restaurant</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nom de l'établissement *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              placeholder="Ex: Le Jardin de Majorelle"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Identifiant URL unique (Slug) *
            </label>
            <div className="flex items-center rounded-xl border border-stone-300 px-3 bg-stone-50 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-600 focus-within:bg-white transition">
              <span className="text-xs text-stone-600 font-mono">/r/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="le-jardin-majorelle"
                className="w-full py-2.5 bg-transparent text-xs font-mono text-stone-800 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-stone-600 mt-1">
              Ce lien sera programmé sur la carte NFC et imprimé sur le QR Code.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Devise monétaire
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 transition"
            >
              <option value="DH">Dirham marocain (DH)</option>
              <option value="€">Euro (€)</option>
              <option value="$">Dollar US ($)</option>
              <option value="CFA">Franc CFA (CFA)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 text-sm font-medium rounded-lg"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              <span>{isSubmitting ? 'Création...' : 'Créer le restaurant'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
