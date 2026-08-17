// src/app/services/recetas/recetas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecetasService {
  private apiUrl = 'http://localhost:3000/api/recetas';

  constructor(private http: HttpClient) {}

  // Recetario maestro (Docente/Admin)
  obtenerRecetas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerRecetaPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crearReceta(receta: any): Observable<any> {
    return this.http.post(this.apiUrl, receta);
  }

  actualizarReceta(id: number, receta: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, receta);
  }

  eliminarReceta(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Versionado
  crearVersion(id: number, version: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/versiones`, version);
  }

  aprobarVersion(versionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/versiones/${versionId}/aprobar`, {});
  }

  // Asignación a estudiantes
  asignarReceta(id: number, estudianteId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/asignar`, { estudiante_id: estudianteId });
  }

  // Vista Estudiante
  misRecetas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-recetas`);
  }
}
