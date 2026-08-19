// src/app/guards/no-auth.guard.ts
// Redirige al dashboard si el usuario ya tiene sesión activa (evita doble login)
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const noAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');

  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirado = payload.exp && (payload.exp * 1000) < Date.now();

    if (expirado) {
      localStorage.removeItem('token');
      return true;
    }

    // Token válido → redirigir al dashboard
    router.navigate(['/dashboard/inicio']);
    return false;
  } catch {
    localStorage.removeItem('token');
    return true;
  }
};
