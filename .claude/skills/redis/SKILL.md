---
name: redis
description: Redis caching strategies — cache invalidation, TTL management, session storage, and real-time features
---

# Redis Skill

## Use Cases

### Caching
- Product listings (5 min TTL)
- Category trees (1 hour TTL)
- User sessions (15 min TTL)
- Hot promotion data (1 min TTL)

### Session Storage
- JWT refresh tokens
- OTP codes (5 min TTL)
- Rate limiting counters

### Real-time
- Pub/Sub for notifications
- WebSocket connections
- Live order status updates

---

## Caching Patterns

### Cache-Aside (Lazy Loading)
```typescript
async getProduct(id: string) {
  // 1. Check cache
  const cached = await this.redis.get(`product:${id}`);
  if (cached) return JSON.parse(cached);

  // 2. Fetch from database
  const product = await this.prisma.product.findUnique({ where: { id } });

  // 3. Store in cache
  await this.redis.set(`product:${id}`, JSON.stringify(product), 'EX', 3600);

  return product;
}
```

### Write-Through
```typescript
async updateProduct(id: string, data: UpdateProductDto) {
  // 1. Update database
  const product = await this.prisma.product.update({ where: { id }, data });

  // 2. Update cache
  await this.redis.set(`product:${id}`, JSON.stringify(product), 'EX', 3600);

  return product;
}
```

### Cache Invalidation
```typescript
async deleteProduct(id: string) {
  // 1. Delete from database
  await this.prisma.product.delete({ where: { id } });

  // 2. Invalidate cache
  await this.redis.del(`product:${id}`);

  // 3. Invalidate related caches
  await this.redis.del('products:list');
}
```

---

## TTL Strategy

| Data Type | TTL | Reason |
|---|---|---|
| Product detail | 1 hour | Changes infrequently |
| Product list | 5 min | Changes frequently |
| Category tree | 1 hour | Rarely changes |
| User session | 15 min | Security |
| OTP code | 5 min | Security |
| Rate limit | 1 min | Sliding window |

---

## Rules

**Always:**
- Set TTL on all cached data
- Invalidate cache on writes
- Handle cache misses gracefully
- Use connection pooling
- Monitor memory usage

**Never:**
- Cache without TTL (memory leak)
- Cache sensitive data (passwords, tokens)
- Skip cache invalidation on updates
- Use blocking operations
- Ignore cache size limits
