import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // 🔐 Login
  login(email: string, contrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, contrasena: contrasena });
  }

  // 🧾 Registro
  register(userData: any): Observable<any> {
    const payload = {
      usuario_id: userData.usuario_id, // puedes dejarlo así o manejarlo en backend
      nombre_completo: userData.nombre_completo,
      email: userData.email,
      contrasena: userData.contrasena,
      rol_id: this.mapRole(userData.rol_id),
      activo: true
    };
    return this.http.post(`${this.apiUrl}/usuarios`, payload);
  }

  // 🧩 Mapea el nombre del rol a un ID numérico (ajusta según tu BD)
  private mapRole(role: string): number {
    switch (role) {
      case 'Administrador': return 1;
      case 'Docente': return 2;
      case 'Bodega': return 3;
      default: return 0;
    }
  }

  getRoleFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.rol || null; // Devuelve el ID numérico del rol
    } catch (e) {
        return null;
    }
}
}
