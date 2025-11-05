// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { DashboardComponent } from './modules/components/dashboard/dashboard.component';
import { CobrosGestionComponent } from './modules/components/cobros/cobros-gestion/cobros-gestion.component';
// Importa el componente para Docentes cuando exista
// import { DocenteDashboardComponent } from './components/dashboard/docente-dashboard.component'; 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },

  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'admin', component: CobrosGestionComponent },
      // { path: 'docente', component: DocenteDashboardComponent },
      { path: '', redirectTo: 'admin', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
];