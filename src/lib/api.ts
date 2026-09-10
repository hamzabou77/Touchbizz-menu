import { Restaurant, Category, MenuItem, User, ThemeType } from '../types';

const TOKEN_KEY = 'touchbizz_auth_token';

export const tokenStorage = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string | null): void => {
    try {
      if (!token) {
        localStorage.removeItem(TOKEN_KEY);
      } else {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch {
      // ignore
    }
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erreur serveur (${response.status})`);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password?: string) => {
      const res = await request<{ success: boolean; user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) tokenStorage.set(res.token);
      return res;
    },
    register: async (email: string, password?: string, name?: string) => {
      const res = await request<{ success: boolean; user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      if (res.token) tokenStorage.set(res.token);
      return res;
    },
    me: async () => {
      return request<{ user: User }>('/api/auth/me');
    },
    logout: async () => {
      tokenStorage.set(null);
    },
    forgotPassword: async (email: string) => {
      return request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
  },

  // Restaurants
  restaurants: {
    list: async (): Promise<Restaurant[]> => {
      return request<Restaurant[]>('/api/restaurants');
    },
    create: async (data: { name: string; slug?: string; currency?: string; theme?: ThemeType }): Promise<Restaurant> => {
      return request<Restaurant>('/api/restaurants', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, updates: Partial<Restaurant>): Promise<Restaurant> => {
      return request<Restaurant>(`/api/restaurants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    togglePublish: async (id: string): Promise<{ success: boolean; is_published: boolean }> => {
      return request<{ success: boolean; is_published: boolean }>(`/api/restaurants/${id}/toggle-publish`, {
        method: 'POST',
      });
    },
  },

  // Categories
  categories: {
    list: async (restaurantId: string): Promise<Category[]> => {
      return request<Category[]>(`/api/restaurants/${restaurantId}/categories`);
    },
    create: async (restaurantId: string, data: { name: string; description?: string }): Promise<Category> => {
      return request<Category>(`/api/restaurants/${restaurantId}/categories`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, updates: Partial<Category>): Promise<Category> => {
      return request<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return request<{ success: boolean }>(`/api/categories/${id}`, {
        method: 'DELETE',
      });
    },
    reorder: async (restaurantId: string, orderedIds: string[]): Promise<{ success: boolean }> => {
      return request<{ success: boolean }>(`/api/restaurants/${restaurantId}/categories/reorder`, {
        method: 'POST',
        body: JSON.stringify({ orderedIds }),
      });
    },
  },

  // Menu Items
  items: {
    list: async (restaurantId: string): Promise<MenuItem[]> => {
      return request<MenuItem[]>(`/api/restaurants/${restaurantId}/items`);
    },
    create: async (
      restaurantId: string,
      data: {
        category_id: string;
        name: string;
        description: string;
        price: number;
        image_url?: string;
        is_available?: boolean;
      }
    ): Promise<MenuItem> => {
      return request<MenuItem>(`/api/restaurants/${restaurantId}/items`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    update: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem> => {
      return request<MenuItem>(`/api/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    delete: async (id: string): Promise<{ success: boolean }> => {
      return request<{ success: boolean }>(`/api/items/${id}`, {
        method: 'DELETE',
      });
    },
    toggleAvailability: async (id: string): Promise<{ success: boolean; is_available: boolean }> => {
      return request<{ success: boolean; is_available: boolean }>(`/api/items/${id}/toggle-availability`, {
        method: 'POST',
      });
    },
    reorder: async (restaurantId: string, orderedIds: string[]): Promise<{ success: boolean }> => {
      return request<{ success: boolean }>(`/api/restaurants/${restaurantId}/items/reorder`, {
        method: 'POST',
        body: JSON.stringify({ orderedIds }),
      });
    },
  },

  // File & Image Uploads
  upload: {
    uploadImage: async (fileOrDataUrl: File | string): Promise<{ url: string }> => {
      if (typeof fileOrDataUrl === 'string') {
        // Base64 upload
        const res = await request<{ success: boolean; url: string }>('/api/upload', {
          method: 'POST',
          body: JSON.stringify({ data: fileOrDataUrl }),
        });
        return { url: res.url };
      } else {
        // File object upload
        const formData = new FormData();
        formData.append('image', fileOrDataUrl);
        const res = await request<{ success: boolean; url: string }>('/api/upload', {
          method: 'POST',
          body: formData,
        });
        return { url: res.url };
      }
    },
  },

  // Public Menu (Isolated, patron view)
  publicMenu: {
    getBySlug: async (slug: string): Promise<{
      restaurant: Restaurant;
      categories: Category[];
      items: MenuItem[];
    }> => {
      return request<{
        restaurant: Restaurant;
        categories: Category[];
        items: MenuItem[];
      }>(`/api/public/menu/${slug}`);
    },
  },

  // System Health
  health: async () => {
    return request<{ status: string; database: { isConfigured: boolean; isConnected: boolean; host: string; database: string } }>(
      '/api/health'
    );
  },
};
