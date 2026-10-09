import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../../../services/cobros/cobros.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';
import { TitulacionesService } from '../../../../services/titulaciones/titulaciones.service';
import { APP_CONFIG } from '../../../../config/app.config.env';
import { PlanPagosDialogComponent } from '../plan-pagos-dialog/plan-pagos-dialog.component';
import { EstadoCuentaDialogComponent } from '../estado-cuenta-dialog/estado-cuenta-dialog.component';
import { ConfigMoraDialogComponent } from '../config-mora-dialog/config-mora-dialog.component';

// Módulos PrimeNG
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

interface Obligacion {
  nombre?: string;
  apellido?: string;
  codigo_estudiante?: string;
  obligacion_id: number;
  estudiante_id: number;
  fecha_vencimiento: Date;
  monto_total: number;
  monto_pagado: number;
  concepto?: string | null;
  numero_cuota?: number | null;
  plan_nombre?: string | null;
  plan_total_cuotas?: number;
  monto_base?: number;
  recargo_acumulado?: number;
  estado: string;
  fecha_pago: Date | null;
  comprobante_ruta?: string | null;
  comprobante_monto_declarado?: number | null;
  comprobante_estado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | null;
  comprobante_fecha_subida?: Date | null;
  comprobante_observacion?: string | null;
}

@Component({
  selector: 'app-cobros-gestion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    TableModule,
    TagModule,
    ButtonModule,
    DialogModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    MessageModule,
    TooltipModule,
    PlanPagosDialogComponent,
    EstadoCuentaDialogComponent,
    ConfigMoraDialogComponent
  ],
  templateUrl: './cobros-gestion.component.html',
  styleUrl: './cobros-gestion.component.css'
})
export class CobrosGestionComponent implements OnInit {
  obligaciones: Obligacion[] = [];
  estudiantes: any[] = [];
  
  filtroTexto = '';
  filtroEstado = '';
  loading = true;
  error: string | null = null;
  deudaCritica = false;

