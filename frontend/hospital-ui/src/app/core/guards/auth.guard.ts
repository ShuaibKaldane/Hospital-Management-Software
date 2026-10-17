import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = () => {
  const tokens = inject(TokenService);
  const router = inject(Router);

  if (tokens.isAuthenticated()) return true;

  router.navigate(['/login']);
  return false;
};