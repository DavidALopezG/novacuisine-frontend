import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CobrosService } from '../../../../services/cobros/cobros.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-estado-cuenta-estudiante',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    SpinnerComponent,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    ToolbarModule,
    MessageModule,
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
    { banco: 'Banco Pichincha', detalles: 'Cta. Corriente #123456789 - Nova Cuisine S.A.' },
    { banco: 'Transferencia / Depósito', detalles: 'Reportar pago con comprobante al administrador.' }
  ];

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

  reportarPago(): void {
    this.notif.info('Para reportar tu pago, comunícate con la administración del instituto y presenta tu comprobante.');
  }

  descargarEstadoCuenta(): void {
    window.print();
  }
}
