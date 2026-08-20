// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { authInterceptor } from './modules/auth/interceptors/auth.interceptor';
import { NovaPreset } from './theme/nova-preset';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    // Interceptor JWT
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),

    // Animaciones requeridas por PrimeNG (dialogs, overlays, tooltips, etc.)
    provideAnimationsAsync(),

    // PrimeNG con el tema "Nova Cuisine" (negro/dorado) en vez del azul por defecto
    providePrimeNG({
      theme: {
        preset: NovaPreset,
        options: {
          darkModeSelector: false, // la app usa un unico esquema claro/corporativo
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities',
          },
        },
      },
      ripple: true,
    }),
  ]
};
