import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ para ngModel
import { CobrosService } from '../../../../services/cobros/cobros.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';


interface Obligacion {
  // Campos del JOIN con la tabla estudiantes
  nombre?: string;
  apellido?: string;
  codigo_estudiante?: string;

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
  imports: [CommonModule, FormsModule,SpinnerComponent],
  templateUrl: './cobros-gestion.component.html',
  styleUrl: './cobros-gestion.component.css'
})
export class CobrosGestionComponent implements OnInit {
  obligaciones: Obligacion[] = [];
  estudiantes: any[] = [];
  filtroTexto  = '';
  filtroEstado = '';
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

  // 📥 Importación desde Excel
  mostrarModalImportar = false;
  archivoSeleccionado: File | null = null;
  importando = false;
  resumenImportacion: { message: string; total_filas: number; insertadas: any[]; errores: any[] } | null = null;

  constructor(
    private cobrosService: CobrosService,
    private estudiantesService: EstudiantesService,
    private notif: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarObligaciones();
    this.cargarEstudiantes();
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

  // 📥 Importación masiva desde Excel
  abrirModalImportar(): void {
    this.archivoSeleccionado = null;
    this.resumenImportacion = null;
    this.mostrarModalImportar = true;
  }

  cerrarModalImportar(): void {
    this.mostrarModalImportar = false;
    this.archivoSeleccionado = null;
    this.resumenImportacion = null;
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivoSeleccionado = input.files && input.files.length > 0 ? input.files[0] : null;
  }

  importarExcel(): void {
    if (!this.archivoSeleccionado) {
      this.notif.info('Selecciona primero un archivo Excel (.xlsx o .xls).');
      return;
    }

    this.importando = true;
    this.cobrosService.importarObligacionesExcel(this.archivoSeleccionado).subscribe({
      next: (resp) => {
        this.resumenImportacion = resp;
        this.importando = false;
        this.cargarObligaciones();
    this.cargarEstudiantes();
      },
      error: (err) => {
        console.error('Error al importar el Excel:', err);
        this.notif.error('' + (err?.error?.error || 'No se pudo importar el archivo.'));
        this.importando = false;
      }
    });
  }

  confirmarPago(): void {
    if (!this.obligacionSeleccionada) return;

    if (this.montoPago <= 0) {
      this.notif.info('Monto inválido.');
      return;
    }

    const pagoData = {
      obligacion_id: this.obligacionSeleccionada.obligacion_id,
      monto_pago: this.montoPago
    };

    this.cobrosService.registrarPago(pagoData).subscribe({
      next: () => {
        this.notif.info('💵 Pago registrado correctamente');
        this.cerrarModal();
        this.cargarObligaciones();
    this.cargarEstudiantes();
      },
      error: (err) => {
        console.error('Error al registrar pago:', err);
        this.notif.error('Error al registrar el pago.');
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
        this.notif.exito('Obligación creada correctamente');
        this.cerrarModal();
        this.cargarObligaciones();
    this.cargarEstudiantes();
      },
      error: (err) => {
        console.error('Error al crear obligación:', err);
        this.notif.error('Error al crear la obligación.');
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

  cargarEstudiantes(): void {
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data: any[]) => (this.estudiantes = data),
      error: (err: any)  => console.error('Error al cargar estudiantes:', err)
    });
  }

  get obligacionesFiltradas(): any[] {
    return this.obligaciones.filter(o => {
      const nombre  = ((o.nombre || '') + ' ' + (o.apellido || '') + ' ' + (o.codigo_estudiante || '')).toLowerCase();
      const txtOk   = !this.filtroTexto  || nombre.includes(this.filtroTexto.toLowerCase());
      const estOk   = !this.filtroEstado || o.estado === this.filtroEstado;
      return txtOk && estOk;
    });
  }

}
