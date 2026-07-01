-- Migration: 000005_create_product_config
-- Creates products, product_entities, and product_issue_types tables
-- for managing product configurations in the database

CREATE TABLE IF NOT EXISTS products (
    id              BIGINT          PRIMARY KEY,
    name            VARCHAR(255)    NOT NULL,
    description     TEXT,
    is_active       BOOLEAN         DEFAULT true,
    created_at      BIGINT          NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
    updated_at      BIGINT          NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_products_name ON products (name);

-- Entities that can be used for ratings and issues within a product
CREATE TABLE IF NOT EXISTS product_entities (
    id              BIGSERIAL       PRIMARY KEY,
    product_id      BIGINT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    entity_name     VARCHAR(100)    NOT NULL,
    description     TEXT,
    created_at      BIGINT          NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_entities_product_entity
    ON product_entities (product_id, entity_name);
CREATE INDEX IF NOT EXISTS idx_product_entities_product_id ON product_entities (product_id);

-- Issue types that can be used within a product
CREATE TABLE IF NOT EXISTS product_issue_types (
    id              BIGSERIAL       PRIMARY KEY,
    product_id      BIGINT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type_name       VARCHAR(100)    NOT NULL,
    description     TEXT,
    created_at      BIGINT          NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_issue_types_product_type
    ON product_issue_types (product_id, type_name);
CREATE INDEX IF NOT EXISTS idx_product_issue_types_product_id ON product_issue_types (product_id);
