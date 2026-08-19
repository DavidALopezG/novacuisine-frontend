import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TitulacionesService } from '../../../services/titulaciones/titulaciones.service';
import { NotificacionService } from '../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-titulaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
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

  constructor(private titulacionesService: TitulacionesService, private notif: NotificacionService) { }

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
    this.mostrarModal = true;
  }

  editarTitulacion(titulacion: any): void {
    this.modoEdicion = true;
    this.titulacionSeleccionadaId = titulacion.titulacion_id;
    this.nombreTitulacion = titulacion.nombre_titulacion;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarTitulacion(): void {
    if (!this.nombreTitulacion.trim()) {
      this.notif.info('El nombre de la titulación es obligatorio.');
      return;
    }

    const payload = { nombre_titulacion: this.nombreTitulacion };

    const accion = this.modoEdicion && this.titulacionSeleccionadaId
      ? this.titulacionesService.actualizarTitulacion(this.titulacionSeleccionadaId, payload)
      : this.titulacionesService.crearTitulacion(payload);

    accion.subscribe({
      next: () => {
        this.notif.exito(this.modoEdicion ? 'Titulación actualizada con éxito.' : 'Titulación creada con éxito.');
        this.cerrarModal();
        this.cargarTitulaciones();
      },
      error: (err) => this.notif.error(err?.error?.error || 'No se pudo guardar la titulación.')
    });
  }

  eliminarTitulacion(titulacion: any): void {
    if (!confirm(`¿Eliminar la titulación "${titulacion.nombre_titulacion}"?`)) return;

    this.titulacionesService.eliminarTitulacion(titulacion.titulacion_id).subscribe({
      next: () => {
        this.notif.exito('Titulación eliminada correctamente.');
        this.cargarTitulaciones();
      },
      error: (err) => this.notif.error(err?.error?.error || 'No se pudo eliminar la titulación.')
    });
  }
}
