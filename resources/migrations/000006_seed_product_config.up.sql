-- Migration: 000006_seed_product_config
-- Seeds the product config previously hardcoded in dev.yaml (Service.AllowedProductIds,
-- Service.RatingEntities, Service.IssueEntities, Service.IssueTypes) so removing those
-- keys from config does not change runtime behavior.

INSERT INTO products (id, name, description, is_active) VALUES
    (101, 'Default Product', 'Seeded from legacy dev.yaml configuration', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_entities (product_id, entity_name, description) VALUES
    (101, 'app', 'Application'),
    (101, 'topic', 'Topic'),
    (101, 'question', 'Question')
ON CONFLICT (product_id, entity_name) DO NOTHING;

INSERT INTO product_issue_types (product_id, type_name, description) VALUES
    (101, 'issue', 'Issue/Bug'),
    (101, 'improvement', 'Improvement'),
    (101, 'other', 'Other')
ON CONFLICT (product_id, type_name) DO NOTHING;
