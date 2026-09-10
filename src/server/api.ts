import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { query, queryOne, getDatabaseStatus, memoryStore, isMySQLConfigured } from './db';
import { hashPassword, verifyPassword, generateToken, requireAuth, AuthenticatedRequest } from './auth';

export const apiRouter = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer memory storage compatible with both disk writing (Hostinger) and serverless functions (Netlify)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Format de fichier non supporté. Veuillez envoyer une image (PNG, JPG, WebP).'));
    }
  },
});

// Helper to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

// ==============================================================================
// 1. HEALTH & STATUS ENDPOINTS
// ==============================================================================
apiRouter.get('/health', (_req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    engine: 'TouchBizz Hostinger API',
    database: dbStatus,
  });
});

// ==============================================================================
// 2. AUTHENTICATION (Bcrypt + JWT)
// ==============================================================================

// POST /api/auth/register
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      res.status(400).json({ error: 'Cet email est déjà enregistré.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const userId = generateId('usr');
    const userName = name || cleanEmail.split('@')[0];

    await query(
      'INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [userId, cleanEmail, passwordHash, userName]
    );

    // If using in-memory store
    if (!isMySQLConfigured) {
      memoryStore.users.push({
        id: userId,
        email: cleanEmail,
        password_hash: passwordHash,
        name: userName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    const userObj = { id: userId, email: cleanEmail, name: userName };
    const token = generateToken(userObj);

    res.json({
      success: true,
      user: userObj,
      token,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de l’inscription.' });
  }
});

// POST /api/auth/login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email et mot de passe requis.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await queryOne<{ id: string; email: string; password_hash: string; name: string }>(
      'SELECT id, email, password_hash, name FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (!user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
      return;
    }

    const userObj = { id: user.id, email: user.email, name: user.name };
    const token = generateToken(userObj);

    res.json({
      success: true,
      user: userObj,
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Erreur lors de la connexion.' });
  }
});

// GET /api/auth/me
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// POST /api/auth/forgot-password
apiRouter.post('/auth/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  // Standard simulated reset email confirmation
  res.json({
    success: true,
    message: `Si un compte correspond à ${email}, un lien de réinitialisation sécurisé vient d'être envoyé.`,
  });
});

// ==============================================================================
// 3. RESTAURANTS (Protected by requireAuth)
// ==============================================================================

// GET /api/restaurants - List restaurants for current authenticated user
apiRouter.get('/restaurants', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const rows = await query(
      'SELECT * FROM restaurants WHERE owner_id = ? ORDER BY created_at ASC',
      [userId]
    );

    // Format boolean fields
    const formatted = rows.map(r => ({
      ...r,
      is_published: Boolean(r.is_published),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants - Create restaurant
apiRouter.post('/restaurants', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, slug, currency, theme, logo_url, cover_image_url, description, phone, address, primary_color } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Le nom du restaurant est obligatoire.' });
      return;
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check slug uniqueness
    const existing = await queryOne('SELECT id FROM restaurants WHERE slug = ?', [generatedSlug]);
    const finalSlug = existing ? `${generatedSlug}-${Math.random().toString(36).substring(2, 6)}` : generatedSlug;

    const restId = generateId('rest');
    const newRestaurant = {
      id: restId,
      owner_id: userId,
      name,
      slug: finalSlug,
      logo_url: logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      description: description || 'Bienvenue sur notre menu digital interactif.',
      phone: phone || '+212 5 00 00 00 00',
      address: address || 'Maroc',
      currency: currency || 'DH',
      primary_color: primary_color || '#9A3412',
      theme: theme || 'modern',
      is_published: 1,
    };

    await query(
      `INSERT INTO restaurants (id, owner_id, name, slug, logo_url, cover_image_url, description, phone, address, currency, primary_color, theme, is_published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        newRestaurant.id,
        newRestaurant.owner_id,
        newRestaurant.name,
        newRestaurant.slug,
        newRestaurant.logo_url,
        newRestaurant.cover_image_url,
        newRestaurant.description,
        newRestaurant.phone,
        newRestaurant.address,
        newRestaurant.currency,
        newRestaurant.primary_color,
        newRestaurant.theme,
        newRestaurant.is_published,
      ]
    );

    // In-memory fallback
    if (!isMySQLConfigured) {
      memoryStore.restaurants.push({
        ...newRestaurant,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Create starter category
    const catId = generateId('cat');
    await query(
      `INSERT INTO categories (id, restaurant_id, name, description, sort_order, display_order, is_visible, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, 1, 1, NOW(), NOW())`,
      [catId, restId, 'Nos Spécialités', 'Plats recommandés par le chef']
    );

    if (!isMySQLConfigured) {
      memoryStore.categories.push({
        id: catId,
        restaurant_id: restId,
        name: 'Nos Spécialités',
        description: 'Plats recommandés par le chef',
        sort_order: 1,
        display_order: 1,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    res.json({
      ...newRestaurant,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/restaurants/:id - Update restaurant
apiRouter.put('/restaurants/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, slug, logo_url, cover_image_url, description, phone, address, currency, primary_color, theme, is_published } = req.body;

    // Verify ownership
    const current = await queryOne('SELECT * FROM restaurants WHERE id = ? AND owner_id = ?', [id, userId]);
    if (!current) {
      res.status(404).json({ error: 'Restaurant introuvable ou accès non autorisé.' });
      return;
    }

    const updatedPublished = is_published !== undefined ? (is_published ? 1 : 0) : current.is_published;

    await query(
      `UPDATE restaurants
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           logo_url = COALESCE(?, logo_url),
           cover_image_url = COALESCE(?, cover_image_url),
           description = COALESCE(?, description),
           phone = COALESCE(?, phone),
           address = COALESCE(?, address),
           currency = COALESCE(?, currency),
           primary_color = COALESCE(?, primary_color),
           theme = COALESCE(?, theme),
           is_published = ?,
           updated_at = NOW()
       WHERE id = ? AND owner_id = ?`,
      [
        name,
        slug,
        logo_url,
        cover_image_url,
        description,
        phone,
        address,
        currency,
        primary_color,
        theme,
        updatedPublished,
        id,
        userId,
      ]
    );

    if (!isMySQLConfigured) {
      const idx = memoryStore.restaurants.findIndex(r => r.id === id);
      if (idx !== -1) {
        memoryStore.restaurants[idx] = {
          ...memoryStore.restaurants[idx],
          ...req.body,
          is_published: updatedPublished,
          updated_at: new Date().toISOString(),
        };
      }
    }

    const updated = await queryOne('SELECT * FROM restaurants WHERE id = ?', [id]);
    res.json({
      ...updated,
      is_published: Boolean(updated.is_published),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants/:id/toggle-publish
apiRouter.post('/restaurants/:id/toggle-publish', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const current = await queryOne('SELECT id, is_published FROM restaurants WHERE id = ? AND owner_id = ?', [id, userId]);
    if (!current) {
      res.status(404).json({ error: 'Restaurant introuvable ou accès non autorisé.' });
      return;
    }

    const nextState = current.is_published ? 0 : 1;
    await query('UPDATE restaurants SET is_published = ?, updated_at = NOW() WHERE id = ?', [nextState, id]);

    if (!isMySQLConfigured) {
      const r = memoryStore.restaurants.find(item => item.id === id);
      if (r) r.is_published = nextState;
    }

    res.json({ success: true, is_published: Boolean(nextState) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 4. CATEGORIES (Protected by requireAuth)
// ==============================================================================

// GET /api/restaurants/:restaurantId/categories
apiRouter.get('/restaurants/:restaurantId/categories', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { restaurantId } = req.params;

    // Check ownership
    const rest = await queryOne('SELECT id FROM restaurants WHERE id = ? AND owner_id = ?', [restaurantId, userId]);
    if (!rest) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    const rows = await query('SELECT * FROM categories WHERE restaurant_id = ? ORDER BY display_order ASC', [restaurantId]);
    res.json(rows.map(c => ({ ...c, is_visible: Boolean(c.is_visible) })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants/:restaurantId/categories
apiRouter.post('/restaurants/:restaurantId/categories', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { restaurantId } = req.params;
    const { name, description } = req.body;

    const rest = await queryOne('SELECT id FROM restaurants WHERE id = ? AND owner_id = ?', [restaurantId, userId]);
    if (!rest) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    const catId = generateId('cat');
    const countRow = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM categories WHERE restaurant_id = ?',
      [restaurantId]
    );
    const order = (countRow?.count || 0) + 1;

    await query(
      `INSERT INTO categories (id, restaurant_id, name, description, sort_order, display_order, is_visible, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [catId, restaurantId, name, description || '', order, order]
    );

    const newCat = {
      id: catId,
      restaurant_id: restaurantId,
      name,
      description: description || '',
      sort_order: order,
      display_order: order,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isMySQLConfigured) {
      memoryStore.categories.push({ ...newCat, is_visible: 1 });
    }

    res.json(newCat);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/categories/:id
apiRouter.put('/categories/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, is_visible, display_order, sort_order } = req.body;

    const cat = await queryOne(
      `SELECT c.id FROM categories c
       JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.id = ? AND r.owner_id = ?`,
      [id, userId]
    );
    if (!cat) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    const visibleVal = is_visible !== undefined ? (is_visible ? 1 : 0) : undefined;

    await query(
      `UPDATE categories
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           is_visible = COALESCE(?, is_visible),
           display_order = COALESCE(?, display_order),
           sort_order = COALESCE(?, sort_order),
           updated_at = NOW()
       WHERE id = ?`,
      [name, description, visibleVal, display_order, sort_order, id]
    );

    if (!isMySQLConfigured) {
      const c = memoryStore.categories.find(item => item.id === id);
      if (c) Object.assign(c, req.body, { updated_at: new Date().toISOString() });
    }

    const updated = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({ ...updated, is_visible: Boolean(updated.is_visible) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/categories/:id
apiRouter.delete('/categories/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const cat = await queryOne(
      `SELECT c.id FROM categories c
       JOIN restaurants r ON c.restaurant_id = r.id
       WHERE c.id = ? AND r.owner_id = ?`,
      [id, userId]
    );
    if (!cat) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    // Delete associated menu items and the category
    await query('DELETE FROM menu_items WHERE category_id = ?', [id]);
    await query('DELETE FROM categories WHERE id = ?', [id]);

    if (!isMySQLConfigured) {
      memoryStore.menu_items = memoryStore.menu_items.filter(i => i.category_id !== id);
      memoryStore.categories = memoryStore.categories.filter(c => c.id !== id);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants/:restaurantId/categories/reorder
apiRouter.post('/restaurants/:restaurantId/categories/reorder', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { restaurantId } = req.params;
    const { orderedIds } = req.body as { orderedIds: string[] };

    const rest = await queryOne('SELECT id FROM restaurants WHERE id = ? AND owner_id = ?', [restaurantId, userId]);
    if (!rest) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    for (let i = 0; i < orderedIds.length; i++) {
      const order = i + 1;
      await query(
        'UPDATE categories SET display_order = ?, sort_order = ?, updated_at = NOW() WHERE id = ? AND restaurant_id = ?',
        [order, order, orderedIds[i], restaurantId]
      );
    }

    if (!isMySQLConfigured) {
      orderedIds.forEach((id, idx) => {
        const c = memoryStore.categories.find(item => item.id === id);
        if (c) {
          c.display_order = idx + 1;
          c.sort_order = idx + 1;
        }
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 5. MENU ITEMS (Protected by requireAuth)
// ==============================================================================

// GET /api/restaurants/:restaurantId/items
apiRouter.get('/restaurants/:restaurantId/items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { restaurantId } = req.params;

    const rest = await queryOne('SELECT id FROM restaurants WHERE id = ? AND owner_id = ?', [restaurantId, userId]);
    if (!rest) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    const rows = await query('SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY display_order ASC', [restaurantId]);
    res.json(rows.map(i => ({
      ...i,
      price: Number(i.price),
      is_available: Boolean(i.is_available),
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants/:restaurantId/items
apiRouter.post('/restaurants/:restaurantId/items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { restaurantId } = req.params;
    const { category_id, name, description, price, image_url, is_available } = req.body;

    const rest = await queryOne('SELECT id FROM restaurants WHERE id = ? AND owner_id = ?', [restaurantId, userId]);
    if (!rest) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    const itemId = generateId('item');
    const countRow = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM menu_items WHERE restaurant_id = ? AND category_id = ?',
      [restaurantId, category_id]
    );
    const order = (countRow?.count || 0) + 1;
    const avail = is_available !== undefined ? (is_available ? 1 : 0) : 1;

    await query(
      `INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, sort_order, display_order, is_available, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [itemId, restaurantId, category_id, name, description || '', Number(price) || 0, image_url || '', order, order, avail]
    );

    const newItem = {
      id: itemId,
      restaurant_id: restaurantId,
      category_id,
      name,
      description: description || '',
      price: Number(price) || 0,
      image_url: image_url || '',
      sort_order: order,
      display_order: order,
      is_available: Boolean(avail),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!isMySQLConfigured) {
      memoryStore.menu_items.push({ ...newItem, is_available: avail });
    }

    res.json(newItem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/items/:id
apiRouter.put('/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { category_id, name, description, price, image_url, is_available, display_order, sort_order } = req.body;

    const item = await queryOne(
      `SELECT m.id FROM menu_items m
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE m.id = ? AND r.owner_id = ?`,
      [id, userId]
    );
    if (!item) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    const availVal = is_available !== undefined ? (is_available ? 1 : 0) : undefined;
    const priceVal = price !== undefined ? Number(price) : undefined;

    await query(
      `UPDATE menu_items
       SET category_id = COALESCE(?, category_id),
           name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           image_url = COALESCE(?, image_url),
           is_available = COALESCE(?, is_available),
           display_order = COALESCE(?, display_order),
           sort_order = COALESCE(?, sort_order),
           updated_at = NOW()
       WHERE id = ?`,
      [category_id, name, description, priceVal, image_url, availVal, display_order, sort_order, id]
    );

    if (!isMySQLConfigured) {
      const it = memoryStore.menu_items.find(m => m.id === id);
      if (it) Object.assign(it, req.body, { updated_at: new Date().toISOString() });
    }

    const updated = await queryOne('SELECT * FROM menu_items WHERE id = ?', [id]);
    res.json({
      ...updated,
      price: Number(updated.price),
      is_available: Boolean(updated.is_available),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/items/:id/toggle-availability
apiRouter.post('/items/:id/toggle-availability', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const item = await queryOne(
      `SELECT m.id, m.is_available FROM menu_items m
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE m.id = ? AND r.owner_id = ?`,
      [id, userId]
    );
    if (!item) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    const nextAvail = item.is_available ? 0 : 1;
    await query('UPDATE menu_items SET is_available = ?, updated_at = NOW() WHERE id = ?', [nextAvail, id]);

    if (!isMySQLConfigured) {
      const it = memoryStore.menu_items.find(m => m.id === id);
      if (it) it.is_available = nextAvail;
    }

    res.json({ success: true, is_available: Boolean(nextAvail) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/items/:id
apiRouter.delete('/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const item = await queryOne(
      `SELECT m.id FROM menu_items m
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE m.id = ? AND r.owner_id = ?`,
      [id, userId]
    );
    if (!item) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    await query('DELETE FROM menu_items WHERE id = ?', [id]);

    if (!isMySQLConfigured) {
      memoryStore.menu_items = memoryStore.menu_items.filter(m => m.id !== id);
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/restaurants/:restaurantId/items/reorder
apiRouter.post('/restaurants/:restaurantId/items/reorder', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { restaurantId } = req.params;
    const { orderedIds } = req.body as { orderedIds: string[] };

    const rest = await queryOne('SELECT id FROM restaurants WHERE id = ? AND owner_id = ?', [restaurantId, userId]);
    if (!rest) {
      res.status(403).json({ error: 'Accès non autorisé.' });
      return;
    }

    for (let i = 0; i < orderedIds.length; i++) {
      const order = i + 1;
      await query(
        'UPDATE menu_items SET display_order = ?, sort_order = ?, updated_at = NOW() WHERE id = ? AND restaurant_id = ?',
        [order, order, orderedIds[i], restaurantId]
      );
    }

    if (!isMySQLConfigured) {
      orderedIds.forEach((id, idx) => {
        const item = memoryStore.menu_items.find(m => m.id === id);
        if (item) {
          item.display_order = idx + 1;
          item.sort_order = idx + 1;
        }
      });
    }

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 6. IMAGE UPLOADS (Hostinger Local Storage /uploads/)
// ==============================================================================

// POST /api/upload - Handle multipart/form-data image upload or Base64
apiRouter.post('/upload', requireAuth, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. If uploaded via multipart file
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase() || '.jpg';
      const generatedName = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, generatedName);
        fs.writeFileSync(filePath, req.file.buffer);
        res.json({ success: true, url: `/uploads/${generatedName}` });
        return;
      } catch (fsErr) {
        // Read-only filesystem in serverless environments (Netlify)
        console.warn('[TouchBizz Upload] Disque en lecture seule (Netlify Serverless), conversion directe en Data URI.');
        const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        res.json({ success: true, url: dataUrl });
        return;
      }
    }

    // 2. If uploaded via Base64 data URL
    const { data } = req.body;
    if (data && typeof data === 'string' && data.startsWith('data:image/')) {
      try {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const matches = data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const base64Data = matches[2];
          const generatedName = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
          const filePath = path.join(uploadsDir, generatedName);
          fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

          res.json({ success: true, url: `/uploads/${generatedName}` });
          return;
        }
      } catch (fsErr) {
        // Read-only filesystem in serverless environments (Netlify)
        console.warn('[TouchBizz Upload] Disque en lecture seule (Netlify Serverless), conservation du Data URI.');
        res.json({ success: true, url: data });
        return;
      }
    }

    res.status(400).json({ error: 'Aucun fichier ou image fourni.' });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Erreur lors du téléchargement de l’image.' });
  }
});

// ==============================================================================
// 7. PUBLIC MENU (Patron-facing, strictly isolated, read-only)
// ==============================================================================

// GET /api/public/menu/:slug
apiRouter.get('/public/menu/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug.toLowerCase();

    // Fetch restaurant by slug (Selecting only patron-safe columns, never owner_id or secrets)
    const restaurant = await queryOne(
      `SELECT id, name, slug, logo_url, cover_image_url, description, phone, address, currency, primary_color, theme, is_published, created_at, updated_at
       FROM restaurants WHERE slug = ?`,
      [slug]
    );

    if (!restaurant) {
      res.status(404).json({ error: 'Établissement introuvable.' });
      return;
    }

    const isPublished = Boolean(restaurant.is_published);
    // Explicitly omit owner_id or internal fields from public payload
    const { owner_id, ...safeRestaurant } = restaurant as any;

    // If unpublished, return restaurant shell with is_published: false so frontend can display friendly offline notice
    if (!isPublished) {
      res.json({
        restaurant: {
          ...safeRestaurant,
          is_published: false,
        },
        categories: [],
        items: [],
      });
      return;
    }

    // Fetch visible categories
    const categories = await query(
      `SELECT id, restaurant_id, name, description, sort_order, display_order, is_visible
       FROM categories
       WHERE restaurant_id = ? AND is_visible = 1
       ORDER BY display_order ASC`,
      [restaurant.id]
    );

    // Fetch menu items for this restaurant
    const items = await query(
      `SELECT id, restaurant_id, category_id, name, description, price, image_url, sort_order, display_order, is_available
       FROM menu_items
       WHERE restaurant_id = ?
       ORDER BY display_order ASC`,
      [restaurant.id]
    );

    res.json({
      restaurant: {
        ...safeRestaurant,
        is_published: true,
      },
      categories: categories.map(c => ({ ...c, is_visible: true })),
      items: items.map(i => ({
        ...i,
        price: Number(i.price),
        is_available: Boolean(i.is_available),
      })),
    });
  } catch (err: any) {
    console.error('Public menu error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement du menu.' });
  }
});

// 404 Fallback for unhandled API routes
apiRouter.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint API introuvable.' });
});
