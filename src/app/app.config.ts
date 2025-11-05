// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 👈 Importar provideHttpClient y withInterceptors

import { routes } from './app.routes';
import { authInterceptor } from './modules/auth/interceptors/auth.interceptor'; // 👈 Importar tu interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // 🔑 CLAVE: Registrar el interceptor JWT
    provideHttpClient(
      withInterceptors([authInterceptor]) 
    )
  ]
};