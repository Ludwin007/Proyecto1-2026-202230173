import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.estaLogueado()) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.esAdmin()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};

export const operacionesGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.tieneRol(2, 3)) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};

export const clienteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.tieneRol(1, 3)) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};