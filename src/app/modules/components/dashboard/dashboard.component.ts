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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userRole = this.authService.getRoleFromToken();
    console.log("Mi rol actual es:", this.userRole);
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
    this.router.navigate(['/login']);
  }
}