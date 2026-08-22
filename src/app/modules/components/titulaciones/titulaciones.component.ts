import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-titulaciones',
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
    InputNumberModule,
    SelectModule,
    MessageModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './titulaciones.component.html',
  styleUrl: './titulaciones.component.css'
})
export class TitulacionesComponent implements OnInit {

  titulaciones: any[] = [];
  loading = true;
  error: string | null = null;

  mostrarModal = false;
  modoEdicion = false;
  titulacionSeleccionadaId: number | null = null;
  nombreTitulacion = '';
  tipoTitulacion: string = 'Titulación';
  duracionMeses: number | null = null;

  tiposDisponibles = ['Titulación', 'Certificación'];
  tipoOptions = this.tiposDisponibles.map(t => ({ label: t, value: t }));

  constructor(
    private titulacionesService: TitulacionesService,
    private notif: NotificacionService,
    private confirmacion: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.cargarTitulaciones();
  }

  cargarTitulaciones(): void {
    this.loading = true;
    this.error = null;

    this.titulacionesService.obtenerTitulaciones().subscribe({
      next: (data) => {
        this.titulaciones = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar titulaciones:', err);
        this.error = 'No se pudieron cargar las titulaciones.';
        this.loading = false;
      }
    });
  }

  abrirModalNueva(): void {
    this.modoEdicion = false;
    this.titulacionSeleccionadaId = null;
    this.nombreTitulacion = '';
    this.tipoTitulacion = 'Titulación';
    this.duracionMeses = null;
    this.mostrarModal = true;
  }

  editarTitulacion(titulacion: any): void {
    this.modoEdicion = true;
    this.titulacionSeleccionadaId = titulacion.titulacion_id;
    this.nombreTitulacion = titulacion.nombre_titulacion;
    this.tipoTitulacion = titulacion.tipo || 'Titulación';
    this.duracionMeses = titulacion.duracion_meses;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarTitulacion(): void {
    if (!this.nombreTitulacion.trim()) {
      this.notif.advertencia('El nombre de la titulación es obligatorio.');
      return;
    }

    const payload = {
      nombre_titulacion: this.nombreTitulacion,
      tipo: this.tipoTitulacion,
      duracion_meses: this.duracionMeses
    };

    const accion = this.modoEdicion && this.titulacionSeleccionadaId
      ? this.titulacionesService.actualizarTitulacion(this.titulacionSeleccionadaId, payload)
      : this.titulacionesService.crearTitulacion(payload);

    accion.subscribe({
      next: () => {
        this.notif.exito(this.modoEdicion ? 'Titulación actualizada.' : 'Titulación creada.');
        this.cerrarModal();
        this.cargarTitulaciones();
      },
      error: (err) => this.notif.error(err?.error?.error || 'No se pudo guardar la titulación.')
    });
  }

  eliminarTitulacion(titulacion: any): void {
    this.confirmacion.confirm({
      header: 'Eliminar titulación',
      message: `¿Eliminar la titulación "${titulacion.nombre_titulacion}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.titulacionesService.eliminarTitulacion(titulacion.titulacion_id).subscribe({
          next: () => {
            this.notif.exito('Titulación eliminada.');
            this.cargarTitulaciones();
          },
          error: (err) => this.notif.error(err?.error?.error || 'No se pudo eliminar la titulación.')
        });
      }
    });
  }
}
