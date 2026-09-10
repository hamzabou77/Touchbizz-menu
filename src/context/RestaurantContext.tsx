import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Restaurant, Category, MenuItem, ThemeType } from '../types';
import { localStore } from '../lib/storage';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface RestaurantContextType {
  restaurants: Restaurant[];
  activeRestaurant: Restaurant | null;
  categories: Category[];
  menuItems: MenuItem[];
  setActiveRestaurantId: (id: string) => void;
  updateRestaurant: (updates: Partial<Restaurant>) => Promise<void>;
  createRestaurant: (data: { name: string; slug?: string; currency?: string; theme?: ThemeType }) => Promise<Restaurant>;
  togglePublish: () => Promise<boolean>;
  
  // Categories CRUD
  addCategory: (data: { name: string; description?: string }) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (orderedList: Category[]) => Promise<void>;

  // Items CRUD
  addItem: (data: {
    category_id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    is_available?: boolean;
  }) => Promise<MenuItem>;
  updateItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItemAvailability: (id: string) => Promise<void>;
  reorderItems: (orderedList: MenuItem[]) => Promise<void>;

  // Public Access
  getPublicRestaurant: (slug: string) => Restaurant | undefined;
  getPublicCategories: (restaurantId: string) => Category[];
  getPublicItems: (restaurantId: string) => MenuItem[];
  refreshData: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>(() => localStore.getRestaurants());
  const [allCategories, setAllCategories] = useState<Category[]>(() => localStore.getCategories());
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>(() => localStore.getMenuItems());
  const [activeRestaurantId, setActiveRestaurantIdState] = useState<string>(() => localStore.getActiveRestaurantId());

  // Current active restaurant
  const activeRestaurant = useMemo(() => {
    return allRestaurants.find(r => r.id === activeRestaurantId) || allRestaurants[0] || null;
  }, [allRestaurants, activeRestaurantId]);

  // Load from Backend MySQL / API when authenticated or active restaurant changes
  const refreshData = useCallback(async () => {
    try {
      if (user) {
        const serverRestaurants = await api.restaurants.list();
        if (serverRestaurants && serverRestaurants.length > 0) {
          setAllRestaurants(serverRestaurants);
          localStore.saveRestaurants(serverRestaurants);

          const targetId = activeRestaurantId && serverRestaurants.some(r => r.id === activeRestaurantId)
            ? activeRestaurantId
            : serverRestaurants[0].id;
          
          setActiveRestaurantIdState(targetId);
          localStore.setActiveRestaurantId(targetId);

          // Fetch categories and items for this active restaurant
          const [cats, items] = await Promise.all([
            api.categories.list(targetId),
            api.items.list(targetId),
          ]);

          if (cats) {
            setAllCategories(prev => {
              const other = prev.filter(c => c.restaurant_id !== targetId);
              const merged = [...other, ...cats];
              localStore.saveCategories(merged);
              return merged;
            });
          }

          if (items) {
            setAllMenuItems(prev => {
              const other = prev.filter(i => i.restaurant_id !== targetId);
              const merged = [...other, ...items];
              localStore.saveMenuItems(merged);
              return merged;
            });
          }
        }
      }
    } catch (err) {
      console.warn('[TouchBizz Sync] Using local cached records:', err);
    }
  }, [user, activeRestaurantId]);

  useEffect(() => {
    refreshData();
  }, [user, refreshData]);

  // Active restaurant's categories (sorted by display_order)
  const activeCategories = useMemo(() => {
    if (!activeRestaurant) return [];
    return allCategories
      .filter(c => c.restaurant_id === activeRestaurant.id)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allCategories, activeRestaurant]);

  // Active restaurant's menu items
  const activeMenuItems = useMemo(() => {
    if (!activeRestaurant) return [];
    return allMenuItems
      .filter(i => i.restaurant_id === activeRestaurant.id)
      .sort((a, b) => a.display_order - b.display_order);
  }, [allMenuItems, activeRestaurant]);

  const setActiveRestaurantId = async (id: string) => {
    setActiveRestaurantIdState(id);
    localStore.setActiveRestaurantId(id);

    try {
      const [cats, items] = await Promise.all([
        api.categories.list(id),
        api.items.list(id),
      ]);
      if (cats) {
        setAllCategories(prev => {
          const other = prev.filter(c => c.restaurant_id !== id);
          const merged = [...other, ...cats];
          localStore.saveCategories(merged);
          return merged;
        });
      }
      if (items) {
        setAllMenuItems(prev => {
          const other = prev.filter(i => i.restaurant_id !== id);
          const merged = [...other, ...items];
          localStore.saveMenuItems(merged);
          return merged;
        });
      }
    } catch {
      // ignore
    }
  };

  const updateRestaurant = async (updates: Partial<Restaurant>) => {
    if (!activeRestaurant) return;
    
    // Optimistic update
    const updated = allRestaurants.map(r => {
      if (r.id === activeRestaurant.id) {
        return {
          ...r,
          ...updates,
          updated_at: new Date().toISOString(),
        };
      }
      return r;
    });
    setAllRestaurants(updated);
    localStore.saveRestaurants(updated);

    try {
      await api.restaurants.update(activeRestaurant.id, updates);
    } catch (err) {
      console.error('[TouchBizz MySQL] Failed to update restaurant on server:', err);
    }
  };

  const createRestaurant = async (data: { name: string; slug?: string; currency?: string; theme?: ThemeType }): Promise<Restaurant> => {
    try {
      const serverNew = await api.restaurants.create(data);
      const updatedList = [...allRestaurants, serverNew];
      setAllRestaurants(updatedList);
      localStore.saveRestaurants(updatedList);
      setActiveRestaurantId(serverNew.id);
      return serverNew;
    } catch (err) {
      console.warn('[TouchBizz] Server create failed, using local generation:', err);
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newRest: Restaurant = {
        id: 'rest-' + Math.random().toString(36).substring(2, 9),
        owner_id: user?.id || 'usr-default',
        name: data.name,
        slug,
        logo_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
        cover_image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
        description: 'Bienvenue sur notre menu digital interactif.',
        phone: '+212 5 00 00 00 00',
        address: 'Marrakech, Maroc',
        currency: data.currency || 'DH',
        primary_color: '#9A3412',
        theme: data.theme || 'modern',
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedList = [...allRestaurants, newRest];
      setAllRestaurants(updatedList);
      localStore.saveRestaurants(updatedList);
      setActiveRestaurantId(newRest.id);
      return newRest;
    }
  };

  const togglePublish = async (): Promise<boolean> => {
    if (!activeRestaurant) return false;
    const nextState = !activeRestaurant.is_published;
    await updateRestaurant({ is_published: nextState });

    try {
      await api.restaurants.togglePublish(activeRestaurant.id);
    } catch (err) {
      console.error('[TouchBizz MySQL] Failed to toggle publish on server:', err);
    }
    return nextState;
  };

  const addCategory = async (data: { name: string; description?: string }): Promise<Category> => {
    if (!activeRestaurant) throw new Error('Aucun restaurant actif');
    
    try {
      const serverCat = await api.categories.create(activeRestaurant.id, data);
      setAllCategories(prev => {
        const next = [...prev, serverCat];
        localStore.saveCategories(next);
        return next;
      });
      return serverCat;
    } catch (err) {
      console.warn('[TouchBizz] Server addCategory failed, creating locally:', err);
      const order = activeCategories.length + 1;
      const newCat: Category = {
        id: 'cat-' + Math.random().toString(36).substring(2, 9),
        restaurant_id: activeRestaurant.id,
        name: data.name,
        description: data.description || '',
        sort_order: order,
        display_order: order,
        is_visible: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAllCategories(prev => {
        const next = [...prev, newCat];
        localStore.saveCategories(next);
        return next;
      });
      return newCat;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    setAllCategories(prev => {
      const next = prev.map(cat => (cat.id === id ? { ...cat, ...updates, updated_at: new Date().toISOString() } : cat));
      localStore.saveCategories(next);
      return next;
    });

    try {
      await api.categories.update(id, updates);
    } catch (err) {
      console.error('[TouchBizz MySQL] Failed to update category on server:', err);
    }
  };

  const deleteCategory = async (id: string) => {
    setAllCategories(prev => {
      const next = prev.filter(c => c.id !== id);
      localStore.saveCategories(next);
      return next;
    });
    setAllMenuItems(prev => {
      const next = prev.filter(item => item.category_id !== id);
      localStore.saveMenuItems(next);
      return next;
    });

    try {
      await api.categories.delete(id);
    } catch (err) {
      console.error('[TouchBizz MySQL] Failed to delete category on server:', err);
    }
  };

  const reorderCategories = async (orderedList: Category[]) => {
    const updated = orderedList.map((cat, idx) => ({
      ...cat,
      sort_order: idx + 1,
      display_order: idx + 1,
      updated_at: new Date().toISOString(),
    }));

    setAllCategories(prev => {
      const restIds = new Set(orderedList.map(o => o.id));
      const untouched = prev.filter(c => !restIds.has(c.id));
      const next = [...untouched, ...updated];
      localStore.saveCategories(next);
      return next;
    });

    if (activeRestaurant) {
      try {
        await api.categories.reorder(activeRestaurant.id, orderedList.map(c => c.id));
      } catch (err) {
        console.error('[TouchBizz MySQL] Failed to reorder categories on server:', err);
      }
    }
  };

  const addItem = async (data: {
    category_id: string;
    name: string;
    description: string;
    price: number;
    image_url?: string;
    is_available?: boolean;
  }): Promise<MenuItem> => {
    if (!activeRestaurant) throw new Error('Aucun restaurant actif');
    
    try {
      const serverItem = await api.items.create(activeRestaurant.id, data);
      setAllMenuItems(prev => {
        const next = [...prev, serverItem];
        localStore.saveMenuItems(next);
        return next;
      });
      return serverItem;
    } catch (err) {
      console.warn('[TouchBizz] Server addItem failed, creating locally:', err);
      const order = activeMenuItems.filter(i => i.category_id === data.category_id).length + 1;
      const newItem: MenuItem = {
        id: 'item-' + Math.random().toString(36).substring(2, 9),
        restaurant_id: activeRestaurant.id,
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        image_url: data.image_url || '',
        sort_order: order,
        display_order: order,
        is_available: data.is_available !== undefined ? data.is_available : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setAllMenuItems(prev => {
        const next = [...prev, newItem];
        localStore.saveMenuItems(next);
        return next;
      });
      return newItem;
    }
  };

  const updateItem = async (id: string, updates: Partial<MenuItem>) => {
    setAllMenuItems(prev => {
      const next = prev.map(i => (i.id === id ? { ...i, ...updates, updated_at: new Date().toISOString() } : i));
      localStore.saveMenuItems(next);
      return next;
    });

    try {
      await api.items.update(id, updates);
    } catch (err) {
      console.error('[TouchBizz MySQL] Failed to update item on server:', err);
    }
  };

  const deleteItem = async (id: string) => {
    setAllMenuItems(prev => {
      const next = prev.filter(i => i.id !== id);
      localStore.saveMenuItems(next);
      return next;
    });

    try {
      await api.items.delete(id);
    } catch (err) {
      console.error('[TouchBizz MySQL] Failed to delete item on server:', err);
    }
  };

  const toggleItemAvailability = async (id: string) => {
    const item = allMenuItems.find(i => i.id === id);
    if (!item) return;
    await updateItem(id, { is_available: !item.is_available });

    try {
      await api.items.toggleAvailability(id);
    } catch (err) {
      console.error('[TouchBizz MySQL] Failed to toggle item availability on server:', err);
    }
  };

  const reorderItems = async (orderedList: MenuItem[]) => {
    const updated = orderedList.map((it, idx) => ({
      ...it,
      sort_order: idx + 1,
      display_order: idx + 1,
      updated_at: new Date().toISOString(),
    }));

    setAllMenuItems(prev => {
      const ids = new Set(orderedList.map(o => o.id));
      const untouched = prev.filter(i => !ids.has(i.id));
      const next = [...untouched, ...updated];
      localStore.saveMenuItems(next);
      return next;
    });

    if (activeRestaurant) {
      try {
        await api.items.reorder(activeRestaurant.id, orderedList.map(i => i.id));
      } catch (err) {
        console.error('[TouchBizz MySQL] Failed to reorder items on server:', err);
      }
    }
  };

  // Public methods
  const getPublicRestaurant = (slug: string): Restaurant | undefined => {
    return allRestaurants.find(r => r.slug.toLowerCase() === slug.toLowerCase());
  };

  const getPublicCategories = (restaurantId: string): Category[] => {
    return allCategories
      .filter(c => c.restaurant_id === restaurantId && c.is_visible)
      .sort((a, b) => a.display_order - b.display_order);
  };

  const getPublicItems = (restaurantId: string): MenuItem[] => {
    return allMenuItems
      .filter(i => i.restaurant_id === restaurantId)
      .sort((a, b) => a.display_order - b.display_order);
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurants: allRestaurants,
        activeRestaurant,
        categories: activeCategories,
        menuItems: activeMenuItems,
        setActiveRestaurantId,
        updateRestaurant,
        createRestaurant,
        togglePublish,
        addCategory,
        updateCategory,
        deleteCategory,
        reorderCategories,
        addItem,
        updateItem,
        deleteItem,
        toggleItemAvailability,
        reorderItems,
        getPublicRestaurant,
        getPublicCategories,
        getPublicItems,
        refreshData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) throw new Error('useRestaurant must be used within a RestaurantProvider');
  return context;
}
