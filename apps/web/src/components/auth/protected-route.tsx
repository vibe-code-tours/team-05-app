'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('ADMIN' | 'SELLER' | 'CLIENT')[];
  requiredRole?: 'ADMIN' | 'SELLER' | 'CLIENT';
}

export function ProtectedRoute({ children, allowedRoles, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const roles = requiredRole ? [requiredRole] : (allowedRoles ?? []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      redirectByRole(user.role);
      return;
    }
  }, [user, loading, roles, router]);

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        router.push('/admin');
        break;
      case 'SELLER':
        router.push('/seller');
        break;
      case 'CLIENT':
      default:
        router.push('/');
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Loading">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" aria-hidden="true"></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!user || (roles.length > 0 && !roles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
