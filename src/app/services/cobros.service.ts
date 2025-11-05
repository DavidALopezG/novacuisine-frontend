// src/app/services/cobros.service.ts (Asegúrate de que este archivo esté guardado)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CobrosService {
  private apiUrl = 'http://localhost:3000/api/cobros';

  constructor(private http: HttpClient) { }

  // 🔑 NECESARIO: Definición correcta del método GET
  obtenerObligaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/obligaciones`);
  }
  
  // ... otros métodos (crearObligacion, registrarPago)
}