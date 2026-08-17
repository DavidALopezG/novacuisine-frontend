// src/app/services/titulaciones/titulaciones.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TitulacionesService {
  private apiUrl = 'http://localhost:3000/api/titulaciones';

  constructor(private http: HttpClient) {}

  obtenerTitulaciones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearTitulacion(titulacion: { nombre_titulacion: string }): Observable<any> {
    return this.http.post(this.apiUrl, titulacion);
  }

  actualizarTitulacion(id: number, titulacion: { nombre_titulacion: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, titulacion);
  }

  eliminarTitulacion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
