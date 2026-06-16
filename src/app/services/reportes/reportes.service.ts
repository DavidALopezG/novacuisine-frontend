import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private url = 'http://localhost:3000/api/reportes';

  constructor(private http: HttpClient) { }

  // Simulación de datos hasta que tengas el Backend
  getResumenFinanciero(): Observable<any> {
    return of({
      totalRecaudado: 12500.50,
      totalPendiente: 3420.00,
      estudiantesMorosos: 12,
      efectividadCobro: 78
    });
  }

  getReportePagosRecientes(): Observable<any[]> {
    return of([
      { fecha: '2024-05-01', monto: 150, estudiante: 'Andrés López', concepto: 'Pensión Mayo' },
      { fecha: '2024-05-02', monto: 45, estudiante: 'María Garcia', concepto: 'Taller Pastelería' },
      { fecha: '2024-05-02', monto: 150, estudiante: 'Juan Pérez', concepto: 'Pensión Mayo' }
    ]);
  }
}