---
name: postgres
description: PostgreSQL database rules — schema design, indexing, query optimization, and performance tuning
---

# PostgreSQL Skill

## Connection Pooling
- Use Prisma's built-in connection pool
- Default pool size: 10 (adjust based on load)
- Configure in `schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}
```

## Indexing Strategy

### When to Index
- Foreign keys (always)
- Frequently queried fields
- Fields used in WHERE clauses
- Fields used in ORDER BY
- Fields used in JOIN conditions

### Index Types
```sql
-- B-tree (default, most common)
CREATE INDEX idx_products_category ON products(category_id);

-- Composite index
CREATE INDEX idx_products_category_type ON products(category_id, type);

-- Partial index
CREATE INDEX idx_products_active ON products(created_at) 
WHERE status = 'APPROVED';

-- GIN for full-text search
CREATE INDEX idx_products_search ON products 
USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

## Query Optimization

### Use EXPLAIN ANALYZE
```sql
EXPLAIN ANALYZE 
SELECT * FROM products 
WHERE category_id = 'uuid' 
AND status = 'APPROVED' 
ORDER BY created_at DESC 
LIMIT 20;
```

### Common Performance Issues
1. **N+1 Queries** — use `include` in Prisma
2. **Missing Indexes** — check slow query log
3. **SELECT *** — select only needed columns
4. **Large OFFSET** — use cursor-based pagination
5. **Unnecessary JOINs** — denormalize when appropriate

## Backup Strategy
- Automated daily backups
- Retain for 30 days
- Test restore monthly
- Point-in-time recovery for production

## Rules

**Always:**
- Use connection pooling
- Index foreign keys
- Use transactions for multi-step operations
- Monitor slow queries
- Test migrations on production-like data

**Never:**
- Skip indexes on foreign keys
- Use `SELECT *` in production
- Run migrations on production without testing
- Ignore slow query warnings
