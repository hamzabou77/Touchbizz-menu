import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UtensilsCrossed } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-8 rounded-3xl border border-stone-200 max-w-md w-full shadow-lg space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
          <UtensilsCrossed className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-stone-900">Page non trouvée (404)</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au tableau de bord</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
