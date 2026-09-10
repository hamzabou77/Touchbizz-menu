-- ==============================================================================
-- TouchBizz Menu V1 - Production MySQL Schema for Hostinger
-- Compatible with MySQL 5.7+ and MySQL 8.0+ / MariaDB (Hostinger phpMyAdmin)
-- Character Set: utf8mb4 / utf8mb4_unicode_ci (Supports Arabic, French & Emojis)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table (Admin & Restaurant Owners)
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(64) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL DEFAULT 'Restaurateur',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Restaurants Table
CREATE TABLE IF NOT EXISTS `restaurants` (
    `id` VARCHAR(64) NOT NULL,
    `owner_id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `logo_url` TEXT NULL,
    `cover_image_url` TEXT NULL,
    `description` TEXT NULL,
    `phone` VARCHAR(64) DEFAULT '',
    `address` TEXT NULL,
    `currency` VARCHAR(32) DEFAULT 'DH',
    `primary_color` VARCHAR(32) DEFAULT '#9A3412',
    `theme` VARCHAR(32) DEFAULT 'modern',
    `is_published` TINYINT(1) DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_restaurants_slug` (`slug`),
    KEY `idx_restaurants_owner` (`owner_id`),
    CONSTRAINT `fk_restaurants_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` VARCHAR(64) NOT NULL,
    `restaurant_id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_visible` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_categories_restaurant` (`restaurant_id`, `display_order`),
    CONSTRAINT `fk_categories_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Menu Items Table
CREATE TABLE IF NOT EXISTS `menu_items` (
    `id` VARCHAR(64) NOT NULL,
    `restaurant_id` VARCHAR(64) NOT NULL,
    `category_id` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `image_url` TEXT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    `display_order` INT NOT NULL DEFAULT 0,
    `is_available` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_menu_items_restaurant` (`restaurant_id`, `display_order`),
    KEY `idx_menu_items_category` (`category_id`),
    CONSTRAINT `fk_items_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- INITIAL DEMO & SEED DATA (Ready to use on Hostinger)
-- Default Login: owner@latablemarrakech.ma / touchbizz123
-- ==============================================================================

-- 1. Default User: Karim Benjelloun (Password: touchbizz123 hashed with bcrypt)
INSERT INTO `users` (`id`, `email`, `password_hash`, `name`, `created_at`, `updated_at`)
VALUES (
    'usr-touchbizz-owner-1',
    'owner@latablemarrakech.ma',
    '$2b$10$764WAihY9e7f0VYMEGEije3ty6oKjG26CFdRWAmM.riYPMoowz8oy', -- touchbizz123
    'Karim Benjelloun',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE `password_hash` = VALUES(`password_hash`), `updated_at` = NOW();

-- 2. Restaurants
INSERT INTO `restaurants` (`id`, `owner_id`, `name`, `slug`, `logo_url`, `cover_image_url`, `description`, `phone`, `address`, `currency`, `primary_color`, `theme`, `is_published`, `created_at`, `updated_at`)
VALUES
(
    'rest-marrakech-1',
    'usr-touchbizz-owner-1',
    'La Table de Marrakech',
    'la-table-marrakech',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    'Cuisine marocaine raffinée, tajines d’exception mijotés au feu de bois et douceurs orientales.',
    '+212 5 24 43 21 00',
    '42 Rue Yves Saint Laurent, Guéliz, Marrakech',
    'DH',
    '#9A3412',
    'moroccan',
    1,
    NOW(),
    NOW()
),
(
    'rest-bistrot-2',
    'usr-touchbizz-owner-1',
    'Bistrot & Burgers Casablanca',
    'bistrot-burgers',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&auto=format&fit=crop&q=80',
    'Smash burgers artisanaux, frites croustillantes à la truffe et mocktails signature.',
    '+212 5 22 98 76 54',
    '15 Boulevard d’Anfa, Casablanca',
    'DH',
    '#0F172A',
    'modern',
    1,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- 3. Categories for La Table de Marrakech
INSERT INTO `categories` (`id`, `restaurant_id`, `name`, `description`, `sort_order`, `display_order`, `is_visible`, `created_at`, `updated_at`)
VALUES
('cat-entrees-1', 'rest-marrakech-1', 'Entrées & Salades', 'Sélection d’entrées fraîches et salades traditionnelles marocaines', 1, 1, 1, NOW(), NOW()),
('cat-tajines-2', 'rest-marrakech-1', 'Tajines & Plats Signature', 'Nos grands classiques cuisinés dans la pure tradition marocaine', 2, 2, 1, NOW(), NOW()),
('cat-grillades-3', 'rest-marrakech-1', 'Grillades au Charbon', 'Viandes sélectionnées et marinées aux épices du souk', 3, 3, 1, NOW(), NOW()),
('cat-desserts-4', 'rest-marrakech-1', 'Desserts & Pâtisseries', 'Douceurs parfumées à la fleur d’oranger et amandes', 4, 4, 1, NOW(), NOW()),
('cat-boissons-5', 'rest-marrakech-1', 'Thés & Rafraîchissements', 'Thé vert à la menthe fraîche et jus de fruits pressés minute', 5, 5, 1, NOW(), NOW()),
('cat-bb-burgers-1', 'rest-bistrot-2', 'Smash Burgers Gourmet', 'Pains briochés artisanaux et boeuf wagyu maturé', 1, 1, 1, NOW(), NOW()),
('cat-bb-sides-2', 'rest-bistrot-2', 'Sides & Finger Food', 'Accompagnements croustillants et sauces maison', 2, 2, 1, NOW(), NOW()),
('cat-bb-drinks-3', 'rest-bistrot-2', 'Mocktails & Sodas Frais', 'Boissons rafraîchissantes préparées à la commande', 3, 3, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- 4. Menu Items
INSERT INTO `menu_items` (`id`, `restaurant_id`, `category_id`, `name`, `description`, `price`, `image_url`, `sort_order`, `display_order`, `is_available`, `created_at`, `updated_at`)
VALUES
-- La Table de Marrakech - Entrées
('item-zalouk-1', 'rest-marrakech-1', 'cat-entrees-1', 'Zaâlouk d’Aubergines Fumé', 'Caviar d’aubergines grillées au feu de bois, tomates confites, ail, coriandre et huile d’olive de l’Atlas.', 45.00, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 1, 1, 1, NOW(), NOW()),
('item-pastilla-2', 'rest-marrakech-1', 'cat-entrees-1', 'Mini Pastilla Fassi au Poulet', 'Feuilleté croustillant aux amandes grillées, effiloché de poulet fermier aux épices douces et cannelle.', 75.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80', 2, 2, 1, NOW(), NOW()),
('item-briouates-3', 'rest-marrakech-1', 'cat-entrees-1', 'Trio de Briouates Royales', 'Trois pièces dorées au four : fromage de chèvre & thym, viande hachée aux épices, et crevettes sautées.', 60.00, 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80', 3, 3, 1, NOW(), NOW()),
-- La Table de Marrakech - Tajines
('item-tajine-agneau-4', 'rest-marrakech-1', 'cat-tajines-2', 'Tajine d’Agneau aux Pruneaux & Amandes', 'Souris d’agneau fondante confite 4 heures, pruneaux caramélisés au miel d’oranger et amandes torréfiées.', 140.00, 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800&auto=format&fit=crop&q=80', 1, 1, 1, NOW(), NOW()),
('item-tajine-poulet-5', 'rest-marrakech-1', 'cat-tajines-2', 'Tajine de Poulet Fermier Citron Confi & Olives', 'Coquelet mariné au safran pur de Taliouine, citrons beldi confits et olives meslalla violettes.', 115.00, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop&q=80', 2, 2, 1, NOW(), NOW()),
('item-couscous-royal-6', 'rest-marrakech-1', 'cat-tajines-2', 'Couscous Royal aux Sept Légumes', 'Semoule fine cuite à la vapeur, agneau, poulet, merguez artisanale, bouillon aux épices et pois chiches.', 150.00, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80', 3, 3, 1, NOW(), NOW()),
-- La Table de Marrakech - Grillades
('item-mechoui-7', 'rest-marrakech-1', 'cat-grillades-3', 'Épaule d’Agneau Rôtie façon Méchoui', 'Cuite à l’étouffée dans la tradition marrakchie, servie avec sel au cumin et galettes tièdes batbout.', 165.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80', 1, 1, 1, NOW(), NOW()),
('item-brochettes-kefta-8', 'rest-marrakech-1', 'cat-grillades-3', 'Brochettes de Kefta d’Ourika au Charbon', 'Viande hachée d’embellie de menthe fraîche, persil plat, piment doux et oignons confits.', 95.00, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80', 2, 2, 0, NOW(), NOW()),
-- La Table de Marrakech - Desserts
('item-pastilla-lait-9', 'rest-marrakech-1', 'cat-desserts-4', 'Jawhara (Pastilla au Lait & Amandes)', 'Feuillets croustillants légers, crème onctueuse à la fleur d’oranger et amandes concassées.', 55.00, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80', 1, 1, 1, NOW(), NOW()),
('item-oranges-cannelle-10', 'rest-marrakech-1', 'cat-desserts-4', 'Carpaccio d’Oranges à la Cannelle & Fleur d’Oranger', 'Tranches fraîches d’oranges de la plaine du Souss, sirop léger à la menthe et cannelle moulue.', 40.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80', 2, 2, 1, NOW(), NOW()),
-- La Table de Marrakech - Boissons
('item-the-menthe-11', 'rest-marrakech-1', 'cat-boissons-5', 'Thé Traditionnel à la Menthe Fraîche', 'Infusion rituelle de thé vert gunpowder avec bouquet généreux de menthe bio de Meknès.', 30.00, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80', 1, 1, 1, NOW(), NOW()),
('item-jus-orange-12', 'rest-marrakech-1', 'cat-boissons-5', 'Jus d’Orange Frais Pressé Minute', 'Oranges douces marocaines récoltées à maturité, servies très fraîches sans sucres ajoutés.', 35.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&auto=format&fit=crop&q=80', 2, 2, 1, NOW(), NOW()),
-- Bistrot & Burgers
('item-bb-classic-13', 'rest-bistrot-2', 'cat-bb-burgers-1', 'Smash Double Truffe Burger', 'Deux steaks smashés croustillants, cheddar affiné 12 mois, compotée d’oignons et mayo truffée.', 85.00, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80', 1, 1, 1, NOW(), NOW()),
('item-bb-bacon-14', 'rest-bistrot-2', 'cat-bb-burgers-1', 'Smoky Barbecue Burger', 'Steak haché de boeuf pur, cheddar fondant, bacon croustillant et sauce BBQ artisanale fumée.', 80.00, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800&auto=format&fit=crop&q=80', 2, 2, 1, NOW(), NOW()),
('item-bb-fries-15', 'rest-bistrot-2', 'cat-bb-sides-2', 'Frites Maison au Sel de Guérande', 'Pommes de terre fraîches coupées chaque matin, double cuisson pour un croustillant parfait.', 30.00, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80', 1, 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();
