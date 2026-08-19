// src/app/services/horarios/horarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private apiUrl = 'http://localhost:3000/api/horarios';

  constructor(private http: HttpClient) {}

  obtenerMiHorario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mi-horario`);
  }

  obtenerHorarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerMisGrupos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-grupos`);
  }

  obtenerEstudiantesDeGrupo(asignaturaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-grupos/${asignaturaId}/estudiantes`);
  }

  crearHorario(horario: any): Observable<any> {
    return this.http.post(this.apiUrl, horario);
  }

  eliminarHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
