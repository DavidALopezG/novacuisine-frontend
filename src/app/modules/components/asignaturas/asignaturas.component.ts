import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsignaturasService } from '../../../services/asignaturas/asignaturas.service';
import { TitulacionesService } from '../../../services/titulaciones/titulaciones.service';
import { NotificacionService } from '../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';

// Niveles del pensum institucional (folleto "Pensum Académico")
const NIVELES = ['Iniciación', 'Profesionalización', 'Especialización'];

@Component({
  selector: 'app-asignaturas',
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
    InputTextModule,
    SelectModule,
    MessageModule,
    ConfirmDialogModule,
    TooltipModule,
    CheckboxModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './asignaturas.component.html',
  styleUrl: './asignaturas.component.css'
})
export class AsignaturasComponent implements OnInit {

  asignaturas: any[] = [];
  titulaciones: any[] = [];
  loading = true;
  error: string | null = null;

  filtroTexto = '';
  filtroNivel = '';

  nivelOptions = [
    { label: 'Todos los niveles', value: '' },
    ...NIVELES.map(n => ({ label: n, value: n }))
  ];

  // Opciones para el <p-select> del formulario (sin la opción "Todos")
  nivelFormOptions = NIVELES.map(n => ({ label: n, value: n }));

  mostrarModal = false;
  modoEdicion = false;
  asignaturaSeleccionadaId: number | null = null;

  form = {
    nombre_asignatura: '',
    titulacion_id: null as number | null,
    nivel: null as string | null,
    es_electiva: false
  };

  constructor(
    private asignaturasService: AsignaturasService,
    private titulacionesService: TitulacionesService,
    private notif: NotificacionService,
    private confirmacion: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.cargarAsignaturas();
    this.cargarTitulaciones();
  }

  cargarAsignaturas(): void {
    this.loading = true;
    this.error = null;

    this.asignaturasService.obtenerAsignaturas().subscribe({
      next: (data) => {
        this.asignaturas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar asignaturas:', err);
        this.error = 'No se pudieron cargar las asignaturas.';
        this.loading = false;
      }
    });
  }

  cargarTitulaciones(): void {
    this.titulacionesService.obtenerTitulaciones().subscribe({
      next: (data) => (this.titulaciones = data),
      error: (err) => console.error('Error al cargar titulaciones:', err)
    });
  }

  get titulacionOptions(): { label: string; value: number }[] {
    return this.titulaciones.map(t => ({ label: t.nombre_titulacion, value: t.titulacion_id }));
  }

  get asignaturasFiltradas(): any[] {
    return this.asignaturas.filter(a => {
      const matchTexto = !this.filtroTexto ||
        a.nombre_asignatura.toLowerCase().includes(this.filtroTexto.toLowerCase());
      const matchNivel = !this.filtroNivel || a.nivel === this.filtroNivel;
      return matchTexto && matchNivel;
    });
  }

  nombreTitulacion(titulacionId: number | null): string {
    if (!titulacionId) return 'Sin asignar';
    const t = this.titulaciones.find(t => t.titulacion_id === titulacionId);
    return t?.nombre_titulacion || 'Sin asignar';
  }

  nivelSeverity(nivel: string | null): 'success' | 'warn' | 'info' | 'secondary' {
    switch (nivel) {
      case 'Iniciación': return 'info';
      case 'Profesionalización': return 'warn';
      case 'Especialización': return 'success';
      default: return 'secondary';
    }
  }

  abrirModalNueva(): void {
    this.modoEdicion = false;
    this.asignaturaSeleccionadaId = null;
    this.form = { nombre_asignatura: '', titulacion_id: null, nivel: null, es_electiva: false };
    this.mostrarModal = true;
  }

  editarAsignatura(a: any): void {
    this.modoEdicion = true;
    this.asignaturaSeleccionadaId = a.asignatura_id;
    this.form = {
      nombre_asignatura: a.nombre_asignatura,
      titulacion_id: a.titulacion_id,
      nivel: a.nivel,
      es_electiva: !!a.es_electiva
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarAsignatura(): void {
    if (!this.form.nombre_asignatura.trim()) {
      this.notif.advertencia('El nombre de la asignatura es obligatorio.');
      return;
    }

    const payload = { ...this.form };

    const accion = this.modoEdicion && this.asignaturaSeleccionadaId
      ? this.asignaturasService.actualizarAsignatura(this.asignaturaSeleccionadaId, payload)
      : this.asignaturasService.crearAsignatura(payload);

    accion.subscribe({
      next: () => {
        this.notif.exito(this.modoEdicion ? 'Asignatura actualizada.' : 'Asignatura creada.');
        this.cerrarModal();
        this.cargarAsignaturas();
      },
      error: (err) => this.notif.error(err?.error?.error || 'No se pudo guardar la asignatura.')
    });
  }

  eliminarAsignatura(a: any): void {
    this.confirmacion.confirm({
      header: 'Eliminar asignatura',
      message: `¿Eliminar "${a.nombre_asignatura}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.asignaturasService.eliminarAsignatura(a.asignatura_id).subscribe({
          next: () => {
            this.notif.exito('Asignatura eliminada.');
            this.cargarAsignaturas();
          },
          error: (err) => this.notif.error(err?.error?.error || 'No se pudo eliminar la asignatura.')
        });
      }
    });
  }
}
