import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-estado-cuenta-estudiante',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './estado-cuenta-estudiante.component.html',
  styleUrl: './estado-cuenta-estudiante.component.css'
})
export class EstadoCuentaEstudianteComponent implements OnInit {

  // Resumen financiero del estudiante
  resumen = {
  
    totalPagado: 580.00,
    saldoPendiente: 210.50,
    proximoVencimiento: new Date(2024, 5, 15),
    estadoGeneral: 'Pendiente'
  };

  // Listado detallado de movimientos
  historialPagos = [
    { concepto: 'Matrícula Semestral', monto: 200.00, estado: 'Pagado', fecha: '2024-01-10' },
    { concepto: 'Mensualidad Febrero', monto: 190.00, estado: 'Pagado', fecha: '2024-02-05' },
    { concepto: 'Mensualidad Marzo', monto: 190.00, estado: 'Pagado', fecha: '2024-03-05' },
    { concepto: 'Taller de Panadería Artesanal', monto: 85.50, estado: 'Pendiente', fecha: '2024-05-15' },
    { concepto: 'Mensualidad Abril', monto: 125.00, estado: 'Pendiente', fecha: '2024-04-10' }
  ];

  // Información para realizar transferencias
  metodosDisponibles = [
    { banco: 'Banco Pichincha', detalles: 'Cta. Corriente #123456789 - Nova Cuisine S.A.' },
    { banco: 'PayPal / Tarjeta', detalles: 'pagos@novacuisine.edu.ec (Link de pago directo)' }
  ];

  constructor() { }

  ngOnInit(): void {
    // Aquí se llamaría al servicio de estudiantes para obtener datos reales en el futuro
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