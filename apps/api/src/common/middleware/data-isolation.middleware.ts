import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to enforce data isolation based on user role
 *
 * - ADMIN: Can access all data (no filter)
 * - SELLER: Can only access own data (sellerId = user.id)
 * - CLIENT: Can only access own data (buyerId = user.id)
 *
 * This middleware sets req.dataFilter which should be used in service queries
 */
@Injectable()
export class DataIsolationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(DataIsolationMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const user = req.user as any;

    if (!user) {
      // No user - let auth guard handle this
      req.dataFilter = null;
      return next();
    }

    // Set data filter based on role
    switch (user.role) {
      case 'ADMIN':
        // Admin sees everything - no filter
        req.dataFilter = {};
        this.logger.debug(`Admin ${user.id}: No data filter applied`);
        break;

      case 'SELLER':
        // Seller only sees own data
        req.dataFilter = { sellerId: user.id };
        this.logger.debug(`Seller ${user.id}: Data filter applied (sellerId)`);
        break;

      case 'CLIENT':
        // Client only sees own data
        req.dataFilter = { buyerId: user.id };
        this.logger.debug(`Client ${user.id}: Data filter applied (buyerId)`);
        break;

      default:
        // Unknown role - deny access
        req.dataFilter = null;
        this.logger.warn(`Unknown role ${user.role} for user ${user.id}`);
        break;
    }

    next();
  }
}

// Extend Express Request to include dataFilter
declare global {
  namespace Express {
    interface Request {
      dataFilter?: Record<string, any> | null;
    }
  }
}
