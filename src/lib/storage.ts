import { Restaurant, Category, MenuItem, User } from '../types';

export const INITIAL_USER: User = {
  id: 'usr-touchbizz-owner-1',
  email: 'owner@latablemarrakech.ma',
  name: 'Karim Benjelloun',
  created_at: new Date().toISOString(),
};

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-marrakech-1',
    owner_id: 'usr-touchbizz-owner-1',
    name: 'La Table de Marrakech',
    slug: 'la-table-marrakech',
    logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    description: 'Cuisine marocaine raffinée, tajines d’exception mijotés au feu de bois et douceurs orientales.',
    phone: '+212 5 24 43 21 00',
    address: '42 Rue Yves Saint Laurent, Guéliz, Marrakech',
    currency: 'DH',
    primary_color: '#9A3412', // Terracotta amber
    theme: 'moroccan',
    is_published: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'rest-bistrot-2',
    owner_id: 'usr-touchbizz-owner-1',
    name: 'Bistrot & Burgers Casablanca',
    slug: 'bistrot-burgers',
    logo_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&auto=format&fit=crop&q=80',
    cover_image_url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&auto=format&fit=crop&q=80',
    description: 'Smash burgers artisanaux, frites croustillantes à la truffe et mocktails signature.',
    phone: '+212 5 22 98 76 54',
    address: '15 Boulevard d’Anfa, Casablanca',
    currency: 'DH',
    primary_color: '#0F172A', // Slate dark
    theme: 'modern',
    is_published: true,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  // Categories for La Table de Marrakech
  {
    id: 'cat-entrees-1',
    restaurant_id: 'rest-marrakech-1',
    name: 'Entrées & Salades',
    description: 'Sélection d’entrées fraîches et salades traditionnelles marocaines',
    display_order: 1,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-tajines-2',
    restaurant_id: 'rest-marrakech-1',
    name: 'Tajines & Plats Signature',
    description: 'Nos grands classiques cuisinés dans la pure tradition marocaine',
    display_order: 2,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-grillades-3',
    restaurant_id: 'rest-marrakech-1',
    name: 'Grillades au Charbon',
    description: 'Viandes sélectionnées et marinées aux épices du souk',
    display_order: 3,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-desserts-4',
    restaurant_id: 'rest-marrakech-1',
    name: 'Desserts & Pâtisseries',
    description: 'Douceurs parfumées à la fleur d’oranger et amandes',
    display_order: 4,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-boissons-5',
    restaurant_id: 'rest-marrakech-1',
    name: 'Thés & Rafraîchissements',
    description: 'Thé vert à la menthe fraîche et jus de fruits pressés minute',
    display_order: 5,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Categories for Bistrot & Burgers
  {
    id: 'cat-bb-burgers',
    restaurant_id: 'rest-bistrot-2',
    name: 'Burgers Gourmet',
    description: 'Pain brioché artisanal doré au beurre et bœuf charolais',
    display_order: 1,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-bb-sides',
    restaurant_id: 'rest-bistrot-2',
    name: 'Sides & Finger Food',
    description: 'À partager ou à savourer en solo',
    display_order: 2,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat-bb-drinks',
    restaurant_id: 'rest-bistrot-2',
    name: 'Boissons & Shakes',
    description: 'Milkshakes onctueux et sodas artisanaux',
    display_order: 3,
    is_visible: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Items for La Table de Marrakech - Entrées
  {
    id: 'item-salades-trio',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-entrees-1',
    name: 'Trio de Salades Marocaines',
    description: 'Zaalouk d’aubergines grillées, Taktouka de poivrons rôtis et carottes confites au cumin et coriandre.',
    price: 65,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
    display_order: 1,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-pastilla-poulet',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-entrees-1',
    name: 'Pastilla Fassi au Poulet & Amandes',
    description: 'Feuilleté croustillant garni de poulet fermier effiloché, amandes torréfiées, cannelle et sucre glace.',
    price: 95,
    image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
    display_order: 2,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-briouates-fromage',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-entrees-1',
    name: 'Assortiment de Briouates Dorées',
    description: 'Petits triangles croustillants au fromage de chèvre frais, thym sauvage et viande hachée épicée.',
    price: 70,
    image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80',
    display_order: 3,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Plats Signature
  {
    id: 'item-tajine-agneau',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-tajines-2',
    name: 'Tajine d’Agneau aux Pruneaux & Amandes',
    description: 'Souris d’agneau fondante caramélisée, pruneaux moelleux, sésame doré et amandes émondées croustillantes.',
    price: 145,
    image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
    display_order: 1,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-tajine-poulet-citron',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-tajines-2',
    name: 'Tajine de Poulet Fermier au Citron Confit',
    description: 'Coquelet braisé au safran de Taliouine, olives violettes de Meslalla et citrons beldi confits.',
    price: 120,
    image_url: 'https://images.unsplash.com/photo-1574484284002-952d92456975?w=800&auto=format&fit=crop&q=80',
    display_order: 2,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-couscous-royal',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-tajines-2',
    name: 'Couscous Royal aux 7 Légumes',
    description: 'Semoule fine cuite à la vapeur, agneau, poulet, merguez artisanale, bouillon aux épices et tfaya.',
    price: 155,
    image_url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=800&auto=format&fit=crop&q=80',
    display_order: 3,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Grillades
  {
    id: 'item-brochettes-kefta',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-grillades-3',
    name: 'Brochettes de Kefta Façon Guéliz',
    description: 'Bœuf haché minute mariné aux oignons rouges, persil plat et paprika fumé, servi avec légumes braisés.',
    price: 110,
    image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
    display_order: 1,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-cotelettes-agneau',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-grillades-3',
    name: 'Côtelettes d’Agneau Grillées au Romarin',
    description: 'Grillées sur braise ardente, fleur de sel d’Ourika et pommes grenailles sautées à l’ail.',
    price: 160,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    display_order: 2,
    is_available: false, // Demo unavailable state!
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Desserts
  {
    id: 'item-pastilla-lait',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-desserts-4',
    name: 'Ktéfa (Pastilla au Lait & Fleur d’Oranger)',
    description: 'Feuilles de ouarka croustillantes, crème légère infusée à l’eau de fleur d’oranger et amandes pilées.',
    price: 60,
    image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    display_order: 1,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-corne-gazelle',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-desserts-4',
    name: 'Cornes de Gazelle Artisanales (3 pcs)',
    description: 'Pâte fine garnie de pure pâte d’amandes parfumée à la gomme arabique et fleur d’oranger.',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    display_order: 2,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Boissons
  {
    id: 'item-the-menthe',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-boissons-5',
    name: 'Thé à la Menthe Fraîche Traditionnel',
    description: 'Servi au verre haut traditionnel avec menthe fraîche de l’Ourika et pignons de pin torréfiés.',
    price: 30,
    image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    display_order: 1,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-jus-orange-maroc',
    restaurant_id: 'rest-marrakech-1',
    category_id: 'cat-boissons-5',
    name: 'Jus d’Orange Frais Pressé Minute',
    description: 'Oranges douces de la plaine du Haouz, pressées à la commande.',
    price: 35,
    image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80',
    display_order: 2,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Items for Bistrot & Burgers
  {
    id: 'item-burger-smash-classic',
    restaurant_id: 'rest-bistrot-2',
    category_id: 'cat-bb-burgers',
    name: 'Double Smash Cheeseburger',
    description: 'Deux steaks smashés croustillants, double cheddar affiné fondu, pickles maison et sauce secrète TouchBizz.',
    price: 79,
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    display_order: 1,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-burger-truffe',
    restaurant_id: 'rest-bistrot-2',
    category_id: 'cat-bb-burgers',
    name: 'Burger Royal à la Truffe Noire',
    description: 'Bœuf charolais, tombée de champignons sauvages, mayonnaise à la truffe d’été et roquette poivrée.',
    price: 99,
    image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
    display_order: 2,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item-frites-truffe',
    restaurant_id: 'rest-bistrot-2',
    category_id: 'cat-bb-sides',
    name: 'Frites Maison au Parmesan & Truffe',
    description: 'Pommes de terre fraîches double cuisson, huile de truffe blanche et copeaux de parmesan 24 mois.',
    price: 45,
    image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80',
    display_order: 1,
    is_available: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Persistent Local Multi-tenant Store
const STORAGE_KEYS = {
  USER: 'touchbizz_user',
  RESTAURANTS: 'touchbizz_restaurants',
  CATEGORIES: 'touchbizz_categories',
  MENU_ITEMS: 'touchbizz_menu_items',
  ACTIVE_RESTAURANT_ID: 'touchbizz_active_restaurant_id',
  SUBSCRIPTION: 'touchbizz_subscription',
};

export const localStore = {
  getUser(): User {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to read user from localStorage', e);
    }
    return INITIAL_USER;
  },

  setUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  },

  getRestaurants(): Restaurant[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RESTAURANTS);
      if (stored) {
        const parsed: Restaurant[] = JSON.parse(stored);
        return parsed.map(r => ({
          ...r,
          theme: r.theme || (r.id === 'rest-marrakech-1' ? 'moroccan' : 'modern'),
        }));
      }
    } catch (e) {
      console.warn('Failed to read restaurants from localStorage', e);
    }
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(INITIAL_RESTAURANTS));
    return INITIAL_RESTAURANTS;
  },

  saveRestaurants(restaurants: Restaurant[]): void {
    localStorage.setItem(STORAGE_KEYS.RESTAURANTS, JSON.stringify(restaurants));
  },

  getCategories(): Category[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) {
        const parsed: Category[] = JSON.parse(stored);
        return parsed.map(c => ({
          ...c,
          sort_order: c.sort_order ?? c.display_order ?? 0,
        }));
      }
    } catch (e) {
      console.warn('Failed to read categories from localStorage', e);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  },

  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getMenuItems(): MenuItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
      if (stored) {
        const parsed: MenuItem[] = JSON.parse(stored);
        return parsed.map(i => ({
          ...i,
          sort_order: i.sort_order ?? i.display_order ?? 0,
        }));
      }
    } catch (e) {
      console.warn('Failed to read menu items from localStorage', e);
    }
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(INITIAL_MENU_ITEMS));
    return INITIAL_MENU_ITEMS;
  },

  saveMenuItems(items: MenuItem[]): void {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
  },

  getActiveRestaurantId(): string {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID);
    if (stored) return stored;
    return INITIAL_RESTAURANTS[0].id;
  },

  setActiveRestaurantId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_RESTAURANT_ID, id);
  }
};
