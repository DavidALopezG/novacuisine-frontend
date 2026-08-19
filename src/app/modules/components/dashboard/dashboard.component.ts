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

// ... (imports previos)

export class DashboardComponent implements OnInit {
  userRole: number | null = null; 
  nombreCompleto: string = '';
  inicial: string = 'U';
  rolNombre: string = 'Usuario';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRoleFromToken();
    this.nombreCompleto = localStorage.getItem('nombre_completo') || 'Usuario';
    this.inicial = this.nombreCompleto.trim().charAt(0).toUpperCase() || 'U';

    if (this.userRole === 1) {
      this.rolNombre = 'Administrador';
    } else if (this.userRole === 2) {
      this.rolNombre = 'Docente';
    } else if (this.userRole === 3) {
      this.rolNombre = 'Estudiante';
    } else {
      this.rolNombre = 'Usuario';
    }
  }

  isAdmin(): boolean {
    return this.userRole === 1;
  }

  isDocente(): boolean {
    return this.userRole === 2;
  }

  // 🎓 Nuevo método para estudiantes
  isEstudiante(): boolean {
    return this.userRole === 3; 
  }

  logout(): void {
    localStorage.removeItem('token'); 
    localStorage.removeItem('nombre_completo');
    localStorage.removeItem('user_role');
    this.router.navigate(['/login']);
  }
}