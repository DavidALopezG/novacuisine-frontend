import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../config/app.config.env';

export interface FiltrosReporte {
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  titulacion_id?: number | null;
  estado?: string | null;
  busqueda?: string | null;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private apiUrl = `${APP_CONFIG.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  private construirParams(filtros: FiltrosReporte): HttpParams {
    let params = new HttpParams();
    if (filtros.fecha_inicio) params = params.set('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params = params.set('fecha_fin', filtros.fecha_fin);
    if (filtros.titulacion_id) params = params.set('titulacion_id', String(filtros.titulacion_id));
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.busqueda) params = params.set('busqueda', filtros.busqueda);
    if (filtros.page) params = params.set('page', String(filtros.page));
    if (filtros.limit) params = params.set('limit', String(filtros.limit));
    return params;
  }

  getResumen(filtros: FiltrosReporte): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/resumen`, { params: this.construirParams(filtros) });
  }

  getSerieMensual(filtros: FiltrosReporte): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/serie-mensual`, { params: this.construirParams(filtros) });
  }

  getPorTitulacion(filtros: FiltrosReporte): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/por-titulacion`, { params: this.construirParams(filtros) });
  }

  getPorEstado(filtros: FiltrosReporte): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/por-estado`, { params: this.construirParams(filtros) });
  }

  getObligaciones(filtros: FiltrosReporte): Observable<{ data: any[]; total: number; page: number; totalPaginas: number }> {
    return this.http.get<any>(`${this.apiUrl}/obligaciones`, { params: this.construirParams(filtros) });
  }

  // Excel/PDF se generan 100% en el backend; aquí solo se pide el archivo como blob
  // (usando HttpClient para que el interceptor de JWT viaje en la petición,
  // cosa que no pasaría con una navegación normal tipo window.open).
  exportarExcel(filtros: FiltrosReporte): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar/excel`, { params: this.construirParams(filtros), responseType: 'blob' });
  }

  exportarPdf(filtros: FiltrosReporte): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/exportar/pdf`, { params: this.construirParams(filtros), responseType: 'blob' });
  }
}
