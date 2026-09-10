import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Settings,
  ExternalLink,
  QrCode,
  Globe,
  Plus,
  ChevronDown,
  LogOut,
  Sparkles,
  Menu as MenuIcon,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRestaurant } from '../context/RestaurantContext';
import { QRCodeModal } from './QRCodeModal';
import { CreateRestaurantModal } from './CreateRestaurantModal';
import { MenuPreviewModal } from './MenuPreviewModal';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const {
    restaurants,
    activeRestaurant,
    setActiveRestaurantId,
    togglePublish,
  } = useRestaurant();
  const navigate = useNavigate();

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRestaurantDropdownOpen, setIsRestaurantDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleTogglePublish = async () => {
    setPublishing(true);
    try {
      await togglePublish();
    } finally {
      setPublishing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col md:flex-row text-stone-900">
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black text-sm tracking-tight">
            TB
          </div>
          <span className="font-bold text-base text-stone-950">TouchBizz</span>
          <span className="text-[10px] font-semibold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full">
            Menu V1
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeRestaurant && (
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
              title="QR Code & NFC"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-40 w-72 bg-white border-r border-stone-200/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center font-black text-base shadow-xs">
              TB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-stone-900 text-base tracking-tight">TouchBizz</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-md">
                  Menu
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">Digital NFC & QR Platform</p>
            </div>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Restaurant Multi-tenant Selector */}
        <div className="p-3 border-b border-stone-100 bg-stone-50/50 relative">
          <button
            onClick={() => setIsRestaurantDropdownOpen(!isRestaurantDropdownOpen)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200 hover:border-stone-300 transition text-left shadow-2xs group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {activeRestaurant?.logo_url ? (
                <img
                  src={activeRestaurant.logo_url}
                  alt={activeRestaurant.name}
                  className="w-7 h-7 rounded-lg object-cover border border-stone-100 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {activeRestaurant?.name?.charAt(0) || 'R'}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-stone-900 truncate">
                  {activeRestaurant?.name || 'Sélectionner un restaurant'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      activeRestaurant?.is_published ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                    }`}
                  />
                  <span className="text-[10px] text-stone-600 font-medium">
                    {activeRestaurant?.is_published ? 'Menu en ligne' : 'Menu brouillon'}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-stone-600 transition shrink-0 ml-1" />
          </button>

          {/* Dropdown Menu */}
          {isRestaurantDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-stone-200 rounded-xl shadow-xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                Vos Établissements ({restaurants.length})
              </div>
              <div className="max-h-48 overflow-y-auto">
                {restaurants.map(rest => (
                  <button
                    key={rest.id}
                    onClick={() => {
                      setActiveRestaurantId(rest.id);
                      setIsRestaurantDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left hover:bg-stone-50 transition ${
                      rest.id === activeRestaurant?.id ? 'bg-amber-50/70 text-amber-950 font-bold' : 'text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          rest.is_published ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}
                      />
                      <span className="truncate">{rest.name}</span>
                    </div>
                    {rest.id === activeRestaurant?.id && (
                      <span className="text-[10px] bg-amber-200/60 text-amber-900 px-1.5 py-0.5 rounded">
                        Actif
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-stone-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setIsRestaurantDropdownOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50/60 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un établissement</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-1">
          <NavLink
            to="/dashboard"
            end
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tableau de bord</span>
          </NavLink>

          <NavLink
            to="/dashboard/menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`
            }
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Mon Menu</span>
          </NavLink>

          <NavLink
            to="/dashboard/settings"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </NavLink>
        </div>

        {/* Public Menu Quick Actions Box */}
        {activeRestaurant && (
          <div className="p-3 mx-3 mb-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Menu Public
              </span>
              <button
                onClick={handleTogglePublish}
                disabled={publishing}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition cursor-pointer ${
                  activeRestaurant.is_published
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                }`}
              >
                {activeRestaurant.is_published ? 'En ligne' : 'Brouillon'}
              </button>
            </div>

            <div className="space-y-1.5">
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-2xs cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Prévisualiser le menu</span>
              </button>

              <a
                href={`/r/${activeRestaurant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-white border border-stone-200 hover:border-stone-300 text-stone-800 text-xs font-semibold rounded-xl transition shadow-2xs group"
              >
                <span>Voir le menu client</span>
                <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-stone-700" />
              </a>

              <button
                onClick={() => setIsQRModalOpen(true)}
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5 text-amber-800" />
                <span>QR Code & Tag NFC</span>
              </button>
            </div>
          </div>
        )}

        {/* User profile footer */}
        <div className="p-3 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-stone-900 truncate">{user?.name || 'Restaurateur'}</p>
              <p className="text-[10px] text-stone-600 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar on desktop */}
        <div className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white border-b border-stone-200/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600">Restaurant actuel :</span>
              <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-md">
                {activeRestaurant?.name}
              </span>
            </div>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeRestaurant?.is_published ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              />
              <span className="text-xs font-medium text-stone-600">
                Statut :{' '}
                <strong className={activeRestaurant?.is_published ? 'text-emerald-700' : 'text-amber-700'}>
                  {activeRestaurant?.is_published ? 'Publié (Accessible aux clients)' : 'Non publié (Brouillon)'}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeRestaurant && (
              <>
                <button
                  onClick={handleTogglePublish}
                  disabled={publishing}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    activeRestaurant.is_published
                      ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {activeRestaurant.is_published ? 'Dépublier le menu' : 'Publier le menu maintenant'}
                </button>

                <button
                  onClick={() => setIsQRModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR & NFC</span>
                </button>

                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-semibold rounded-lg transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Prévisualiser</span>
                </button>

                <a
                  href={`/r/${activeRestaurant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition shadow-2xs"
                >
                  <span>Voir le menu</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</div>
      </main>

      {/* Global Modals */}
      {activeRestaurant && (
        <>
          <QRCodeModal
            restaurant={activeRestaurant}
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
          />
          <MenuPreviewModal
            restaurant={activeRestaurant}
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
          />
        </>
      )}

      <CreateRestaurantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
