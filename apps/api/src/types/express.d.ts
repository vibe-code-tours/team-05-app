import { Request } from 'express';

declare module 'express' {
  interface Request {
    dataFilter?: Record<string, unknown> | null;
  }
}
