import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * Must be used with RolesGuard
 *
 * @example
 * @Roles(Role.ADMIN)
 * @Get('users')
 * findAll() { ... }
 *
 * @example
 * @Roles(Role.SELLER, Role.ADMIN)
 * @Get('products')
 * findProducts() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/**
 * Convenience decorators for common role combinations
 */
export const AdminOnly = () => Roles(Role.ADMIN);
export const SellerOnly = () => Roles(Role.SELLER);
export const ClientOnly = () => Roles(Role.CLIENT);
export const SellerOrAdmin = () => Roles(Role.SELLER, Role.ADMIN);
export const AdminOrSeller = () => Roles(Role.ADMIN, Role.SELLER);
