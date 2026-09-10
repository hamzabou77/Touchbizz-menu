import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Dynamically read environment variables to ensure any .env changes are captured
export function getDbConfig() {
  const host = process.env.MYSQL_HOST || process.env.DB_HOST || '';
  const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10);
  const user = process.env.MYSQL_USER || process.env.DB_USER || '';
  const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || '';
  const isConfigured = Boolean(host && user && database);

  return { host, port, user, password, database, isConfigured };
}

export const isMySQLConfigured = Boolean(
  (process.env.MYSQL_HOST || process.env.DB_HOST) &&
  (process.env.MYSQL_USER || process.env.DB_USER) &&
  (process.env.MYSQL_DATABASE || process.env.DB_NAME)
);

let pool: mysql.Pool | null = null;
let isConnected = false;

// Fallback in-memory store for when MySQL credentials are not yet entered in the preview environment
class MemoryStore {
  users: any[] = [];
  restaurants: any[] = [];
  categories: any[] = [];
  menu_items: any[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    const passwordHash = bcrypt.hashSync('touchbizz123', 10);
    this.users = [
      {
        id: 'usr-touchbizz-owner-1',
        email: 'owner@latablemarrakech.ma',
        password_hash: passwordHash,
        name: 'Karim Benjelloun',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.restaurants = [
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
        primary_color: '#9A3412',
        theme: 'moroccan',
        is_published: 1,
        created_at: new Date().toISOString(),
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
        primary_color: '#0F172A',
        theme: 'modern',
        is_published: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.categories = [
      {
        id: 'cat-entrees-1',
        restaurant_id: 'rest-marrakech-1',
        name: 'Entrées & Salades',
        description: 'Sélection d’entrées fraîches et salades traditionnelles marocaines',
        sort_order: 1,
        display_order: 1,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cat-tajines-2',
        restaurant_id: 'rest-marrakech-1',
        name: 'Tajines & Plats Signature',
        description: 'Nos grands classiques cuisinés dans la pure tradition marocaine',
        sort_order: 2,
        display_order: 2,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cat-grillades-3',
        restaurant_id: 'rest-marrakech-1',
        name: 'Grillades au Charbon',
        description: 'Viandes sélectionnées et marinées aux épices du souk',
        sort_order: 3,
        display_order: 3,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cat-desserts-4',
        restaurant_id: 'rest-marrakech-1',
        name: 'Desserts & Pâtisseries',
        description: 'Douceurs parfumées à la fleur d’oranger et amandes',
        sort_order: 4,
        display_order: 4,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cat-boissons-5',
        restaurant_id: 'rest-marrakech-1',
        name: 'Thés & Rafraîchissements',
        description: 'Thé vert à la menthe fraîche et jus de fruits pressés minute',
        sort_order: 5,
        display_order: 5,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cat-bb-burgers-1',
        restaurant_id: 'rest-bistrot-2',
        name: 'Smash Burgers Gourmet',
        description: 'Pains briochés artisanaux et boeuf wagyu maturé',
        sort_order: 1,
        display_order: 1,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cat-bb-sides-2',
        restaurant_id: 'rest-bistrot-2',
        name: 'Sides & Finger Food',
        description: 'Accompagnements croustillants et sauces maison',
        sort_order: 2,
        display_order: 2,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'cat-bb-drinks-3',
        restaurant_id: 'rest-bistrot-2',
        name: 'Mocktails & Sodas Frais',
        description: 'Boissons rafraîchissantes préparées à la commande',
        sort_order: 3,
        display_order: 3,
        is_visible: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    this.menu_items = [
      {
        id: 'item-zalouk-1',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-entrees-1',
        name: 'Zaâlouk d’Aubergines Fumé',
        description: 'Caviar d’aubergines grillées au feu de bois, tomates confites, ail, coriandre et huile d’olive de l’Atlas.',
        price: 45.0,
        image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
        sort_order: 1,
        display_order: 1,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-pastilla-2',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-entrees-1',
        name: 'Mini Pastilla Fassi au Poulet',
        description: 'Feuilleté croustillant aux amandes grillées, effiloché de poulet fermier aux épices douces et cannelle.',
        price: 75.0,
        image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
        sort_order: 2,
        display_order: 2,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-briouates-3',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-entrees-1',
        name: 'Trio de Briouates Royales',
        description: 'Trois pièces dorées au four : fromage de chèvre & thym, viande hachée aux épices, et crevettes sautées.',
        price: 60.0,
        image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
        sort_order: 3,
        display_order: 3,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-tajine-agneau-4',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-tajines-2',
        name: 'Tajine d’Agneau aux Pruneaux & Amandes',
        description: 'Souris d’agneau fondante confite 4 heures, pruneaux caramélisés au miel d’oranger et amandes torréfiées.',
        price: 140.0,
        image_url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80',
        sort_order: 1,
        display_order: 1,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-tajine-poulet-5',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-tajines-2',
        name: 'Tajine de Poulet Fermier Citron Confi & Olives',
        description: 'Coquelet mariné au safran pur de Taliouine, citrons beldi confits et olives meslalla violettes.',
        price: 115.0,
        image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80',
        sort_order: 2,
        display_order: 2,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-couscous-royal-6',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-tajines-2',
        name: 'Couscous Royal aux Sept Légumes',
        description: 'Semoule fine cuite à la vapeur, agneau, poulet, merguez artisanale, bouillon aux épices et pois chiches.',
        price: 150.0,
        image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
        sort_order: 3,
        display_order: 3,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-mechoui-7',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-grillades-3',
        name: 'Épaule d’Agneau Rôtie façon Méchoui',
        description: 'Cuite à l’étouffée dans la tradition marrakchie, servie avec sel au cumin et galettes tièdes batbout.',
        price: 165.0,
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
        sort_order: 1,
        display_order: 1,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-brochettes-kefta-8',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-grillades-3',
        name: 'Brochettes de Kefta d’Ourika au Charbon',
        description: 'Viande hachée d’embellie de menthe fraîche, persil plat, piment doux et oignons confits.',
        price: 95.0,
        image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
        sort_order: 2,
        display_order: 2,
        is_available: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-pastilla-lait-9',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-desserts-4',
        name: 'Jawhara (Pastilla au Lait & Amandes)',
        description: 'Feuillets croustillants légers, crème onctueuse à la fleur d’oranger et amandes concassées.',
        price: 55.0,
        image_url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
        sort_order: 1,
        display_order: 1,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-oranges-cannelle-10',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-desserts-4',
        name: 'Carpaccio d’Oranges à la Cannelle & Fleur d’Oranger',
        description: 'Tranches fraîches d’oranges de la plaine du Souss, sirop léger à la menthe et cannelle moulue.',
        price: 40.0,
        image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80',
        sort_order: 2,
        display_order: 2,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-the-menthe-11',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-boissons-5',
        name: 'Thé Traditionnel à la Menthe Fraîche',
        description: 'Infusion rituelle de thé vert gunpowder avec bouquet généreux de menthe bio de Meknès.',
        price: 30.0,
        image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
        sort_order: 1,
        display_order: 1,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-jus-orange-12',
        restaurant_id: 'rest-marrakech-1',
        category_id: 'cat-boissons-5',
        name: 'Jus d’Orange Frais Pressé Minute',
        description: 'Oranges douces marocaines récoltées à maturité, servies très fraîches sans sucres ajoutés.',
        price: 35.0,
        image_url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80',
        sort_order: 2,
        display_order: 2,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-bb-classic-13',
        restaurant_id: 'rest-bistrot-2',
        category_id: 'cat-bb-burgers-1',
        name: 'Smash Double Truffe Burger',
        description: 'Deux steaks smashés croustillants, cheddar affiné 12 mois, compotée d’oignons et mayo truffée.',
        price: 85.0,
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
        sort_order: 1,
        display_order: 1,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-bb-bacon-14',
        restaurant_id: 'rest-bistrot-2',
        category_id: 'cat-bb-burgers-1',
        name: 'Smoky Barbecue Burger',
        description: 'Steak haché de boeuf pur, cheddar fondant, bacon croustillant et sauce BBQ artisanale fumée.',
        price: 80.0,
        image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80',
        sort_order: 2,
        display_order: 2,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'item-bb-fries-15',
        restaurant_id: 'rest-bistrot-2',
        category_id: 'cat-bb-sides-2',
        name: 'Frites Maison au Sel de Guérande',
        description: 'Pommes de terre fraîches coupées chaque matin, double cuisson pour un croustillant parfait.',
        price: 30.0,
        image_url: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80',
        sort_order: 1,
        display_order: 1,
        is_available: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }
}

export const memoryStore = new MemoryStore();

/**
 * Initialize MySQL connection pool and test connection
 */
export async function initDatabase(): Promise<{ success: boolean; message: string }> {
  const config = getDbConfig();
  if (!config.isConfigured) {
    console.log('[TouchBizz MySQL] No MySQL credentials configured in environment. Using in-memory store.');
    return { success: false, message: 'MySQL not configured in environment variables.' };
  }

  try {
    pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4',
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    isConnected = true;
    console.log(`[TouchBizz MySQL] Successfully connected to Hostinger MySQL (${config.host}:${config.port}/${config.database})`);

    // Ensure tables exist
    await autoMigrateTables();

    return { success: true, message: `Connected to MySQL: ${config.database}` };
  } catch (err: any) {
    console.error('[TouchBizz MySQL] Connection error:', err.message);
    isConnected = false;
    return { success: false, message: err.message };
  }
}

/**
 * Auto-run schema creation if tables don't exist yet
 */
async function autoMigrateTables() {
  if (!pool) return;
  try {
    const schemaPath = path.join(process.cwd(), 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      // Split into statements ignoring comments
      const statements = sql
        .replace(/--.*$/gm, '')
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        try {
          await pool.query(statement);
        } catch (e: any) {
          // Ignore duplicate / already existing table errors
          if (!e.message.includes('already exists') && !e.message.includes('Duplicate')) {
            console.warn('[TouchBizz MySQL Auto-migration warning]:', e.message);
          }
        }
      }
      console.log('[TouchBizz MySQL] Schema verified & auto-migrated successfully.');
    }
  } catch (err) {
    console.warn('[TouchBizz MySQL] Auto-migration error:', err);
  }
}

/**
 * Parameterized Query Execution (Secured against SQL Injection)
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (pool && isConnected) {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  }

  // If MySQL is not connected, simulate the parameterized query on memoryStore
  return executeInMemory<T>(sql, params);
}

/**
 * Get single row helper
 */
export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Safe in-memory query handler when MySQL is not connected yet
 */
function executeInMemory<T = any>(sql: string, params: any[] = []): T[] {
  const cleanSql = sql.trim().toUpperCase();

  if (cleanSql.startsWith('SELECT')) {
    if (cleanSql.includes('FROM USERS') || cleanSql.includes('FROM `USERS`')) {
      if (cleanSql.includes('WHERE EMAIL = ?') || cleanSql.includes('WHERE `EMAIL` = ?')) {
        const found = memoryStore.users.find(u => u.email.toLowerCase() === String(params[0]).toLowerCase());
        return (found ? [found] : []) as T[];
      }
      if (cleanSql.includes('WHERE ID = ?') || cleanSql.includes('WHERE `ID` = ?')) {
        const found = memoryStore.users.find(u => u.id === params[0]);
        return (found ? [found] : []) as T[];
      }
      return [...memoryStore.users] as T[];
    }

    if (cleanSql.includes('FROM RESTAURANTS') || cleanSql.includes('FROM `RESTAURANTS`')) {
      if (cleanSql.includes('WHERE SLUG = ?') || cleanSql.includes('WHERE `SLUG` = ?')) {
        const found = memoryStore.restaurants.find(r => r.slug.toLowerCase() === String(params[0]).toLowerCase());
        return (found ? [found] : []) as T[];
      }
      if (cleanSql.includes('WHERE ID = ?') || cleanSql.includes('WHERE `ID` = ?')) {
        const found = memoryStore.restaurants.find(r => r.id === params[0]);
        return (found ? [found] : []) as T[];
      }
      if (cleanSql.includes('WHERE OWNER_ID = ?') || cleanSql.includes('WHERE `OWNER_ID` = ?')) {
        const found = memoryStore.restaurants.filter(r => r.owner_id === params[0]);
        return found as T[];
      }
      return [...memoryStore.restaurants] as T[];
    }

    if (cleanSql.includes('FROM CATEGORIES') || cleanSql.includes('FROM `CATEGORIES`')) {
      if (cleanSql.includes('WHERE RESTAURANT_ID = ?') || cleanSql.includes('WHERE `RESTAURANT_ID` = ?')) {
        const found = memoryStore.categories
          .filter(c => c.restaurant_id === params[0])
          .sort((a, b) => a.display_order - b.display_order);
        return found as T[];
      }
      if (cleanSql.includes('WHERE ID = ?') || cleanSql.includes('WHERE `ID` = ?')) {
        const found = memoryStore.categories.find(c => c.id === params[0]);
        return (found ? [found] : []) as T[];
      }
      return [...memoryStore.categories] as T[];
    }

    if (cleanSql.includes('FROM MENU_ITEMS') || cleanSql.includes('FROM `MENU_ITEMS`')) {
      if (cleanSql.includes('WHERE RESTAURANT_ID = ?') || cleanSql.includes('WHERE `RESTAURANT_ID` = ?')) {
        const found = memoryStore.menu_items
          .filter(i => i.restaurant_id === params[0])
          .sort((a, b) => a.display_order - b.display_order);
        return found as T[];
      }
      if (cleanSql.includes('WHERE ID = ?') || cleanSql.includes('WHERE `ID` = ?')) {
        const found = memoryStore.menu_items.find(i => i.id === params[0]);
        return (found ? [found] : []) as T[];
      }
      return [...memoryStore.menu_items] as T[];
    }
  }

  return [] as T[];
}

export function getDatabaseStatus() {
  const config = getDbConfig();
  return {
    isConfigured: config.isConfigured,
    isConnected,
    host: config.host || 'Not specified',
    database: config.database || 'Not specified',
    user: config.user || 'Not specified',
  };
}
