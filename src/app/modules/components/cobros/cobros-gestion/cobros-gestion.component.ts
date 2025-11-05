// src/app/components/cobros/cobros-gestion/cobros-gestion.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CobrosService } from '../../../../services/cobros.service';
// RouterLink y RouterOutlet se importarán desde el Dashboard, pero se necesitan si este fuera standalone

// Interfaz para dar tipado a los datos de la tabla
interface Obligacion {
  obligacion_id: number;
  estudiante_id: number;
  fecha_vencimiento: Date;
  monto_total: number;
  monto_pagado: number;
  estado: string;
  fecha_pago: Date | null;
}

@Component({
  selector: 'app-cobros-gestion',
  standalone: true,
  imports: [
    CommonModule,
    // Aquí agregarías módulos de Angular Material si los usaras (ej: MatTableModule)
  ],
  templateUrl: './cobros-gestion.component.html',
  styleUrl: './cobros-gestion.component.css'
})
export class CobrosGestionComponent implements OnInit {

  obligaciones: Obligacion[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Propiedades para la Alerta de Deuda Crítica (HU-COB-02)
  deudaCritica: boolean = false;

  constructor(private cobrosService: CobrosService) {}

  ngOnInit(): void {
    this.cargarObligaciones();
  }

  /**
   * Carga las obligaciones desde el backend (ruta protegida por el Interceptor JWT).
   */
  cargarObligaciones(): void {
    this.loading = true;
    this.error = null;

    this.cobrosService.obtenerObligaciones().subscribe({
      next: (data: Obligacion[]) => {
        this.obligaciones = data;
        this.loading = false;
        
        // 🔑 Llamar a la lógica de alerta tras cargar los datos
        this.verificarDeudaCritica();
      },
      error: (err) => {
        console.error('Error al cargar obligaciones:', err);
        this.error = 'No se pudieron cargar las obligaciones. Acceso denegado o error de servidor.';
        this.loading = false;
      }
    });
  }
  
  /**
   * Lógica para la Alerta Visual de Deuda Crítica (HU-COB-02).
   * Determina si algún estudiante tiene 3 o más pagos vencidos.
   */
  verificarDeudaCritica(): void {
      const hoy = new Date();
      const deudaPorEstudiante: { [key: number]: number } = {};

      // 1. Contar obligaciones vencidas y pendientes por estudiante
      this.obligaciones.forEach(obligacion => {
          // Asume que 'Pendiente' o 'Parcial' son estados que cuentan como deuda
          if (obligacion.estado !== 'Pagado') {
              const vencimiento = new Date(obligacion.fecha_vencimiento);
              
              // Vencida: Si la fecha de vencimiento es anterior a hoy
              if (vencimiento < hoy) {
                  const id = obligacion.estudiante_id;
                  deudaPorEstudiante[id] = (deudaPorEstudiante[id] || 0) + 1;
              }
          }
      });
      
      // 2. Verificar si algún estudiante supera el umbral de 3+ deudas
      this.deudaCritica = Object.values(deudaPorEstudiante).some(count => count >= 3);
      
      // La lógica del HU-COB-02 se cumplirá aquí.
      if (this.deudaCritica) {
          console.warn('ALERTA: Se detectaron estudiantes con 3 o más pagos vencidos.');
      }
  }

  // Aquí irían los métodos para registrarPago(), editarObligacion(), etc.

  /**
   * Abre un modal o inicia el proceso para registrar un pago a una obligación.
   * Resuelve el error de la propiedad faltante.
   */
  registrarPagoModal(obligacion: Obligacion): void {
    console.log('Iniciando registro de pago para Obligación ID:', obligacion.obligacion_id);
    console.log('Monto pendiente:', obligacion.monto_total - obligacion.monto_pagado);
    
    // ⚠️ TODO: Aquí se implementará la lógica para:
    // 1. Mostrar un modal/formulario.
    // 2. Capturar el monto del pago.
    // 3. Llamar a this.cobrosService.registrarPago().
  }



  esVencida(obligacion: Obligacion): boolean {
    // 1. Si ya está pagada o no tiene fecha de vencimiento, no está vencida.
    if (obligacion.estado === 'Pagado' || !obligacion.fecha_vencimiento) {
      return false;
    }
    
    // 2. Convertir la fecha de vencimiento (puede venir como string de la BD)
    const vencimiento = new Date(obligacion.fecha_vencimiento);
    const hoy = new Date();
    
    // 3. Comparar solo la fecha (ignorar la hora)
    vencimiento.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    
    // Si la fecha de vencimiento es anterior a hoy, está vencida.
    return vencimiento < hoy;
} 
}