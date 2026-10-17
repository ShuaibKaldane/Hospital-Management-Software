import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';
import { UserRole } from '../models/user.model';

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

    // Authenticated but wrong role → push to that role's dashboard.
    router.navigate([`/${role.toLowerCase()}`]);
    return false;
  };
};