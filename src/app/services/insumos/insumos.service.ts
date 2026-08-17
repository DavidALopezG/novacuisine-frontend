// src/app/services/insumos/insumos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InsumosService {
  private apiUrl = 'http://localhost:3000/api/insumos';

  constructor(private http: HttpClient) {}

  obtenerInsumos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  crearInsumo(insumo: { nombre_insumo: string; costo_unitario: number; unidad_medida: string }): Observable<any> {
    return this.http.post(this.apiUrl, insumo);
  }
}
