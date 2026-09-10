export type ThemeType = 'modern' | 'luxury' | 'moroccan' | 'minimal';

export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string;
  cover_image_url: string;
  description: string;
  phone: string;
  address: string;
  currency: string;
  primary_color: string;
  theme: ThemeType;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  sort_order?: number;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  sort_order?: number;
  display_order: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

