import { ThemeType } from '../types';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  subtitle: string;
  previewBg: string;
  previewAccent: string;
  previewText: string;
  // Classes used in PublicMenu
  containerBg: string;
  menuFrameBg: string;
  borderClass: string;
  titleClass: string;
  bodyTextClass: string;
  mutedTextClass: string;
  categoryNavBg: string;
  categoryBtnActive: string;
  categoryBtnInactive: string;
  cardBg: string;
  cardBorder: string;
  cardHover: string;
  priceBadgeBg: string;
  priceBadgeText: string;
  headerOverlay: string;
  badgeAccent: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern Premium',
    subtitle: 'Épuré, contemporain et équilibré avec une typographie soignée',
    previewBg: '#F8FAFC',
    previewAccent: '#0F172A',
    previewText: '#1E293B',
    containerBg: 'bg-slate-100/70',
    menuFrameBg: 'bg-white',
    borderClass: 'border-slate-200/80',
    titleClass: 'font-sans font-extrabold text-slate-900 tracking-tight',
    bodyTextClass: 'text-slate-700',
    mutedTextClass: 'text-slate-500',
    categoryNavBg: 'bg-white/95 backdrop-blur-md border-b border-slate-200/80',
    categoryBtnActive: 'bg-slate-900 text-white shadow-xs',
    categoryBtnInactive: 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
    cardBg: 'bg-white',
    cardBorder: 'border border-slate-200/70 hover:border-slate-400',
    cardHover: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    priceBadgeBg: 'bg-slate-900',
    priceBadgeText: 'text-white',
    headerOverlay: 'bg-gradient-to-b from-black/40 via-black/20 to-black/60',
    badgeAccent: 'bg-slate-900 text-white',
  },
  luxury: {
    id: 'luxury',
    name: 'Luxury',
    subtitle: 'Ambiance feutrée, noir profond & accents or satiné pour haute gastronomie',
    previewBg: '#0F0F13',
    previewAccent: '#D4AF37',
    previewText: '#F5F5F7',
    containerBg: 'bg-[#08080A]',
    menuFrameBg: 'bg-[#0F0F14]',
    borderClass: 'border-[#D4AF37]/25',
    titleClass: 'font-serif font-bold text-[#F8F8FA] tracking-normal',
    bodyTextClass: 'text-stone-300',
    mutedTextClass: 'text-[#D4AF37]/75',
    categoryNavBg: 'bg-[#0F0F14]/95 backdrop-blur-md border-b border-[#D4AF37]/20',
    categoryBtnActive: 'bg-[#D4AF37] text-stone-950 font-black shadow-sm',
    categoryBtnInactive: 'bg-[#181820] text-stone-300 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50',
    cardBg: 'bg-[#16161D]',
    cardBorder: 'border border-[#D4AF37]/25 hover:border-[#D4AF37]/60',
    cardHover: 'hover:shadow-[0_8px_20px_rgba(212,175,55,0.12)] hover:-translate-y-0.5 transition-all duration-200',
    priceBadgeBg: 'bg-[#D4AF37]',
    priceBadgeText: 'text-stone-950 font-black',
    headerOverlay: 'bg-gradient-to-b from-black/60 via-black/40 to-[#0F0F14]',
    badgeAccent: 'bg-[#D4AF37] text-stone-950',
  },
  moroccan: {
    id: 'moroccan',
    name: 'Moroccan',
    subtitle: 'Chaleur marocaine, tons terre cuite, ambre et hospitalité traditionnelle',
    previewBg: '#FDF8F3',
    previewAccent: '#9A3412',
    previewText: '#431407',
    containerBg: 'bg-[#F9EDE1]/70',
    menuFrameBg: 'bg-[#FFFAF5]',
    borderClass: 'border-[#EAD3BD]',
    titleClass: 'font-serif font-bold text-[#431407] tracking-tight',
    bodyTextClass: 'text-[#6C2E17]',
    mutedTextClass: 'text-[#9A3412]/80',
    categoryNavBg: 'bg-[#FFFAF5]/95 backdrop-blur-md border-b border-[#EAD3BD]',
    categoryBtnActive: 'bg-[#9A3412] text-white shadow-xs',
    categoryBtnInactive: 'bg-[#F5E5D5] text-[#78350F] hover:bg-[#EBD2BD]',
    cardBg: 'bg-white',
    cardBorder: 'border border-[#EAD3BD] hover:border-[#9A3412]/60',
    cardHover: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
    priceBadgeBg: 'bg-[#9A3412]',
    priceBadgeText: 'text-white',
    headerOverlay: 'bg-gradient-to-b from-black/45 via-black/20 to-[#FFFAF5]/90',
    badgeAccent: 'bg-[#9A3412] text-white',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    subtitle: 'Clarté radicale, grands espaces blancs et mise en valeur absolue des plats',
    previewBg: '#FFFFFF',
    previewAccent: '#000000',
    previewText: '#18181B',
    containerBg: 'bg-[#FAFAFA]',
    menuFrameBg: 'bg-white',
    borderClass: 'border-stone-200',
    titleClass: 'font-sans font-bold text-black tracking-tighter',
    bodyTextClass: 'text-stone-800',
    mutedTextClass: 'text-stone-400',
    categoryNavBg: 'bg-white/95 backdrop-blur-md border-b border-stone-200',
    categoryBtnActive: 'bg-black text-white',
    categoryBtnInactive: 'bg-transparent text-stone-500 hover:text-black hover:bg-stone-100',
    cardBg: 'bg-white',
    cardBorder: 'border-b border-stone-200/80 rounded-none pb-4',
    cardHover: 'hover:bg-stone-50/50 transition-colors duration-150',
    priceBadgeBg: 'bg-stone-100',
    priceBadgeText: 'text-black font-extrabold',
    headerOverlay: 'bg-gradient-to-b from-black/30 via-transparent to-black/50',
    badgeAccent: 'bg-black text-white',
  },
};
