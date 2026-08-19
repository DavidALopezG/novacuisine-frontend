import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../config/app.config.env';

@Injectable({ providedIn: 'root' })
export class AsignaturasService {
  private apiUrl = `${APP_CONFIG.apiUrl}/asignaturas`;

  constructor(private http: HttpClient) {}

  obtenerAsignaturas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearAsignatura(asignatura: any): Observable<any> {
    return this.http.post(this.apiUrl, asignatura);
  }
}
