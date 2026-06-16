import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ para ngModel
import { CobrosService } from '../../../../services/cobros.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './cobros-gestion.component.html',
  styleUrl: './cobros-gestion.component.css'
})
export class CobrosGestionComponent implements OnInit {
  obligaciones: Obligacion[] = [];
  loading = true;
  error: string | null = null;
  deudaCritica = false;

  // 🔹 Variables para los modales
  mostrarModalPago = false;
  mostrarModalObligacion = false;
  obligacionSeleccionada: Obligacion | null = null;
  montoPago = 0;

  nuevaObligacion = {
    estudiante_id: 0,
    monto_total: 0,
    fecha_vencimiento: ''
  };

  constructor(private cobrosService: CobrosService) {}

  ngOnInit(): void {
    this.cargarObligaciones();
  }

  cargarObligaciones(): void {
    this.loading = true;
    this.error = null;

    this.cobrosService.obtenerObligaciones().subscribe({
      next: (data: Obligacion[]) => {
        this.obligaciones = data;
        this.loading = false;
        this.verificarDeudaCritica();
      },
      error: (err) => {
        console.error('Error al cargar obligaciones:', err);
        this.error = 'No se pudieron cargar las obligaciones.';
        this.loading = false;
      }
    });
  }

  verificarDeudaCritica(): void {
    const hoy = new Date();
    const deudaPorEstudiante: { [key: number]: number } = {};

    this.obligaciones.forEach((o) => {
      if (o.estado !== 'Pagado') {
        const venc = new Date(o.fecha_vencimiento);
        if (venc < hoy) deudaPorEstudiante[o.estudiante_id] = (deudaPorEstudiante[o.estudiante_id] || 0) + 1;
      }
    });

    this.deudaCritica = Object.values(deudaPorEstudiante).some((count) => count >= 3);
  }

  abrirModalPago(obligacion: Obligacion): void {
    this.obligacionSeleccionada = obligacion;
    this.montoPago = 0;
    this.mostrarModalPago = true;
  }

  abrirModalNuevaObligacion(): void {
    this.mostrarModalObligacion = true;
  }

  cerrarModal(): void {
    this.mostrarModalPago = false;
    this.mostrarModalObligacion = false;
    this.obligacionSeleccionada = null;
  }

  confirmarPago(): void {
    if (!this.obligacionSeleccionada) return;

    if (this.montoPago <= 0) {
      alert('Monto inválido.');
      return;
    }

    const pagoData = {
      obligacion_id: this.obligacionSeleccionada.obligacion_id,
      monto_pago: this.montoPago
    };

    this.cobrosService.registrarPago(pagoData).subscribe({
      next: () => {
        alert('💵 Pago registrado correctamente');
        this.cerrarModal();
        this.cargarObligaciones();
      },
      error: (err) => {
        console.error('Error al registrar pago:', err);
        alert('❌ Error al registrar el pago.');
      }
    });
  }

  crearObligacion(): void {
    const data = {
      estudiante_id: this.nuevaObligacion.estudiante_id,
      monto_total: this.nuevaObligacion.monto_total,
      fecha_vencimiento: this.nuevaObligacion.fecha_vencimiento
    };

    this.cobrosService.crearObligacion(data).subscribe({
      next: () => {
        alert('✅ Obligación creada correctamente');
        this.cerrarModal();
        this.cargarObligaciones();
      },
      error: (err) => {
        console.error('Error al crear obligación:', err);
        alert('❌ Error al crear la obligación.');
      }
    });
  }

  esVencida(o: Obligacion): boolean {
    if (o.estado === 'Pagado') return false;
    const venc = new Date(o.fecha_vencimiento);
    const hoy = new Date();
    venc.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    return venc < hoy;
  }
}
