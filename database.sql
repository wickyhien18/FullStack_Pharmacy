-- ================================================================
-- PharmacyDB — PostgreSQL schema
-- ================================================================

CREATE DATABASE PharmacyDB
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE   = 'en_US.UTF-8';

\c PharmacyDB;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- ----------------------------------------------------------------
-- Custom ENUM types (PostgreSQL không inline ENUM trong CREATE TABLE)
-- ----------------------------------------------------------------
CREATE TYPE product_status   AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
CREATE TYPE change_type_enum  AS ENUM ('IMPORT', 'EXPORT', 'ADJUST');
CREATE TYPE order_status_enum AS ENUM (
    'PENDING',           -- Vừa đặt, chờ xác nhận
    'CONFIRMED',         -- Đã xác nhận, chuẩn bị hàng
    'SHIPPING',          -- Đang giao
    'DELIVERED',         -- Giao thành công
    'CANCEL_REQUESTED',  -- User yêu cầu huỷ khi đang CONFIRMED
    'CANCELLED',         -- Đã huỷ
    'RETURN_REQUESTED',  -- User yêu cầu hoàn hàng khi đang SHIPPING
    'RETURNED'           -- Hàng đã về kho → hoàn tiền + hoàn kho
);
CREATE TYPE payment_status_enum AS ENUM (
    'PENDING', -- Chờ thanh toán
    'PAID', -- Đã thanh toán
    'FAILED', -- Thanh toán thất bại
    'REFUNDED' -- Đã hoàn tiền
);
CREATE TYPE payment_method_enum AS ENUM ('COD', 'VNPAY', 'MOMO');
CREATE TYPE txn_status_enum     AS ENUM (
     'PENDING',             -- Chờ thanh toán
     'SUCCESS',             -- Thanh toán thành công
     'FAILED',              -- Thất bại / bị huỷ
     'REFUNDED'             -- Đã hoàn tiền
);
CREATE TYPE shipment_status_enum AS ENUM ('PENDING', 'SHIPPING', 'DELIVERED', 'FAILED');

-- ----------------------------------------------------------------
-- 1. ROLES
-- ----------------------------------------------------------------
CREATE TABLE roles (
    role_id   BIGSERIAL    NOT NULL,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    PRIMARY KEY (role_id)
);

-- ----------------------------------------------------------------
-- 2. USERS
-- ----------------------------------------------------------------
CREATE TABLE users (
    user_id       BIGSERIAL    NOT NULL,
    user_name     VARCHAR(100) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    phone         VARCHAR(20)  NOT NULL UNIQUE,
    role_id       BIGINT,
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP    NULL,
    deleted_at    TIMESTAMP    NULL,
    PRIMARY KEY (user_id),
    CONSTRAINT fk_user_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE SET NULL
);

-- Trigger thay thế ON UPDATE CURRENT_TIMESTAMP của MySQL
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 3. REFRESH_TOKENS
-- ----------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id         BIGSERIAL    NOT NULL,
    token      VARCHAR(500) NOT NULL UNIQUE,
    user_id    BIGINT       NOT NULL,
    expire_at  TIMESTAMP    NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 4. CATEGORIES
-- ----------------------------------------------------------------
CREATE TABLE categories (
    category_id BIGSERIAL    NOT NULL,
    name        VARCHAR(255) NOT NULL,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    PRIMARY KEY (category_id)
);

-- ----------------------------------------------------------------
-- 5. MANUFACTURERS
-- ----------------------------------------------------------------
CREATE TABLE manufacturers (
    manufacturer_id BIGSERIAL    NOT NULL,
    name            VARCHAR(255) NOT NULL,
    country         VARCHAR(255) NULL,
    PRIMARY KEY (manufacturer_id)
);

-- ----------------------------------------------------------------
-- 6. productS
-- ----------------------------------------------------------------
CREATE TABLE products (
    product_id     BIGSERIAL        NOT NULL,
    name            VARCHAR(500)     NOT NULL,
    slug            VARCHAR(520)     NOT NULL UNIQUE,
    image           VARCHAR(500)     NULL,
    description     TEXT             NULL,
    price           NUMERIC(15,2)    NOT NULL,
    unit            VARCHAR(50)      DEFAULT N'Hộp',
    category_id     BIGINT           NULL,
    manufacturer_id BIGINT           NULL,
    status          product_status  DEFAULT 'ACTIVE',
    expire_date     DATE             NULL,
    created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    deleted_at      TIMESTAMP        NULL,
    PRIMARY KEY (product_id),
    FOREIGN KEY (category_id)     REFERENCES categories(category_id)       ON DELETE SET NULL,
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(manufacturer_id) ON DELETE SET NULL
);

