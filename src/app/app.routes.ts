// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { DashboardComponent } from './modules/components/dashboard/dashboard.component';
import { CobrosGestionComponent } from './modules/components/cobros/cobros-gestion/cobros-gestion.component';
import { InicioGeneralComponent } from './modules/inicio/inicio-general/inicio-general.component';
import { UsuariosComponent } from './modules/components/usuarios/usuarios-form/usuarios-form.component';
import { EstudiantesComponent } from './modules/components/estudiantes/estudiantes/estudiantes.component';
import { ReportesComponent } from './modules/components/reportes/reportes.component';
import { MisRecetasEstdComponent } from './modules/components/estudiantes/mis-recetas-estd/mis-recetas-estd.component';
import {PerfilEstdComponent} from './modules/components/estudiantes/perfil-estd/perfil-estd.component';
import { EstadoCuentaEstudianteComponent } from './modules/components/estudiantes/estado-cuenta-estudiante/estado-cuenta-estudiante.component';
import { HorarioClaseComponent } from './modules/components/estudiantes/horario-clase/horario-clase.component';
// Importa el componente para Docentes cuando exista
 import { MisGruposComponent } from './modules/components/docente/mis-grupos/mis-grupos.component';
 import { RecetarioMaestroComponent } from './modules/components/docente/recetario-maestro/recetario-maestro.component';
import { TitulacionesComponent } from './modules/components/titulaciones/titulaciones.component';
import { GestionHorariosComponent } from './modules/components/docente/gestion-horarios/gestion-horarios.component';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent,
    children: [
      { path: 'inicio', component: InicioGeneralComponent },
      // Rutas Admin
      { path: 'cobros', component: CobrosGestionComponent },
      { path: 'usuarios', component: UsuariosComponent },
      { path: 'estudiantes', component: EstudiantesComponent },
      { path: 'reportes', component: ReportesComponent },
      { path: 'titulaciones', component: TitulacionesComponent },

      // Rutas Docente (Rol 2)
       { path: 'mis-grupos', component: MisGruposComponent },
       { path: 'recetario-maestro', component: RecetarioMaestroComponent },
      // { path: 'evaluaciones', component: CalificacionesComponent },

      // 📅 Gestión de horarios: compartida por Admin (gestiona todos) y Docente (gestiona los suyos)
      { path: 'gestion-horarios', component: GestionHorariosComponent },

      // 🎓 Rutas Estudiante (Debes crear estos componentes)
      { path: 'perfil', component: PerfilEstdComponent },
      { path: 'mis-recetas', component: MisRecetasEstdComponent },
      { path: 'mi-cuenta', component: EstadoCuentaEstudianteComponent },
      { path: 'horarios', component: HorarioClaseComponent },

      { path: '', redirectTo: 'inicio', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];