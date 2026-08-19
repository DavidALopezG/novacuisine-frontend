import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../config/app.config.env';

@Injectable({ providedIn: 'root' })
export class InsumosService {
  private apiUrl = `${APP_CONFIG.apiUrl}/insumos`;

  constructor(private http: HttpClient) {}

  obtenerInsumos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearInsumo(insumo: { nombre_insumo: string; costo_unitario: number; unidad_medida: string }): Observable<any> {
    return this.http.post(this.apiUrl, insumo);
  }
}