CREATE INDEX idx_products_category     ON products(category_id);
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 7. INVENTORY
-- ----------------------------------------------------------------
CREATE TABLE inventory (
    inventory_id BIGSERIAL NOT NULL,
    product_id  BIGINT    NOT NULL,
    quantity     INT       NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (inventory_id),
    CONSTRAINT uk_inventory_product UNIQUE (product_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE OR REPLACE TRIGGER trg_inventory_last_updated
    BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION set_last_updated();

-- ----------------------------------------------------------------
-- 8. INVENTORY_LOGS
-- ----------------------------------------------------------------
CREATE TABLE inventory_logs (
    log_id            BIGSERIAL        NOT NULL,
    product_id       BIGINT           NOT NULL,
    change_type       change_type_enum NOT NULL,
    quantity          INT              NOT NULL,
    previous_quantity INT              NOT NULL,
    new_quantity      INT              NOT NULL,
    reference_id      BIGINT           NULL,
    note              VARCHAR(500)     NULL,
    created_at        TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (log_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE INDEX idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_logs_type     ON inventory_logs(change_type);

-- ----------------------------------------------------------------
-- 9. CARTS
-- ----------------------------------------------------------------
CREATE TABLE carts (
    cart_id    BIGSERIAL NOT NULL,
    user_id    BIGINT    NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (cart_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 10. CART_ITEMS
-- ----------------------------------------------------------------
CREATE TABLE cart_items (
    cart_item_id BIGSERIAL NOT NULL,
    cart_id      BIGINT    NOT NULL,
    product_id  BIGINT    NOT NULL,
    quantity     INT       NOT NULL DEFAULT 1,
    PRIMARY KEY (cart_item_id),
    CONSTRAINT uk_cart_product UNIQUE (cart_id, product_id),
    FOREIGN KEY (cart_id)     REFERENCES carts(cart_id)         ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 11. ORDERS
-- ----------------------------------------------------------------
CREATE TABLE orders (
    order_id         BIGSERIAL           NOT NULL,
    user_id          BIGINT              NULL,
    order_code       VARCHAR(100)        NOT NULL UNIQUE,
    total_price      NUMERIC(15,2)       NOT NULL,
    order_status     order_status_enum   DEFAULT 'PENDING',
    payment_status   payment_status_enum DEFAULT 'PENDING',
    shipping_address VARCHAR(500)        NULL,
    note             TEXT                NULL,
    cancelled_by     VARCHAR(20)         NULL,
    cancelled_reason VARCHAR(500)        NULL,
    cancelled_at     TIMESTAMP           NULL,
    created_at       TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_orders_user   ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 12. ORDER_ITEMS
-- ----------------------------------------------------------------
CREATE TABLE order_items (
    order_item_id BIGSERIAL     NOT NULL,
    order_id      BIGINT        NOT NULL,
    product_id   BIGINT        NULL,
    quantity      INT           NOT NULL,
    unit_price    NUMERIC(15,2) NOT NULL,
    total_price   NUMERIC(15,2) NOT NULL,
    PRIMARY KEY (order_item_id),
    FOREIGN KEY (order_id)    REFERENCES orders(order_id)         ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)   ON DELETE SET NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ----------------------------------------------------------------
-- 13. PAYMENTS
-- ----------------------------------------------------------------
CREATE TABLE payments (
    payment_id       BIGSERIAL           NOT NULL,
    order_id         BIGINT              NOT NULL,
    payment_method   payment_method_enum NOT NULL,
    amount           NUMERIC(15,2)       NOT NULL,
    transaction_code VARCHAR(255)        NULL,
    status           txn_status_enum     DEFAULT 'PENDING',
    paid_at          TIMESTAMP           NULL,
    expired_at       TIMESTAMP           NULL,
    raw_callback     JSONB               NULL,
    attempt_count    INT                 NOT NULL DEFAULT 0,
    created_at       TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (payment_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_order  ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------
-- 14. SHIPMENTS
-- ----------------------------------------------------------------
CREATE TABLE shipments (
    shipment_id   BIGSERIAL            NOT NULL,
    order_id      BIGINT               NOT NULL,
    tracking_code VARCHAR(100)         NULL,
    carrier       VARCHAR(100)         NULL,
    status        shipment_status_enum NULL,
    shipped_at    TIMESTAMP            NULL,
    delivered_at  TIMESTAMP            NULL,
    PRIMARY KEY (shipment_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);


-- ----------------------------------------------------------------
-- 15. PRODUCT_IMAGES
-- ----------------------------------------------------------------
CREATE TABLE product_images (
  image_id      BIGSERIAL PRIMARY KEY,
  product_id   BIGINT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  image_url     VARCHAR(500) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW()
);
 
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- ----------------------------------------------------------------
-- 16. OTP-VERIFICATIONS
-- ----------------------------------------------------------------
CREATE TABLE otp_verifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  new_email  VARCHAR(255) NOT NULL,
  otp        VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- SEED DATA
-- ================================================================

-- Roles
INSERT INTO roles (role_name) VALUES ('ROLE_CUSTOMER'), ('ROLE_ADMIN'), ('ROLE_PHARMACIST');

-- Admin (password: Admin@123)
INSERT INTO users (user_name, password, full_name, email, phone, role_id)
SELECT 'admin',
       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
       N'Quản trị viên', 'admin@pharmacy.vn', '0900000000', role_id
FROM roles WHERE role_name = 'ROLE_ADMIN';

INSERT INTO users (user_name, password, full_name, email, phone, role_id)
SELECT 'wicky',
       '$2a$10$s8XCruq912V8s9qDmswh0uCBkaKyKa6c84svh753usl1ysqh/6CvW',
       N'Wicky White', 'wicky@gmail.com', '0812099286', role_id
FROM roles WHERE role_name = 'ROLE_ADMIN';

INSERT INTO users (user_name, password, full_name, email, phone, role_id)
SELECT 'giaphien',
       '$2a$10$OJT.ies8HZksnB28yS5lduxCddwTIO.4QVLVBNR2oBj5F.G4JMNk.',
       N'Giáp Minh Hiển', 'hien@gmail.com', '0977711418', role_id
FROM roles WHERE role_name = 'ROLE_CUSTOMER';

-- Manufacturers
INSERT INTO manufacturers (name, country) VALUES
                                              ('Ipsen Pharma',     N'Pháp'),
                                              ('Bayer',            N'Đức'),
                                              ('Janssen',          N'Bỉ'),
                                              ('Pfizer',           N'Mỹ'),
                                              ('Blackmores',       N'Úc'),
                                              (N'Dược Hậu Giang',   N'Việt Nam'),
                                              ('Traphaco',         N'Việt Nam'),
                                              ('Omron',            N'Nhật Bản');

-- Categories
INSERT INTO categories (name, slug) VALUES
                                        (N'Thuốc tiêu hoá',        'thuoc-tieu-hoa'),
                                        (N'Vitamin & Khoáng chất', 'vitamin-khoang-chat'),
                                        (N'Thuốc hô hấp',          'thuoc-ho-hap'),
                                        (N'Thuốc tim mạch',        'thuoc-tim-mach'),
                                        (N'Dược mỹ phẩm',          'duoc-my-pham'),
                                        (N'Thiết bị y tế',         'thiet-bi-y-te');

-- products
INSERT INTO products (name, slug, description, price, unit, category_id, manufacturer_id, status)
VALUES
    ('Smecta 3g', 'smecta-3g',
     N'Điều trị tiêu chảy cấp và mãn tính', 85000, N'Hộp 30 gói',
     (SELECT category_id FROM categories WHERE slug = 'thuoc-tieu-hoa'),
     (SELECT manufacturer_id FROM manufacturers WHERE name = 'Ipsen Pharma'), 'ACTIVE'),

    ('Motilium-M 10mg', 'motilium-m-10mg',
     N'Điều trị buồn nôn, nôn, đầy bụng', 120000, N'Hộp 30 viên',
     (SELECT category_id FROM categories WHERE slug = 'thuoc-tieu-hoa'),
     (SELECT manufacturer_id FROM manufacturers WHERE name = 'Janssen'), 'ACTIVE'),

    ('Vitamin C 1000mg Redoxon', 'vitamin-c-1000mg-redoxon',
     N'Bổ sung vitamin C, tăng sức đề kháng', 180000, N'Hộp 10 ống sủi',
     (SELECT category_id FROM categories WHERE slug = 'vitamin-khoang-chat'),
     (SELECT manufacturer_id FROM manufacturers WHERE name = 'Bayer'), 'ACTIVE'),

    ('Centrum Silver', 'centrum-silver',
     N'Vitamin tổng hợp cho người trên 50 tuổi', 450000, N'Hộp 30 viên',
     (SELECT category_id FROM categories WHERE slug = 'vitamin-khoang-chat'),
     (SELECT manufacturer_id FROM manufacturers WHERE name = 'Pfizer'), 'ACTIVE'),

    ('Blackmores Fish Oil 1000mg', 'blackmores-fish-oil-1000mg',
     N'Omega-3 hỗ trợ tim mạch và não bộ', 320000, N'Hộp 60 viên',
     (SELECT category_id FROM categories WHERE slug = 'vitamin-khoang-chat'),
     (SELECT manufacturer_id FROM manufacturers WHERE name = 'Blackmores'), 'ACTIVE'),

    ('Tiffy Forte', 'tiffy-forte',
     N'Điều trị cảm cúm, sổ mũi, nghẹt mũi', 45000, N'Hộp 24 viên',
     (SELECT category_id FROM categories WHERE slug = 'thuoc-ho-hap'),
     (SELECT manufacturer_id FROM manufacturers WHERE name = 'Dược Hậu Giang'), 'ACTIVE'),

    ('Broncol 5mg', 'broncol-5mg',
     N'Điều trị ho, long đờm', 78000, N'Hộp 20 viên',
     (SELECT category_id FROM categories WHERE slug = 'thuoc-ho-hap'),
     (SELECT manufacturer_id FROM manufacturers WHERE name = 'Dược Hậu Giang'), 'ACTIVE'),

    (N'Máy đo huyết áp Omron HEM-7120', 'may-do-huyet-ap-omron-7120',
     N'Đo huyết áp bắp tay tự động, kết quả chính xác', 890000, N'Cái',
     (SELECT category_id FROM categories WHERE slug = 'thiet-bi-y-te'),
     (SELECT manufacturer_id FROM manufacturers WHERE name = 'Omron'), 'ACTIVE');

-- Inventory (tồn kho ban đầu)
INSERT INTO inventory (product_id, quantity)
SELECT product_id, 150 FROM products WHERE slug = 'smecta-3g';
INSERT INTO inventory (product_id, quantity)
SELECT product_id, 80  FROM products WHERE slug = 'motilium-m-10mg';
INSERT INTO inventory (product_id, quantity)
SELECT product_id, 200 FROM products WHERE slug = 'vitamin-c-1000mg-redoxon';
INSERT INTO inventory (product_id, quantity)
SELECT product_id, 60  FROM products WHERE slug = 'centrum-silver';
INSERT INTO inventory (product_id, quantity)
SELECT product_id, 90  FROM products WHERE slug = 'blackmores-fish-oil-1000mg';
INSERT INTO inventory (product_id, quantity)
SELECT product_id, 300 FROM products WHERE slug = 'tiffy-forte';
INSERT INTO inventory (product_id, quantity)
SELECT product_id, 180 FROM products WHERE slug = 'broncol-5mg';
INSERT INTO inventory (product_id, quantity)
SELECT product_id, 25  FROM products WHERE slug = 'may-do-huyet-ap-omron-7120';

INSERT INTO carts (user_id, created_at)
SELECT u.user_id, NOW()
FROM users u
LEFT JOIN carts c ON c.user_id = u.user_id
WHERE c.cart_id IS NULL;

INSERT INTO product_images (product_id, image_url, display_order)
SELECT product_id, image, 0
FROM products
WHERE image IS NOT NULL;
