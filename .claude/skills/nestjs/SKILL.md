---
name: nestjs
description: NestJS framework rules — module pattern, controller, service, repository, DTO, validation, guards, interceptors
---

# NestJS Skill

## Module Structure

Every feature module follows this exact structure:

```
src/modules/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── <feature>.repository.ts
├── dto/
│   ├── create-<feature>.dto.ts
│   ├── update-<feature>.dto.ts
│   └── response-<feature>.dto.ts
├── entities/
│   └── <feature>.entity.ts
├── guards/
│   └── <feature>.guard.ts
├── interceptors/
│   └── <feature>.interceptor.ts
└── __tests__/
    ├── <feature>.service.spec.ts
    └── <feature>.controller.spec.ts
```

---

## Coding Rules

### Controllers — ALWAYS
- Handle HTTP concerns ONLY (request/response)
- Use `@UseGuards` for authentication
- Use `@Roles` for authorization
- Use `@UseInterceptors` for cross-cutting concerns
- Return DTOs, not raw entities
- Use `ParseUUIDPipe` for ID parameters
- Use `ParseIntPipe` for numeric parameters

### Controllers — NEVER
- ❌ Put business logic in controllers
- ❌ Access database directly
- ❌ Handle errors manually (use exceptions)
- ❌ Return raw Prisma results

### Services — ALWAYS
- Contain ALL business logic
- Inject repositories (not Prisma directly)
- Use domain events for cross-module communication
- Handle errors and translate to NestJS exceptions
- Validate business rules before persistence

### Services — NEVER
- ❌ Access HTTP context (use guards/interceptors)
- ❌ Handle request/response
- ❌ Import controllers

### Repositories — ALWAYS
- Abstract Prisma calls
- One repository per aggregate root
- Use Prisma types for parameters
- Handle database errors

### DTOs — ALWAYS
- Validate with class-validator decorators
- Separate DTOs for create, update, response
- Use `class-transformer` for transformation
- Document with Swagger decorators

---

## Exception Handling

```typescript
// Use NestJS built-in exceptions
throw new NotFoundException('Resource not found');
throw new BadRequestException('Invalid input');
throw new ForbiddenException('Insufficient permissions');
throw new ConflictException('Resource already exists');
throw new UnauthorizedException('Authentication required');
```

---

## Interceptor Pattern

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - start;
        this.logger.log(`${method} ${url} ${elapsed}ms`);
      })
    );
  }
}
```

---

## Validation Pipe

```typescript
// Global validation pipe
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  })
);
```

---

## Rules

**Always:**
- One feature per module
- Controllers are thin (HTTP only)
- Services contain business logic
- DTOs for every input
- Validation on every input
- Proper error handling

**Never:**
- Business logic in controllers
- Direct Prisma in controllers
- Skip input validation
- Use `any` type
- Return raw entities
