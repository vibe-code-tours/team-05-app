---
name: prisma
description: Prisma ORM rules — schema design, migrations, queries, relations, indexing, and best practices
---

# Prisma Skill

## Schema Rules

### Model Naming
- PascalCase for model names: `User`, `OrderItem`, `ShipmentTracking`
- camelCase for field names: `createdAt`, `userId`, `orderId`
- Plural for relations: `users`, `orders`, `items`

### Required Fields
Every model MUST have:
```prisma
model Example {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? // Soft delete
}
```

### Relations
```prisma
// One-to-Many
model User {
  id     String  @id @default(uuid())
  orders Order[]
}

model Order {
  id       String @id @default(uuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id])
  
  @@index([userId])
}

// Many-to-Many (explicit)
model Product {
  id       String      @id @default(uuid())
  tags     ProductTag[]
}

model ProductTag {
  id        String  @id @default(uuid())
  productId String
  tagId     String
  product   Product @relation(fields: [productId], references: [id])
  tag       Tag     @relation(fields: [tagId], references: [id])
  
  @@unique([productId, tagId])
}
```

### Indexes
```prisma
model Product {
  // Single field index
  sellerId String
  @@index([sellerId])
  
  // Composite index
  categoryId String
  type       ProductType
  @@index([categoryId, type])
  
  // Unique constraint
  sku String
  @@unique([sku])
}
```

---

## Query Rules

### Always Use Transactions
```typescript
const [user, order] = await this.prisma.$transaction([
  this.prisma.user.create({ data: userData }),
  this.prisma.order.create({ data: orderData }),
]);
```

### Use Include for Relations
```typescript
const order = await this.prisma.order.findUnique({
  where: { id },
  include: {
    user: true,
    items: {
      include: { product: true },
    },
    payment: true,
    shipment: true,
  },
});
```

### Use Select for Specific Fields
```typescript
const users = await this.prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Don't expose passwordHash
  },
});
```

---

## Migration Rules

1. **Never drop columns** — use `deletedAt`
2. **Never rename columns** — add new, migrate, drop old
3. **Always add indexes** on foreign keys
4. **Migrations must be backward-compatible**
5. **Test on production-like data**

---

## Rules

**Always:**
- Use Prisma for ALL database access
- Parameterized queries (Prisma handles this)
- Index foreign keys
- Use transactions for multi-step operations
- Soft delete (never hard delete)

**Never:**
- Raw SQL (unless absolutely necessary)
- Skip validation
- Expose passwordHash in responses
- Use `any` in Prisma types
- Commit migration files without testing
