import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../../../services/cobros/cobros.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-estado-cuenta-estudiante',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    SpinnerComponent,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    ToolbarModule,
    MessageModule,
    DialogModule,
    InputNumberModule,
    TooltipModule,
  ],
  templateUrl: './estado-cuenta-estudiante.component.html',
  styleUrl: './estado-cuenta-estudiante.component.css'
})
export class EstadoCuentaEstudianteComponent implements OnInit {

  loading = true;
  error: string | null = null;

  resumen = {
    totalPagado: 0,
    saldoPendiente: 0,
    proximoVencimiento: null as Date | null,
    estadoGeneral: 'Al día'
  };

  historialPagos: any[] = [];

  metodosDisponibles = [
    { banco: 'Banco Guayaquil', detalles: 'Cta. Ahorros #39060111' },
    { banco: 'Cooperativa Riobamba Ltda.', detalles: 'Cta. Ahorros #412110150470' },
    { banco: 'Deuna - Banco Pichincha', detalles: 'Cta. Ahorros #7701601501' }
  ];

  // ── Modal subir comprobante ────────────────────────────────
  mostrarModalComprobante = false;
  obligacionSeleccionada: any = null;
  archivoComprobante: File | null = null;
  montoDeclarado: number | null = null;
  subiendoComprobante = false;

  constructor(private cobrosService: CobrosService, private notif: NotificacionService) {}

  ngOnInit(): void {
    this.cargarEstadoCuenta();
  }

  cargarEstadoCuenta(): void {
    this.loading = true;
    this.error = null;

    this.cobrosService.obtenerMisObligaciones().subscribe({
      next: (obligaciones) => {
        this.historialPagos = obligaciones;
        this.calcularResumen(obligaciones);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el estado de cuenta:', err);
        this.error = 'No se pudo cargar tu estado de cuenta.';
        this.loading = false;
      }
    });
  }

  private calcularResumen(obligaciones: any[]): void {
    const totalPagado    = obligaciones.reduce((acc, o) => acc + Number(o.monto_pagado   ?? 0), 0);
    const saldoPendiente = obligaciones.reduce((acc, o) => acc + Number(o.saldo_pendiente ?? 0), 0);

    // FIX: el backend devuelve el campo "estado" (no "estado_calculado")
    // Calculamos aquí el estado real comparando fechas y montos
    const pendientes = obligaciones.filter(o => this.estadoReal(o) !== 'PAGADO');

    const proximaFecha = pendientes.length > 0
      ? pendientes
          .map(o => new Date(o.fecha_vencimiento))
          .sort((a, b) => a.getTime() - b.getTime())[0]
      : null;

    const hayVencidos   = obligaciones.some(o => this.estadoReal(o) === 'VENCIDO');
    const hayPendientes = obligaciones.some(o => this.estadoReal(o) === 'PENDIENTE');

    this.resumen = {
      totalPagado,
      saldoPendiente,
      proximoVencimiento: proximaFecha,
      estadoGeneral: hayVencidos ? 'Vencido' : hayPendientes ? 'Pendiente' : 'Al día'
    };
  }

  // Calcula el estado real de una obligación basándose en los datos del backend
  estadoReal(o: any): string {
    const estado = (o.estado || '').toUpperCase();
    if (estado === 'PAGADO') return 'PAGADO';
    if (new Date(o.fecha_vencimiento) < new Date()) return 'VENCIDO';
    if (Number(o.monto_pagado) > 0) return 'PARCIAL';
    return 'PENDIENTE';
  }

  estadoSeverity(o: any): 'success' | 'warn' | 'danger' | 'info' {
    switch (this.estadoReal(o)) {
      case 'PAGADO': return 'success';
      case 'PARCIAL': return 'warn';
      case 'VENCIDO': return 'danger';
      default: return 'info';
    }
  }

  // ── Comprobante de pago ─────────────────────────────────────

  puedeSubirComprobante(o: any): boolean {
    return this.estadoReal(o) !== 'PAGADO' && o.comprobante_estado !== 'PENDIENTE';
  }

  abrirModalComprobante(obligacion: any): void {
    this.obligacionSeleccionada = obligacion;
    this.archivoComprobante = null;
    this.montoDeclarado = Number(obligacion.saldo_pendiente) || null;
    this.mostrarModalComprobante = true;
  }

  cerrarModalComprobante(): void {
    this.mostrarModalComprobante = false;
    this.obligacionSeleccionada = null;
    this.archivoComprobante = null;
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoComprobante = input.files[0];
    }
  }

  enviarComprobante(): void {
    if (!this.archivoComprobante) {
      this.notif.advertencia('Selecciona el archivo del comprobante (imagen o PDF).');
      return;
    }
    if (!this.montoDeclarado || this.montoDeclarado <= 0) {
      this.notif.advertencia('Ingresa el monto que pagaste.');
      return;
    }

    this.subiendoComprobante = true;
    this.cobrosService.subirComprobante(
      this.obligacionSeleccionada.obligacion_id,
      this.archivoComprobante,
      this.montoDeclarado
    ).subscribe({
      next: () => {
        this.notif.exito('Comprobante enviado. Un administrador lo revisará antes de aplicarlo como pago.');
        this.subiendoComprobante = false;
        this.cerrarModalComprobante();
        this.cargarEstadoCuenta();
      },
      error: (err) => {
        console.error('Error al subir comprobante:', err);
        this.notif.error(err?.error?.error || 'No se pudo subir el comprobante.');
        this.subiendoComprobante = false;
      }
    });
  }

  descargarEstadoCuenta(): void {
    window.print();
  }
}
