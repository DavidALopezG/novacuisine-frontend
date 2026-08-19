// src/app/modules/auth/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token  = localStorage.getItem('token');

  // Rutas públicas: no necesitan token
  if (req.url.includes('/api/auth')) {
    return next(req);
  }

  // Agregar el token a todas las demás peticiones
  const cloned = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {

      // 401 = token inválido o expirado → cerrar sesión y redirigir al login
      if (error.status === 401) {
        console.warn('⚠️ Sesión expirada o token inválido. Redirigiendo al login...');
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }

      // 403 = sin permisos → solo logueamos, no cerramos sesión
      if (error.status === 403) {
        console.warn('🚫 Sin permisos para esta acción.');
      }

      return throwError(() => error);
    })
  );
};
