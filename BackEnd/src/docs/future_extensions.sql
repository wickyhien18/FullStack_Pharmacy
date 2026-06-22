-- ================================================================
-- PharmacyDB — Future Extensions (Mở rộng tương lai)
-- Chưa deploy, chỉ lưu ý tưởng — chạy từng phần khi cần
-- ================================================================

-- ================================================================
-- 1. ADDRESSES — Địa chỉ giao hàng của user
-- ================================================================
CREATE TABLE addresses (
    address_id  BIGSERIAL    NOT NULL,
    user_id     BIGINT       NOT NULL,
    receiver    VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    province    VARCHAR(100) NOT NULL,
    district    VARCHAR(100) NOT NULL,
    ward        VARCHAR(100) NOT NULL,
    street      VARCHAR(500) NOT NULL,
    is_default  BOOLEAN      DEFAULT FALSE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (address_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ================================================================
-- 2. product_IMAGES — Nhiều ảnh cho 1 sản phẩm
-- ================================================================
CREATE TABLE product_images (
    image_id    BIGSERIAL    NOT NULL,
    product_id BIGINT       NOT NULL,
    url         VARCHAR(500) NOT NULL,
    is_primary  BOOLEAN      DEFAULT FALSE,
    sort_order  INT          DEFAULT 0,
    PRIMARY KEY (image_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);
CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ================================================================
-- 3. REVIEWS — Đánh giá sản phẩm
-- ================================================================
CREATE TABLE reviews (
    review_id   BIGSERIAL NOT NULL,
    user_id     BIGINT    NOT NULL,
    product_id BIGINT    NOT NULL,
    order_id    BIGINT    NULL,
    rating      SMALLINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(255) NULL,
    content     TEXT         NULL,
    is_verified BOOLEAN   DEFAULT FALSE, -- Đã mua hàng thật
    is_visible  BOOLEAN   DEFAULT TRUE,  -- Admin có thể ẩn
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (review_id),
    CONSTRAINT uk_user_product_review UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id)     REFERENCES users(user_id)         ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id)    REFERENCES orders(order_id)       ON DELETE SET NULL
);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user     ON reviews(user_id);

-- ================================================================
-- 4. COUPONS + COUPON_USAGES — Mã giảm giá
-- ================================================================
CREATE TYPE coupon_type_enum AS ENUM ('PERCENT', 'FIXED');

CREATE TABLE coupons (
    coupon_id       BIGSERIAL        NOT NULL,
    code            VARCHAR(50)      NOT NULL UNIQUE,
    name            VARCHAR(255)     NOT NULL,
    description     TEXT             NULL,
    type            coupon_type_enum NOT NULL,
    value           NUMERIC(15,2)    NOT NULL,
    min_order_value NUMERIC(15,2)    DEFAULT 0,
    max_discount    NUMERIC(15,2)    NULL,        -- Giới hạn giảm tối đa (cho PERCENT)
    usage_limit     INT              NULL,        -- Tổng số lần có thể dùng
    used_count      INT              DEFAULT 0,
    per_user_limit  INT              DEFAULT 1,   -- Mỗi user dùng tối đa N lần
    is_active       BOOLEAN          DEFAULT TRUE,
    start_at        TIMESTAMP        NOT NULL,
    expire_at       TIMESTAMP        NOT NULL,
    created_at      TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (coupon_id)
);
CREATE INDEX idx_coupons_code   ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active, expire_at);

CREATE TABLE coupon_usages (
    usage_id  BIGSERIAL NOT NULL,
    coupon_id BIGINT    NOT NULL,
    user_id   BIGINT    NOT NULL,
    order_id  BIGINT    NULL,
    used_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usage_id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)   REFERENCES users(user_id)     ON DELETE CASCADE
);
CREATE INDEX idx_coupon_usages_coupon ON coupon_usages(coupon_id);
CREATE INDEX idx_coupon_usages_user   ON coupon_usages(user_id);

-- ================================================================
-- 5. OTPS — Xác thực email/phone
-- ================================================================
CREATE TYPE otp_purpose_enum AS ENUM ('REGISTER', 'RESET_PASSWORD', 'VERIFY_EMAIL', 'VERIFY_PHONE');

