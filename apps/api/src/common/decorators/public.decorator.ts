import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as public (no authentication required).
 * Used with the global JwtAuthGuard — any route WITHOUT @Public() will
 * require a valid JWT token.
 *
 * @example
 * @Public()
 * @Get('health')
 * check() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
