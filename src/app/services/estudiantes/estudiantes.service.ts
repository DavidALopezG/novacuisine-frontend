import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EstudiantesService {
  private url = 'http://localhost:3000/api/estudiantes';

  constructor(private http: HttpClient) {}

  getEstudiantes(): Observable<any[]> {
    return this.http.get<any[]>(this.url);
  }

  // 🎓 Perfil real del estudiante autenticado (Mi Perfil)
  getMiPerfil(): Observable<any> {
    return this.http.get<any>(`${this.url}/perfil/me`);
  }

  // Obtener recetas y saldos de un estudiante específico
  getPerfilCompleto(id: number): Observable<any> {
    return this.http.get<any>(`${this.url}/${id}/detalle`);
  }

  // Método para la tabla intermediaria
  asignarReceta(estudianteId: number, recetaId: number): Observable<any> {
    return this.http.post(`${this.url}/asignar-receta`, { 
      estudiante_id: estudianteId, 
      receta_id: recetaId 
    });
  }

  createEstudiante(data: any): Observable<any> {
    return this.http.post(this.url, data);
  }
}