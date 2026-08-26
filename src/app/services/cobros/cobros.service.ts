import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APP_CONFIG } from '../../config/app.config.env';

@Injectable({
  providedIn: 'root'
})
export class CobrosService {
  private apiUrl = `${APP_CONFIG.apiUrl}/cobros`;

  constructor(private http: HttpClient) { }

  // 🔑 NECESARIO: Definición correcta del método GET
  obtenerObligaciones(): Observable<any> {
    return this.http.get(`${this.apiUrl}/obligaciones`);
  }

  
  crearObligacion(obligacion: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/obligaciones`, obligacion);
  }

  registrarPago(pagoData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/pagar`, pagoData);
  }

  // 📥 Importación masiva de obligaciones desde un archivo Excel
  importarObligacionesExcel(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(`${this.apiUrl}/obligaciones/importar-excel`, formData);
  }

  // 🎓 Estado de cuenta real del estudiante autenticado
  obtenerMisObligaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mis-obligaciones`);
  }

  // 📤 Estudiante sube el comprobante de su pago (transferencia/Deuna)
  subirComprobante(obligacionId: number, archivo: File, montoDeclarado: number): Observable<any> {
    const formData = new FormData();
    formData.append('comprobante', archivo);
    formData.append('monto_declarado', String(montoDeclarado));
    return this.http.post(`${this.apiUrl}/obligaciones/${obligacionId}/comprobante`, formData);
  }

  // ✅ Admin aprueba el comprobante (aplica el pago)
  aprobarComprobante(obligacionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/obligaciones/${obligacionId}/comprobante/aprobar`, {});
  }

  // ❌ Admin rechaza el comprobante
  rechazarComprobante(obligacionId: number, observacion?: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/obligaciones/${obligacionId}/comprobante/rechazar`, { observacion });
  }

  // ... otros métodos (crearObligacion, registrarPago)
}