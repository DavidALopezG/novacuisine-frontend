// src/app/interceptors/auth.interceptor.ts

import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const token = localStorage.getItem('token');
  
  // 1. Excluir las solicitudes de autenticación (login/registro) para evitar bucles o errores
  if (req.url.includes('/api/auth')) {
    return next(req);
  }

  // 2. Si existe un token, clonar la solicitud y añadir el encabezado de autorización
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`) // 🔑 CLAVE: Añadir el token JWT
    });
    
    // 3. Pasar la solicitud clonada al siguiente manejador
    return next(cloned);
  }

  // 4. Si no hay token, continuar con la solicitud original (para rutas públicas)
  return next(req);
};