  // Opciones para desplegables
  estadoOptions = [
    { label: 'Todos los estados', value: '' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Parcial', value: 'PARCIAL' },
    { label: 'Pagado', value: 'PAGADO' },
    { label: 'Vencido', value: 'VENCIDO' }
  ];

  estudianteOptions: { label: string; value: number }[] = [];
  titulaciones: any[] = [];
  resumen: any = null;

  // Nuevos diálogos (plan de pagos, estado de cuenta, configuración de mora)
  mostrarPlan = false;
  mostrarEstadoCuenta = false;
  mostrarConfigMora = false;
  estudianteEstadoCuenta: number | string | null = null;
  estudiantePlanInicial: number | string | null = null;
  notificandoMasivo = false;

  // Visibilidad de modales
  mostrarModalPago = false;
  mostrarModalObligacion = false;
  mostrarModalImportar = false;

  obligacionSeleccionada: Obligacion | null = null;
  montoPago = 0;
  procesandoPago = false;

  get saldoSeleccionado(): number {
    const o = this.obligacionSeleccionada;
    return o ? Math.round((Number(o.monto_total) - Number(o.monto_pagado)) * 100) / 100 : 0;
  }

  get errorMontoPago(): string | null {
    const m = Number(this.montoPago);
    if (this.montoPago === null || this.montoPago === undefined || !Number.isFinite(m) || m <= 0) {
      return 'Ingresa un monto mayor a 0.';
    }
    if (m > this.saldoSeleccionado) {
      return `El monto excede el saldo pendiente ($${this.saldoSeleccionado.toFixed(2)}).`;
    }
    return null;
  }

  creandoObligacion = false;

  nuevaObligacion = {
    estudiante_id: 0,
    monto_total: 0,
    fecha_vencimiento: ''
  };

  // Importación Excel
  archivoSeleccionado: File | null = null;
  importando = false;
  resumenImportacion: { message: string; total_filas: number; insertadas: any[]; errores: any[] } | null = null;

  constructor(
    private cobrosService: CobrosService,
    private estudiantesService: EstudiantesService,
    private titulacionesService: TitulacionesService,
    private notif: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarObligaciones();
    this.cargarEstudiantes();
    this.cargarResumen();
    this.titulacionesService.obtenerTitulaciones().subscribe({
      next: (t) => (this.titulaciones = t),
      error: () => {}
    });
  }

  cargarResumen(): void {
    this.cobrosService.obtenerResumen().subscribe({
      next: (r) => (this.resumen = r?.resumen ?? null),
      error: () => (this.resumen = null)
    });
  }

  /** Refresca tabla e indicadores tras cualquier cambio hecho desde los diálogos. */
  refrescarTodo(): void {
    this.cargarObligaciones();
    this.cargarResumen();
    this.cargarEstudiantes();
  }

  abrirPlan(estudianteId: number | string | null = null): void {
    this.estudiantePlanInicial = estudianteId;
    this.mostrarPlan = true;
  }

  abrirEstadoCuenta(o: Obligacion): void {
    this.estudianteEstadoCuenta = o.estudiante_id;
    this.mostrarEstadoCuenta = true;
  }

  enviarCorreo(o: Obligacion, forzar = false): void {
    this.cobrosService.enviarRecordatorio(o.estudiante_id, forzar).subscribe({
      next: (res) => this.notif.exito(res?.message || 'Recordatorio enviado.'),
      error: (err) => {
        if (err?.error?.tipo === 'RECIENTE' && window.confirm(`${err.error.error}\n¿Enviarlo de nuevo de todos modos?`)) {
          this.enviarCorreo(o, true);
          return;
        }
        this.notif.error(err?.error?.error || 'No se pudo enviar el correo.');
      }
    });
  }

  notificarMorosos(): void {
    if (this.notificandoMasivo) return;
    if (!window.confirm('Se enviará un recordatorio por correo a todos los estudiantes con cuotas vencidas (máximo uno cada 24 h por estudiante). ¿Continuar?')) return;
    this.notificandoMasivo = true;
    this.cobrosService.enviarRecordatorioMasivo().subscribe({
      next: (r) => {
        this.notificandoMasivo = false;
        const enviados = (r.enviados || 0) + (r.simulados || 0);
        this.notif.exito(
          `Correos: ${enviados}${r.simulados ? ' (simulados)' : ''} enviados · ${r.omitidos_recientes} ya avisados hoy · ${r.sin_email} sin correo · ${r.errores} con error.`
        );
      },
      error: (err) => {
        this.notificandoMasivo = false;
        this.notif.error(err?.error?.error || 'No se pudo completar el envío masivo.');
      }
    });
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
        this.error = 'No se pudieron cargar los cobros u obligaciones.';
        this.loading = false;
      }
    });
  }

  cargarEstudiantes(): void {
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data: any[]) => {
        this.estudiantes = data;
        this.estudianteOptions = data.map(e => ({
          label: `${e.apellido} ${e.nombre} (${e.codigo_estudiante || 'Sin Cód.'})${e.cedula ? ' · CI ' + e.cedula : ''}`,
          value: e.estudiante_id
        }));
      },
      error: (err: any) => console.error('Error al cargar estudiantes:', err)
    });
  }

  verificarDeudaCritica(): void {
    const conteoVencidasPorEstudiante: { [id: number]: number } = {};
    for (const o of this.obligaciones) {
      if (this.esVencida(o)) {
        conteoVencidasPorEstudiante[o.estudiante_id] = (conteoVencidasPorEstudiante[o.estudiante_id] || 0) + 1;
      }
    }
    this.deudaCritica = Object.values(conteoVencidasPorEstudiante).some(cant => cant >= 3);
  }

  esVencida(o: Obligacion): boolean {
    if (o.estado?.toUpperCase() === 'PAGADO') return false;
    const venc = new Date(o.fecha_vencimiento);
    const hoy = new Date();
    venc.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    return venc < hoy;
  }

  get obligacionesFiltradas(): Obligacion[] {
    return this.obligaciones.filter(o => {
      const matchTexto = !this.filtroTexto || 
        `${o.nombre} ${o.apellido} ${o.codigo_estudiante}`.toLowerCase().includes(this.filtroTexto.toLowerCase());
      
      let matchEstado = true;
      if (this.filtroEstado) {
        if (this.filtroEstado === 'VENCIDO') {
          matchEstado = this.esVencida(o);
        } else {
          matchEstado = o.estado?.toUpperCase() === this.filtroEstado;
        }
      }
      return matchTexto && matchEstado;
    });
  }

  estadoSeverity(estado: string, o: Obligacion): 'success' | 'warn' | 'danger' | 'secondary' | 'info' {
    if (this.esVencida(o)) return 'danger';
    switch (estado?.toUpperCase()) {
      case 'PAGADO': return 'success';
      case 'PARCIAL': return 'warn';
      case 'PENDIENTE': return 'info';
      default: return 'secondary';
    }
  }

  // --- Modales ---
  abrirModalPago(o: Obligacion): void {
    this.obligacionSeleccionada = o;
    this.montoPago = o.monto_total - o.monto_pagado;
    this.mostrarModalPago = true;
  }
