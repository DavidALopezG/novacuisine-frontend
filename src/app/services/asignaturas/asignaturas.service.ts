// src/app/services/asignaturas/asignaturas.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AsignaturasService {
  private apiUrl = 'http://localhost:3000/api/asignaturas';

  constructor(private http: HttpClient) {}

  obtenerAsignaturas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearAsignatura(asignatura: any): Observable<any> {
    return this.http.post(this.apiUrl, asignatura);
  }
}
