# Migration Template

## Migration Name
[Descriptive name]

## Date
[YYYY-MM-DD]

## Author
[Name]

## Changes

### New Models
```prisma
model NewModel {
  id        String   @id @default(uuid())
  // fields...
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Modified Models
```prisma
// Before
model ExistingModel {
  oldField String
}

// After
model ExistingModel {
  oldField String
  newField String  // Added
}
```

### New Indexes
```prisma
@@index([fieldName])
```

### New Enums
```prisma
enum NewEnum {
  VALUE1
  VALUE2
}
```

## Data Migration
[Describe any data transformation needed]

```sql
-- Example: backfill new column
UPDATE table_name SET new_column = 'default_value' WHERE new_column IS NULL;
```

## Rollback Plan
[How to undo this migration]

```sql
-- Rollback SQL if needed
```

## Testing
- [ ] Tested on development database
- [ ] Tested with production-like data
- [ ] Rollback tested
- [ ] Performance verified

## Checklist
- [ ] Naming conventions followed
- [ ] Indexes on foreign keys
- [ ] Backward compatible
- [ ] Data migration included
- [ ] Rollback plan defined
- [ ] Documentation updated
