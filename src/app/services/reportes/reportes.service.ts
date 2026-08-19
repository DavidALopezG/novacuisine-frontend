import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../config/app.config.env';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private cobrosUrl = `${APP_CONFIG.apiUrl}/cobros`;

  constructor(private http: HttpClient) {}

  getResumenCompleto(): Observable<any> {
    return this.http.get<any>(`${this.cobrosUrl}/resumen`);
  }
}