confirmarPago(): void {
  if (!this.obligacionSeleccionada || this.procesandoPago) return;

  const saldo = Math.round((this.obligacionSeleccionada.monto_total - this.obligacionSeleccionada.monto_pagado) * 100) / 100;
  const monto = Number(this.montoPago);

  if (!Number.isFinite(monto) || monto <= 0) {
    this.notif.advertencia('Ingresa un monto válido mayor a 0.');
    return;
  }
  if (Math.round(monto * 100) / 100 !== monto) {
    this.notif.advertencia('El monto admite máximo 2 decimales.');
    return;
  }
  if (monto > saldo) {
    this.notif.advertencia(`El monto ($${monto.toFixed(2)}) excede el saldo pendiente ($${saldo.toFixed(2)}).`);
    return;
  }

  const pagoData = {
    obligacion_id: this.obligacionSeleccionada.obligacion_id,
    monto_pago: monto
  };

  this.procesandoPago = true;
  this.cobrosService.registrarPago(pagoData).subscribe({
    next: () => {
      this.procesandoPago = false;
      this.notif.exito('Pago registrado correctamente.');
      this.cerrarModal();
      this.cargarObligaciones();
      this.cargarEstudiantes();
    },
    error: (err) => {
      this.procesandoPago = false;
      console.error('Error al registrar pago:', err);
      this.notif.error(err?.error?.error || 'Error al registrar el pago.');
    }
  });
}
  abrirModalNuevaObligacion(): void {
    this.nuevaObligacion = { estudiante_id: 0, monto_total: 0, fecha_vencimiento: '' };
    this.mostrarModalObligacion = true;
  }

  crearObligacion(): void {
    if (this.creandoObligacion) return;

    if (!this.nuevaObligacion.estudiante_id || !this.nuevaObligacion.monto_total || !this.nuevaObligacion.fecha_vencimiento) {
      this.notif.advertencia('Completa todos los campos obligatorios.');
      return;
    }
    if (this.nuevaObligacion.monto_total <= 0) {
      this.notif.advertencia('El monto debe ser mayor a 0.');
      return;
    }
    if (this.nuevaObligacion.monto_total > 10000) {
      this.notif.advertencia('El monto de una obligación no puede superar $10.000. Verifica el valor ingresado.');
      return;
    }
    const hoy = new Date().toISOString().slice(0, 10);
    if (this.nuevaObligacion.fecha_vencimiento < hoy) {
      this.notif.advertencia('La fecha de vencimiento no puede ser anterior a hoy.');
      return;
    }

    this.creandoObligacion = true;
    this.cobrosService.crearObligacion(this.nuevaObligacion).subscribe({
      next: () => {
        this.creandoObligacion = false;
        this.notif.exito('Obligación creada correctamente');
        this.cerrarModal();
        this.cargarObligaciones();
      },
      error: (err) => {
        this.creandoObligacion = false;
        console.error('Error al crear obligación:', err);
        this.notif.error(err?.error?.error || 'Error al crear la obligación.');
      }
    });
  }

  abrirModalImportar(): void {
    this.archivoSeleccionado = null;
    this.resumenImportacion = null;
    this.mostrarModalImportar = true;
  }

  onArchivoSeleccionado(event: any): void {
    const file = event.target.files[0];
    if (file) this.archivoSeleccionado = file;
  }

  importarExcel(): void {
    if (!this.archivoSeleccionado) {
      this.notif.advertencia('Selecciona un archivo Excel primero.');
      return;
    }
    this.importando = true;
    this.cobrosService.importarObligacionesExcel(this.archivoSeleccionado).subscribe({
      next: (res) => {
        this.importando = false;
        this.resumenImportacion = res;
        this.notif.exito('Importación procesada');
        this.cargarObligaciones();
      },
      error: (err) => {
        this.importando = false;
        console.error('Error al importar Excel:', err);
        this.notif.error(err?.error?.error || 'Error al procesar el archivo Excel.');
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModalPago = false;
    this.mostrarModalObligacion = false;
    this.mostrarModalImportar = false;
    this.obligacionSeleccionada = null;
  }

  // ── Comprobantes de pago subidos por el estudiante ─────────

  /** URL absoluta del archivo del comprobante (el backend lo sirve como estático fuera de /api). */
  urlComprobante(o: Obligacion): string {
    if (!o.comprobante_ruta) return '';
    const raiz = APP_CONFIG.apiUrl.replace(/\/api\/?$/, '');
    return `${raiz}${o.comprobante_ruta}`;
  }

  aprobarComprobante(o: Obligacion): void {
    this.cobrosService.aprobarComprobante(o.obligacion_id).subscribe({
      next: (res) => {
        this.notif.exito(res?.message || 'Comprobante aprobado y pago aplicado.');
        this.cargarObligaciones();
        this.cargarEstudiantes();
      },
      error: (err) => {
        console.error('Error al aprobar comprobante:', err);
        this.notif.error(err?.error?.error || 'No se pudo aprobar el comprobante.');
      }
    });
  }

  rechazarComprobante(o: Obligacion): void {
    const observacion = window.prompt('Motivo del rechazo (opcional):') || undefined;
    this.cobrosService.rechazarComprobante(o.obligacion_id, observacion).subscribe({
      next: () => {
        this.notif.exito('Comprobante rechazado.');
        this.cargarObligaciones();
      },
      error: (err) => {
        console.error('Error al rechazar comprobante:', err);
        this.notif.error(err?.error?.error || 'No se pudo rechazar el comprobante.');
      }
    });
  }
}