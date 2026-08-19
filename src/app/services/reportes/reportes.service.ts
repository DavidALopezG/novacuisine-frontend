// src/app/services/reportes/reportes.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private cobrosUrl = 'http://localhost:3000/api/cobros';

  constructor(private http: HttpClient) {}

  getResumenCompleto(): Observable<any> {
    return this.http.get<any>(`${this.cobrosUrl}/resumen`);
  }
}
