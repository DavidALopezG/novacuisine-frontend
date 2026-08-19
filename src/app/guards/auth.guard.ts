// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar que el token no haya expirado
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirado = payload.exp && (payload.exp * 1000) < Date.now();

    if (expirado) {
      console.warn('⚠️ Token expirado. Redirigiendo al login...');
      localStorage.removeItem('token');
      router.navigate(['/login']);
      return false;
    }
  } catch {
    localStorage.removeItem('token');
    router.navigate(['/login']);
    return false;
  }

  return true;
};