CREATE TABLE otps (
    otp_id     BIGSERIAL        NOT NULL,
    user_id    BIGINT           NULL,  -- NULL nếu chưa có tài khoản (register)
    email      VARCHAR(255)     NOT NULL,
    code       VARCHAR(10)      NOT NULL,
    purpose    otp_purpose_enum NOT NULL,
    is_used    BOOLEAN          DEFAULT FALSE,
    expire_at  TIMESTAMP        NOT NULL,
    created_at TIMESTAMP        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (otp_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_otps_email ON otps(email);

-- ================================================================
-- 6. WISHLISTS — Sản phẩm yêu thích
-- ================================================================
CREATE TABLE wishlists (
    wishlist_id BIGSERIAL NOT NULL,
    user_id     BIGINT    NOT NULL,
    product_id BIGINT    NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (wishlist_id),
    CONSTRAINT uk_wishlist UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id)     REFERENCES users(user_id)         ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);

-- ================================================================
-- 7. CATEGORIES — Thêm parent_id (danh mục cha/con)
-- ================================================================
ALTER TABLE categories ADD COLUMN parent_id BIGINT NULL;
ALTER TABLE categories ADD COLUMN icon       VARCHAR(500) NULL;
ALTER TABLE categories ADD COLUMN sort_order INT DEFAULT 0;
ALTER TABLE categories
    ADD CONSTRAINT fk_category_parent
    FOREIGN KEY (parent_id) REFERENCES categories(category_id) ON DELETE SET NULL;
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ================================================================
-- 8. ORDERS — Bổ sung các cột còn thiếu
-- ================================================================
ALTER TABLE orders ADD COLUMN payment_method  VARCHAR(20)    DEFAULT 'COD';
ALTER TABLE orders ADD COLUMN original_price  NUMERIC(15,2)  DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_amount NUMERIC(15,2)  DEFAULT 0;
ALTER TABLE orders ADD COLUMN coupon_code     VARCHAR(50)    NULL;
ALTER TABLE orders ADD COLUMN shipping_fee    NUMERIC(15,2)  DEFAULT 0;
ALTER TABLE orders ADD COLUMN cancelled_by     VARCHAR(20)   NULL;  -- 'USER' hoặc 'ADMIN'
ALTER TABLE orders ADD COLUMN cancelled_reason VARCHAR(500)  NULL;
ALTER TABLE orders ADD COLUMN cancelled_at     TIMESTAMP     NULL;

-- ================================================================
-- 9. productS — Bổ sung thông tin chi tiết
-- ================================================================
ALTER TABLE products ADD COLUMN original_price        NUMERIC(15,2) NULL;
ALTER TABLE products ADD COLUMN requires_prescription BOOLEAN       DEFAULT FALSE;
ALTER TABLE products ADD COLUMN ingredients           TEXT          NULL;
ALTER TABLE products ADD COLUMN usage                 TEXT          NULL;
ALTER TABLE products ADD COLUMN dosage                TEXT          NULL;
ALTER TABLE products ADD COLUMN contraindication      TEXT          NULL;

-- ================================================================
-- 10. EXTENSIONS PostgreSQL
-- ================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- Full-text search tiếng Việt
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- Gen UUID cho order_code

-- Index full-text search trên tên thuốc
CREATE INDEX idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- ================================================================
-- 11. VIEW vw_products_summary
-- Dùng cho trang danh sách sản phẩm — tổng hợp tồn kho + rating
-- ================================================================
CREATE OR REPLACE VIEW vw_products_summary AS
SELECT
    m.product_id,
    m.name,
    m.slug,
    m.price,
    m.original_price,
    m.unit,
    m.status,
    m.requires_prescription,
    c.name                                                      AS category_name,
    c.slug                                                      AS category_slug,
    mf.name                                                     AS manufacturer_name,
    COALESCE(inv.quantity, 0)                                   AS stock,
    COALESCE(ROUND(AVG(r.rating)::NUMERIC, 1), 0)              AS avg_rating,
    COUNT(r.review_id)                                          AS review_count,
    (SELECT url FROM product_images mi
     WHERE mi.product_id = m.product_id AND mi.is_primary = TRUE
     LIMIT 1)                                                   AS primary_image
FROM products m
LEFT JOIN categories    c   ON c.category_id      = m.category_id
LEFT JOIN manufacturers mf  ON mf.manufacturer_id = m.manufacturer_id
LEFT JOIN inventory     inv ON inv.product_id     = m.product_id
LEFT JOIN reviews       r   ON r.product_id       = m.product_id AND r.is_visible = TRUE
WHERE m.deleted_at IS NULL
GROUP BY m.product_id, c.name, c.slug, mf.name, inv.quantity;

-- ================================================================
-- 12. NOTIFICATIONS — Thông báo realtime (kết hợp Socket.io Phase 4)
-- ================================================================
CREATE TABLE notifications (
    notification_id BIGSERIAL    NOT NULL,
    user_id         BIGINT       NOT NULL,
    title           VARCHAR(255) NOT NULL,
    content         TEXT         NOT NULL,
    type            VARCHAR(50)  NOT NULL, -- ORDER_STATUS, PROMOTION, SYSTEM
    reference_id    BIGINT       NULL,     -- order_id hoặc id liên quan
    is_read         BOOLEAN      DEFAULT FALSE,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
CREATE INDEX idx_notifications_user    ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);

-- ================================================================
-- 13. BANNERS — Quản lý banner trang chủ
-- ================================================================
CREATE TABLE banners (
    banner_id  BIGSERIAL    NOT NULL,
    title      VARCHAR(255) NOT NULL,
    image_url  VARCHAR(500) NOT NULL,
    link       VARCHAR(500) NULL,
    sort_order INT          DEFAULT 0,
    is_active  BOOLEAN      DEFAULT TRUE,
    start_at   TIMESTAMP    NULL,
    expire_at  TIMESTAMP    NULL,
    created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (banner_id)
);

-- ================================================================
-- 14. PRESCRIPTION_UPLOADS — Upload đơn thuốc
-- ================================================================
CREATE TYPE prescription_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE prescription_uploads (
    prescription_id BIGSERIAL                 NOT NULL,
    user_id         BIGINT                    NOT NULL,
    image_url       VARCHAR(500)              NOT NULL,
    status          prescription_status_enum  DEFAULT 'PENDING',
    note            TEXT                      NULL,  -- Ghi chú từ dược sĩ
    reviewed_by     BIGINT                    NULL,  -- user_id dược sĩ
    reviewed_at     TIMESTAMP                 NULL,
    created_at      TIMESTAMP                 DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (prescription_id),
    FOREIGN KEY (user_id)      REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by)  REFERENCES users(user_id) ON DELETE SET NULL
);
CREATE INDEX idx_prescriptions_user   ON prescription_uploads(user_id);
CREATE INDEX idx_prescriptions_status ON prescription_uploads(status);
