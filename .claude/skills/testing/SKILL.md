---
name: testing
description: Testing strategy — unit tests, integration tests, E2E tests, test automation, and quality assurance
---

# Testing Skill

## Test Pyramid

```
          ╱╲
         ╱  ╲         E2E Tests (Playwright)
        ╱    ╲        - Critical user flows
       ╱──────╲       - Few, slow, expensive
      ╱        ╲
     ╱          ╲      Integration Tests (Jest)
    ╱            ╲     - API endpoints, DB
   ╱──────────────╲    - Moderate, medium speed
  ╱                ╲
 ╱                  ╲   Unit Tests (Jest/Vitest)
╱────────────────────╲  - Services, utilities
                       - Many, fast, cheap
```

---

## Unit Tests (Jest)

### Service Test
```typescript
describe('ProductService', () => {
  let service: ProductService;
  let repository: MockType<ProductRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    service = new ProductService(repository);
  });

  it('should create product', async () => {
    const dto = { name: 'Test', price: 10000 };
    repository.create.mockResolvedValue({ id: '1', ...dto });

    const result = await service.create(dto);

    expect(result).toHaveProperty('id', '1');
    expect(repository.create).toHaveBeenCalled();
  });

  it('should throw on invalid price', async () => {
    const dto = { name: 'Test', price: -100 };

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });
});
```

### DTO Validation Test
```typescript
describe('CreateProductDto', () => {
  it('should validate correct data', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Test',
      price: 10000,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail on empty name', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: '',
      price: 10000,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

---

## E2E Tests (Playwright)

```typescript
test.describe('Purchase Flow', () => {
  test('should complete purchase', async ({ page }) => {
    await page.goto('/products');
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('[data-testid="add-to-cart"]');
    await page.goto('/cart');
    await page.click('[data-testid="checkout"]');
    await page.fill('[data-testid="address"]', '123 Main St');
    await page.click('[data-testid="place-order"]');
    await expect(page).toHaveURL(/\/orders\//);
  });
});
```

---

## Coverage Targets

| Area | Target |
|---|---|
| Services | 80%+ |
| DTOs | 90%+ |
| E2E Critical | 100% |

---

## Rules

**Always:**
- Test one thing per test
- Use descriptive test names
- Mock external dependencies
- Test edge cases
- Test error handling

**Never:**
- Test implementation details
- Skip error path tests
- Use real databases in unit tests
- Leave flaky tests
