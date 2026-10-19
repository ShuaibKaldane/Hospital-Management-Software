import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { UserRole } from '../models/user.model';

const homePath = (role?: UserRole | null) => {
  if (!role) return '/login';
  if (role === 'SUPER_ADMIN') return '/super-admin';
  return `/${role.toLowerCase()}`;
};

export const authGuard: CanActivateFn = () => {
  const tokens = inject(TokenService);
  const router = inject(Router);

  if (tokens.isAuthenticated()) return true;

  router.navigate(['/login']);
  return false;
};

export const roleGuard = (...allowed: UserRole[]): CanActivateFn => {
  return () => {
    const tokens = inject(TokenService);
    const router = inject(Router);
    const role = tokens.user()?.role;

    if (!role) {
      router.navigate(['/login']);
      return false;
    }

    if (allowed.includes(role)) return true;

    // Authenticated but wrong role → push to that role's home.
    router.navigate([homePath(role)]);
    return false;
  };
};
