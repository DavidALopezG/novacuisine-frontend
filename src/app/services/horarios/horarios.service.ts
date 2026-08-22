// src/app/services/horarios/horarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private apiUrl = 'http://localhost:3000/api/horarios';

  constructor(private http: HttpClient) {}

  // 🎓 Estudiante: su propio horario real, según su titulación
  obtenerMiHorario(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mi-horario`);
  }

  // 👩‍🏫 Admin/Docente
  obtenerHorarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearHorario(horario: any): Observable<any> {
    return this.http.post(this.apiUrl, horario);
  }

  actualizarHorario(id: number, horario: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, horario);
  }

  eliminarHorario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // 👥 Matrícula de estudiantes por grupo/horario
  obtenerEstudiantesDeHorario(horarioId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${horarioId}/estudiantes`);
  }

  matricularEstudiante(horarioId: number, estudianteId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${horarioId}/estudiantes`, { estudiante_id: estudianteId });
  }

  retirarEstudiante(horarioId: number, estudianteId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${horarioId}/estudiantes/${estudianteId}`);
  }
}
