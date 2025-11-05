import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Necesario para la navegación y el router-outlet
import { AuthService } from '../../../services/auth.service'; // Asumiendo que tienes un AuthService

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // Importante para que <router-outlet> y routerLink funcionen
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {
  
  // Propiedad para almacenar el rol del usuario actual
  userRole: number | null = null; // Asume que el rol es 1 (Admin), 2 (Docente), etc.
  constructor(
    private authService: AuthService, // Para manejar la lógica de logout
    private router: Router          // Para la redirección
  ) {}

  ngOnInit(): void {
    // 🔑 CLAVE: Ahora solo determinamos el rol, NO manejamos la redirección aquí.
    // Dejamos que el Angular Router (app.routes.ts) maneje la redirección a 'admin' 
    // a través del: { path: '', redirectTo: 'admin', pathMatch: 'full' }
    this.userRole =  this.authService.getRoleFromToken();
  }

  /**
   * Lee el rol del usuario desde el token guardado en localStorage.
   * NOTA: En una aplicación real, se recomienda leer un Observable del AuthService.
   * NOTA 2: Esta lógica ASUME que el token JWT contiene el campo 'rol'.
   */

  /**
   * Método de conveniencia para mostrar elementos de menú condicionalmente.
   * Usado en el HTML como: *ngIf="isAdmin()"
   */
  isAdmin(): boolean {
    return this.userRole === 1;
  }

  isDocente(): boolean {
    return this.userRole === 2;
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    // 1. Eliminar el token
    localStorage.removeItem('token'); 
    
    // 2. Opcional: Llamar a AuthService.logout() si realiza alguna limpieza en el backend
    // this.authService.logout().subscribe(); 

    // 3. Redirigir a la página de login
    this.router.navigate(['/login']);
  }
}