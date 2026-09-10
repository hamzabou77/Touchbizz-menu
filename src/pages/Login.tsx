import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight, Sparkles, ShieldCheck, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('owner@latablemarrakech.ma');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error || 'Identifiants invalides');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('owner@latablemarrakech.ma');
    setPassword('password123');
    setLoading(true);
    await login('owner@latablemarrakech.ma', 'password123');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center font-black text-xl mx-auto shadow-md">
          TB
        </div>
        <h1 className="mt-4 text-2xl font-black text-stone-900 tracking-tight">
          TouchBizz Menu
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Plateforme SaaS de menus digitaux pour restaurants (NFC & QR Code)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-stone-200 sm:px-10 space-y-6">
          {/* 1-Click Quick Login Demo Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-950 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-700" />
              Accès Démo Instantané Restaurateur
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              Connectez-vous directement au restaurant <strong>La Table de Marrakech</strong> pour tester le tableau de bord et le menu client.
            </p>
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="mt-1 w-full py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Se connecter en 1 clic</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-600 font-semibold">Ou avec vos identifiants</span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Mot de passe
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-amber-800 hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-bold text-white bg-stone-900 hover:bg-black focus:outline-none transition cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Connexion...' : 'Se connecter au tableau de bord'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-stone-500">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="font-bold text-amber-800 hover:underline">
                Créer mon restaurant
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
