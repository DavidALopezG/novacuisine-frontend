import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { CobrosService } from '../../../../services/cobros/cobros.service';

@Component({
  selector: 'app-estado-cuenta-estudiante',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './estado-cuenta-estudiante.component.html',
  styleUrl: './estado-cuenta-estudiante.component.css'
})
export class EstadoCuentaEstudianteComponent implements OnInit {

  loading = true;
  error: string | null = null;

  // Resumen financiero, calculado a partir de las obligaciones reales
  resumen = {
    totalPagado: 0,
    saldoPendiente: 0,
    proximoVencimiento: null as Date | null,
    estadoGeneral: 'Al día'
  };

  // Listado real de obligaciones (proviene de VISTA_ESTADO_COBROS)
  historialPagos: any[] = [];

  // Información institucional para realizar transferencias (no depende de la BD)
  metodosDisponibles = [
    { banco: 'Banco Pichincha', detalles: 'Cta. Corriente #123456789 - Nova Cuisine S.A.' },
    { banco: 'PayPal / Tarjeta', detalles: 'pagos@novacuisine.edu.ec (Link de pago directo)' }
  ];

  constructor(private cobrosService: CobrosService) { }

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
    const totalPagado = obligaciones.reduce((acc, o) => acc + Number(o.monto_pagado), 0);
    const saldoPendiente = obligaciones.reduce((acc, o) => acc + Number(o.saldo_pendiente), 0);

    const pendientesOVencidas = obligaciones.filter(o => o.estado_calculado !== 'PAGADO');
    const proximaFecha = pendientesOVencidas.length > 0
      ? pendientesOVencidas
          .map(o => new Date(o.fecha_vencimiento))
          .sort((a, b) => a.getTime() - b.getTime())[0]
      : null;

    let estadoGeneral = 'Al día';
    if (obligaciones.some(o => o.estado_calculado === 'VENCIDO')) {
      estadoGeneral = 'Vencido';
    } else if (obligaciones.some(o => o.estado_calculado === 'PENDIENTE')) {
      estadoGeneral = 'Pendiente';
    }

    this.resumen = {
      totalPagado,
      saldoPendiente,
      proximoVencimiento: proximaFecha,
      estadoGeneral
    };
  }

  /**
   * Acción para simular el reporte de un pago realizado
   */
  reportarPago(): void {
    const confirmacion = confirm('¿Desea adjuntar un comprobante de pago ahora?');
    if (confirmacion) {
      alert('Funcionalidad de carga de archivos disponible próximamente.');
    } else {
      alert('Por favor, conserve su comprobante físico para cualquier reclamo.');
    }
  }

  /**
   * Genera un reporte en PDF de los movimientos (simulado con la función de impresión)
   */
  descargarEstadoCuenta(): void {
    window.print();
  }
}
