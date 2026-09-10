import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Phone,
  MapPin,
  Search,
  X,
  Share2,
  Check,
  UtensilsCrossed,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { Restaurant, Category, MenuItem, ThemeType } from '../types';
import { THEMES } from '../lib/themes';
import { api } from '../lib/api';

export function PublicMenu() {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const { getPublicRestaurant, getPublicCategories, getPublicItems } = useRestaurant();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!restaurantSlug) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Fetch live menu from Hostinger MySQL API
    api.publicMenu
      .getBySlug(restaurantSlug)
      .then(data => {
        if (!isMounted) return;
        if (data?.restaurant) {
          setRestaurant(data.restaurant);
          setCategories(data.categories || []);
          setItems(data.items || []);
          if (data.categories?.length > 0) {
            setActiveCategory(data.categories[0].id);
          }
          document.title = `${data.restaurant.name} — Menu Digital`;
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        // Fallback to local store
        const rest = getPublicRestaurant(restaurantSlug);
        if (rest) {
          setRestaurant(rest);
          const cats = getPublicCategories(rest.id);
          setCategories(cats);
          const allItems = getPublicItems(rest.id);
          setItems(allItems);
          if (cats.length > 0) {
            setActiveCategory(cats[0].id);
          }
          document.title = `${rest.name} — Menu Digital`;
        } else {
          setRestaurant(null);
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [restaurantSlug, getPublicRestaurant, getPublicCategories, getPublicItems]);

  // Handle category smooth scroll
  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const element = categoryRefs.current[catId];
    if (element) {
      const navHeight = 64;
      const y = element.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Observe which category is currently in view
  useEffect(() => {
    if (categories.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const cat of categories) {
        const el = categoryRefs.current[cat.id];
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveCategory(cat.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant?.name || 'Menu Digital',
        text: `Découvrez le menu digital de ${restaurant?.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Loading Skeleton State
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 max-w-lg mx-auto pb-20 animate-pulse">
        <div className="h-56 bg-stone-200 w-full" />
        <div className="p-5 space-y-4">
          <div className="w-20 h-20 bg-stone-300 rounded-2xl -mt-14 border-4 border-white" />
          <div className="h-6 bg-stone-300 rounded w-2/3" />
          <div className="h-4 bg-stone-200 rounded w-full" />
          <div className="flex gap-2 pt-4">
            <div className="h-9 bg-stone-200 rounded-full w-24" />
            <div className="h-9 bg-stone-200 rounded-full w-28" />
            <div className="h-9 bg-stone-200 rounded-full w-20" />
          </div>
        </div>
      </div>
    );
  }

  // Error: 404 Restaurant Not Found
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 max-w-md w-full shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-stone-900">Établissement introuvable</h1>
          <p className="text-xs text-stone-500 leading-relaxed">
            Le lien du menu que vous avez scanné n'existe pas ou a été modifié. Veuillez vous adresser à l'équipe du restaurant.
          </p>
          <div className="pt-2">
            <span className="text-[11px] text-stone-400 font-medium">TouchBizz Menu Digital</span>
          </div>
        </div>
      </div>
    );
  }

  // Error: Menu is Not Published
  if (!restaurant.is_published) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 max-w-md w-full shadow-lg space-y-4">
          {restaurant.logo_url && (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="w-16 h-16 rounded-2xl mx-auto object-cover border border-stone-100 shadow-xs"
            />
          )}
          <h2 className="text-lg font-bold text-stone-900">{restaurant.name}</h2>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-950">
            <p className="text-xs font-semibold leading-relaxed">
              Ce menu n'est pas disponible pour le moment.
            </p>
            <p className="text-[11px] text-amber-900/70 mt-1">
              L'établissement effectue actuellement des mises à jour sur sa carte.
            </p>
          </div>
          <p className="text-[11px] text-stone-400 font-medium">Powered by TouchBizz</p>
        </div>
      </div>
    );
  }

  // Current theme config
  const currentThemeKey: ThemeType = restaurant.theme || 'modern';
  const theme = THEMES[currentThemeKey] || THEMES.modern;
  const isLuxury = currentThemeKey === 'luxury';
  const isMoroccan = currentThemeKey === 'moroccan';
  const isMinimal = currentThemeKey === 'minimal';

  // Search filter
  const isSearching = searchQuery.trim().length > 0;
  const filteredSearchItems = isSearching
    ? items.filter(
        i =>
          i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (i.description && i.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className={`min-h-screen ${theme.containerBg} flex flex-col items-center transition-colors duration-300`}>
      {/* Mobile-first centered frame: max-w-md for phone, up to max-w-2xl on desktop */}
      <div
        className={`w-full max-w-md sm:max-w-xl md:max-w-2xl ${theme.menuFrameBg} min-h-screen flex flex-col relative shadow-xl border-x ${theme.borderClass}`}
      >
        {/* Floating Share Button (Subtle & clean) */}
        <button
          onClick={handleShare}
          className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer shadow-md ${
            isLuxury
              ? 'bg-black/80 text-stone-200 hover:text-white border border-[#D4AF37]/40'
              : 'bg-white/85 backdrop-blur-md text-stone-800 hover:bg-white'
          }`}
          title="Partager le menu"
        >
          {shareCopied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>

        {/* 11. RESTAURANT HEADER */}
        <header className="relative">
          {/* Cover Image */}
          <div className="relative h-48 sm:h-60 w-full bg-stone-900 overflow-hidden">
            {restaurant.cover_image_url ? (
              <img
                src={restaurant.cover_image_url}
                alt={restaurant.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: restaurant.primary_color || '#9A3412' }}
              >
                <UtensilsCrossed className="w-16 h-16 text-white/30" />
              </div>
            )}
            <div className={`absolute inset-0 ${theme.headerOverlay}`} />
          </div>

          {/* Restaurant Brand Identity Section */}
          <div className="px-5 pt-3 pb-5 relative">
            <div className="flex items-end justify-between -mt-14 mb-3">
              {/* Logo Overlapping Cover */}
              <div className="relative">
                {restaurant.logo_url ? (
                  <img
                    src={restaurant.logo_url}
                    alt={restaurant.name}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-md border-4 ${
                      isLuxury ? 'border-[#0F0F14] bg-[#16161D]' : 'border-white bg-white'
                    }`}
                  />
                ) : (
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md border-4 ${
                      isLuxury ? 'border-[#0F0F14]' : 'border-white'
                    }`}
                    style={{ backgroundColor: restaurant.primary_color || '#9A3412' }}
                  >
                    {restaurant.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Quick Call Action if Phone Available */}
              {restaurant.phone && (
                <a
                  href={`tel:${restaurant.phone.replace(/\s+/g, '')}`}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-2xs ${
                    isLuxury
                      ? 'bg-[#181820] text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60'
                      : isMoroccan
                      ? 'bg-[#F9EDE1] text-[#9A3412] border border-[#EAD3BD] hover:bg-[#F3DFCD]'
                      : 'bg-stone-100 text-stone-800 border border-stone-200/80 hover:bg-stone-200'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler</span>
                </a>
              )}
            </div>

            {/* Restaurant Title and Description */}
            <div className="space-y-1.5">
              <h1 className={`text-2xl sm:text-3xl ${theme.titleClass} leading-tight`}>
                {restaurant.name}
              </h1>
              {restaurant.description && (
                <p className={`text-xs sm:text-sm ${theme.bodyTextClass} leading-relaxed`}>
                  {restaurant.description}
                </p>
              )}

              {/* Address / Location */}
              {restaurant.address && (
                <div className={`flex items-center gap-1 text-[11px] sm:text-xs ${theme.mutedTextClass} pt-1`}>
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </div>
              )}
            </div>

            {/* Search Input Bar */}
            <div className="mt-4 relative">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isLuxury ? 'text-stone-500' : 'text-stone-400'
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un plat, ingrédient..."
                className={`w-full pl-10 pr-9 py-2.5 rounded-xl text-xs focus:outline-none transition ${
                  isLuxury
                    ? 'bg-[#181820] border border-[#D4AF37]/25 text-stone-200 placeholder:text-stone-600 focus:border-[#D4AF37]/60'
                    : isMoroccan
                    ? 'bg-[#FAF3EB] border border-[#EAD3BD] text-[#431407] placeholder:text-[#9A3412]/50 focus:bg-white focus:border-[#9A3412]'
                    : 'bg-stone-100 border border-transparent text-stone-800 placeholder:text-stone-400 focus:border-stone-300 focus:bg-white'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-stone-400 hover:text-stone-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* 12. CATEGORY NAVIGATION (Horizontal Scrollable & Sticky) */}
        {!isSearching && categories.length > 0 && (
          <div className={`sticky top-0 z-30 ${theme.categoryNavBg} px-4 py-2.5 shadow-2xs`}>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {categories.map(cat => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`px-4 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      isMinimal ? 'rounded-none border-b-2' : 'rounded-full'
                    } ${
                      isActive
                        ? isMinimal
                          ? 'border-black text-black font-extrabold'
                          : theme.categoryBtnActive
                        : isMinimal
                        ? 'border-transparent text-stone-500 hover:text-black'
                        : theme.categoryBtnInactive
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MENU CONTENT / FOOD CARDS SECTION */}
        <div className="flex-1 px-4 sm:px-6 py-6 space-y-8">
          {/* SEARCH RESULTS VIEW */}
          {isSearching ? (
            <div className="space-y-4">
              <div className={`flex items-center justify-between text-xs ${theme.mutedTextClass}`}>
                <span>
                  Résultats pour « <strong>{searchQuery}</strong> » : {filteredSearchItems.length} plat(s)
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="font-bold underline cursor-pointer"
                >
                  Effacer
                </button>
              </div>

              {filteredSearchItems.length === 0 ? (
                <div className={`py-12 text-center ${theme.mutedTextClass} space-y-2`}>
                  <UtensilsCrossed className="w-8 h-8 mx-auto opacity-50" />
                  <p className="text-xs font-medium">Aucun plat ne correspond à cette recherche.</p>
                </div>
              ) : (
                <div className={isMinimal ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
                  {filteredSearchItems.map(item => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      currency={restaurant.currency}
                      themeKey={currentThemeKey}
                      onSelect={() => setSelectedItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* STANDARD CATEGORY SECTIONS */
            categories.map(cat => {
              const catItems = items
                .filter(i => i.category_id === cat.id)
                .sort((a, b) => (a.sort_order ?? a.display_order) - (b.sort_order ?? b.display_order));

              if (catItems.length === 0) return null;

              return (
                <section
                  key={cat.id}
                  ref={el => {
                    categoryRefs.current[cat.id] = el;
                  }}
                  className="space-y-3.5 scroll-mt-20"
                >
                  {/* Category Section Header */}
                  <div className={`pb-2 border-b ${theme.borderClass}`}>
                    <h2 className={`text-lg sm:text-xl font-bold ${theme.titleClass}`}>
                      {cat.name}
                    </h2>
                    {cat.description && (
                      <p className={`text-xs ${theme.mutedTextClass} mt-0.5 leading-relaxed`}>
                        {cat.description}
                      </p>
                    )}
                  </div>

                  {/* 13. FOOD CARDS GRID */}
                  <div className={isMinimal ? 'space-y-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
                    {catItems.map(item => (
                      <FoodCard
                        key={item.id}
                        item={item}
                        currency={restaurant.currency}
                        themeKey={currentThemeKey}
                        onSelect={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* 25. FOOTER */}
        <footer
          className={`mt-auto py-8 text-center space-y-2 border-t ${theme.borderClass} ${
            isLuxury ? 'bg-[#0A0A0E]' : isMoroccan ? 'bg-[#FAF3EB]' : 'bg-stone-50'
          }`}
        >
          <p className={`text-[11px] ${theme.mutedTextClass} font-medium`}>
            Tous nos prix sont exprimés en {restaurant.currency} TTC.
          </p>
          <p className={`text-[11px] font-medium tracking-wide ${theme.mutedTextClass}`}>
            Powered by{' '}
            <span
              className={`font-semibold ${
                isLuxury
                  ? 'text-[#D4AF37]'
                  : isMoroccan
                  ? 'text-[#9A3412]'
                  : 'text-stone-800'
              }`}
            >
              TouchBizz
            </span>
          </p>
        </footer>
      </div>

      {/* ITEM DETAIL MODAL */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col ${
              isLuxury ? 'bg-[#14141B] text-stone-100 border border-[#D4AF37]/30' : 'bg-white text-stone-900'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Image Header */}
            <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden shrink-0">
              {selectedItem.image_url ? (
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className={`w-full h-full object-cover ${!selectedItem.is_available ? 'grayscale' : ''}`}
                />
              ) : (
                <div
                  className={`w-full h-full flex items-center justify-center ${
                    isLuxury ? 'bg-[#1B1B24] text-stone-600' : 'bg-stone-100 text-stone-400'
                  }`}
                >
                  <UtensilsCrossed className="w-12 h-12" />
                </div>
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Price Badge */}
              <div
                className={`absolute bottom-3 right-3 font-extrabold text-sm px-3.5 py-1.5 rounded-xl shadow-md ${
                  theme.priceBadgeBg
                } ${theme.priceBadgeText}`}
              >
                {selectedItem.price} {restaurant.currency}
              </div>

              {!selectedItem.is_available && (
                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Momentanément indisponible
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <h3 className={`text-xl font-bold ${theme.titleClass}`}>
                  {selectedItem.name}
                </h3>
                <p
                  className={`text-xs mt-2 leading-relaxed whitespace-pre-line ${
                    isLuxury ? 'text-stone-300' : 'text-stone-600'
                  }`}
                >
                  {selectedItem.description || 'Préparation fraîche selon arrivage du jour.'}
                </p>
              </div>

              <div
                className={`pt-4 border-t ${
                  isLuxury ? 'border-stone-800 text-stone-500' : 'border-stone-100 text-stone-500'
                } flex items-center justify-between text-xs`}
              >
                <span>Renseignez-vous auprès de notre équipe pour toute allergie.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 13. INDIVIDUAL FOOD CARD COMPONENT (Multi-Theme Adaptive)
interface FoodCardProps {
  key?: React.Key;
  item: MenuItem;
  currency: string;
  themeKey: ThemeType;
  onSelect: () => void;
}

function FoodCard({ item, currency, themeKey, onSelect }: FoodCardProps) {
  const theme = THEMES[themeKey] || THEMES.modern;
  const isLuxury = themeKey === 'luxury';
  const isMinimal = themeKey === 'minimal';
  const isMoroccan = themeKey === 'moroccan';

  // Minimal theme render
  if (isMinimal) {
    return (
      <div
        onClick={onSelect}
        className={`py-3.5 border-b border-stone-200 flex items-center justify-between gap-4 cursor-pointer group hover:bg-stone-50/70 transition px-1 ${
          !item.is_available ? 'opacity-50' : ''
        }`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-bold text-black text-sm group-hover:underline">
              {item.name}
            </h3>
            <span className="font-black text-sm text-black shrink-0">
              {item.price} {currency}
            </span>
          </div>
          {item.description && (
            <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
          {!item.is_available && (
            <span className="inline-block text-[10px] font-bold text-red-600 mt-1">
              Épuisé
            </span>
          )}
        </div>

        {item.image_url && (
          <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-100">
            <img
              src={item.image_url}
              alt={item.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    );
  }

  // Modern, Luxury, Moroccan render
  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl overflow-hidden flex flex-col cursor-pointer group ${
        theme.cardBg
      } ${theme.cardBorder} ${theme.cardHover} ${
        item.is_available ? '' : 'opacity-70'
      }`}
    >
      {/* Food Photo Container */}
      <div className="relative aspect-[16/10] bg-stone-900 overflow-hidden">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              !item.is_available ? 'grayscale' : ''
            }`}
          />
        ) : (
          <div
            className={`w-full h-full flex flex-col items-center justify-center ${
              isLuxury ? 'bg-[#15151C] text-stone-600' : 'bg-stone-100 text-stone-300'
            }`}
          >
            <UtensilsCrossed className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-medium opacity-70">TouchBizz Menu</span>
          </div>
        )}

        {/* Unavailable Ribbon */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md">
              Épuisé
            </span>
          </div>
        )}

        {/* Price Tag on Card */}
        <div
          className={`absolute bottom-2.5 right-2.5 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm ${
            theme.priceBadgeBg
          } ${theme.priceBadgeText}`}
        >
          {item.price} {currency}
        </div>
      </div>

      {/* Text Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className={`font-bold text-sm leading-snug transition ${
              isLuxury
                ? 'text-stone-100 group-hover:text-[#D4AF37]'
                : isMoroccan
                ? 'text-[#431407] group-hover:text-[#9A3412]'
                : 'text-stone-900 group-hover:text-slate-600'
            }`}
          >
            {item.name}
          </h3>
          {item.description && (
            <p
              className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                isLuxury ? 'text-stone-400' : 'text-stone-500'
              }`}
            >
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
