-- Migration: 000006_seed_product_config (rollback)

DELETE FROM product_issue_types WHERE product_id = 101 AND type_name IN ('issue', 'improvement', 'other');
DELETE FROM product_entities WHERE product_id = 101 AND entity_name IN ('app', 'topic', 'question');
DELETE FROM products WHERE id = 101;
