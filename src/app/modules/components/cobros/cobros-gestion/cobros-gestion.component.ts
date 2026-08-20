import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CobrosService } from '../../../../services/cobros/cobros.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

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
  estado: string;
  fecha_pago: Date | null;
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
    TooltipModule
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

  // Visibilidad de modales
  mostrarModalPago = false;
  mostrarModalObligacion = false;
  mostrarModalImportar = false;

  obligacionSeleccionada: Obligacion | null = null;
  montoPago = 0;

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
          label: `${e.apellido} ${e.nombre} (${e.codigo_estudiante || 'Sin Cód.'})`,
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
// ESTA FUNCION ESTA MAL PORQUE NO REGISTRA CORRECTAMENTE PAGOS
confirmarPago(): void {
  if (!this.obligacionSeleccionada) return;

  if (this.montoPago <= 0) {
    this.notif.advertencia('Ingresa un monto válido mayor a 0.');
    return;
  }

  const pagoData = {
    obligacion_id: this.obligacionSeleccionada.obligacion_id,
    monto_pago: this.montoPago
  };

  this.cobrosService.registrarPago(pagoData).subscribe({
    next: () => {
      this.notif.exito('Pago registrado correctamente.');
      this.cerrarModal();
      this.cargarObligaciones();
      this.cargarEstudiantes();
    },
    error: (err) => {
      console.error('Error al registrar pago:', err);
      this.notif.error(err?.error?.error || 'Error al registrar el pago.');
    }
  });
}
//FUNCION MAL
  abrirModalNuevaObligacion(): void {
    this.nuevaObligacion = { estudiante_id: 0, monto_total: 0, fecha_vencimiento: '' };
    this.mostrarModalObligacion = true;
  }

  crearObligacion(): void {
    if (!this.nuevaObligacion.estudiante_id || !this.nuevaObligacion.monto_total || !this.nuevaObligacion.fecha_vencimiento) {
      this.notif.advertencia('Completa todos los campos obligatorios.');
      return;
    }

    this.cobrosService.crearObligacion(this.nuevaObligacion).subscribe({
      next: () => {
        this.notif.exito('Obligación creada correctamente');
        this.cerrarModal();
        this.cargarObligaciones();
      },
      error: (err) => {
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
}