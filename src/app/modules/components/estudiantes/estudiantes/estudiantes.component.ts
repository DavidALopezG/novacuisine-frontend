import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstudiantesService } from './../../../../services/estudiantes/estudiantes.service';
import { RecetasService } from './../../../../services/recetas/recetas.service';
import { TitulacionesService } from './../../../../services/titulaciones/titulaciones.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-estudiantes',
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
    SelectModule,
    MessageModule,
    TooltipModule,
    DividerModule,
  ],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css'
})
export class EstudiantesComponent implements OnInit {
  // Datos
  listaEstudiantes: any[] = [];
  recetasDelEstudiante: any[] = [];
  estudianteSeleccionado: any = null;
  titulaciones: any[] = []; // catálogo para el select del modal de registro
  catalogoRecetas: any[] = []; // catálogo para el select de "Asignar receta"

  // UI State
  loading = false;
  error: string | null = null;
  filtro = '';

  // Modales
  mostrarModalDetalle = false;
  mostrarModalNuevoEstudiante = false;
  mostrarModalAsignarReceta = false;
  recetaSeleccionadaId: number | null = null;
  asignandoReceta = false;

  // Formulario Nuevo Estudiante
  nuevoEstudiante = {
    codigo_estudiante: '',
    nombre: '',
    apellido: '',
    email: '',
    titulacion_id: null as number | null
  };

  get titulacionOptions(): { label: string; value: number }[] {
    return this.titulaciones.map(t => ({ label: t.nombre_titulacion, value: t.titulacion_id }));
  }

  get recetaOptions(): { label: string; value: number }[] {
    return this.catalogoRecetas.map(r => ({ label: r.nombre, value: r.receta_id }));
  }

  constructor(
    private estudiantesService: EstudiantesService,
    private recetasService: RecetasService,
    private titulacionesService: TitulacionesService,
    private notif: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantes();
    this.cargarTitulaciones();
    this.cargarCatalogoRecetas();
  }

  // --- CARGA DE DATOS ---

  cargarEstudiantes(): void {
    this.loading = true;
    this.error = null;
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data) => {
        this.listaEstudiantes = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar estudiantes', err);
        this.error = 'No se pudo conectar con el servidor.';
        this.loading = false;
      }
    });
  }

  cargarTitulaciones(): void {
    this.titulacionesService.obtenerTitulaciones().subscribe({
      next: (data) => (this.titulaciones = data),
      error: (err) => console.error('Error al cargar titulaciones', err)
    });
  }

  cargarCatalogoRecetas(): void {
    this.recetasService.obtenerRecetas().subscribe({
      next: (data) => (this.catalogoRecetas = data),
      error: (err) => console.error('Error al cargar catálogo de recetas', err)
    });
  }

  // --- BUSCADOR ---

  get estudiantesFiltrados() {
    if (!this.filtro) return this.listaEstudiantes;
    const busqueda = this.filtro.toLowerCase();
    return this.listaEstudiantes.filter(e =>
      e.nombre.toLowerCase().includes(busqueda) ||
      e.apellido.toLowerCase().includes(busqueda) ||
      e.codigo_estudiante.toLowerCase().includes(busqueda)
    );
  }

  saldoSeverity(saldo: number): 'warn' | 'success' {
    return saldo > 0 ? 'warn' : 'success';
  }

  // --- GESTIÓN DE EXPEDIENTE (MODAL) ---

  verExpediente(estudiante: any): void {
    this.estudianteSeleccionado = estudiante;
    this.loading = true;

    this.estudiantesService.getPerfilCompleto(estudiante.estudiante_id).subscribe({
      next: (res) => {
        this.recetasDelEstudiante = res.recetas || [];
        this.mostrarModalDetalle = true;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar expediente', err);
        this.loading = false;
        this.notif.error('Error al cargar las recetas del estudiante');
      }
    });
  }

  // --- ACCIONES DE ADMINISTRADOR ---

  abrirModalNuevoEstudiante(): void {
    this.mostrarModalNuevoEstudiante = true;
  }

  crearEstudiante(): void {
    if (!this.nuevoEstudiante.nombre || !this.nuevoEstudiante.codigo_estudiante) {
      this.notif.advertencia('Por favor complete los campos obligatorios');
      return;
    }

    this.estudiantesService.createEstudiante(this.nuevoEstudiante).subscribe({
      next: () => {
        this.notif.exito('Estudiante registrado exitosamente');
        this.cargarEstudiantes();
        this.cerrarModal();
      },
      error: (err) => this.notif.error(err?.error?.error || err?.error?.message || 'Error al crear estudiante')
    });
  }

  abrirModalAsignarReceta(): void {
    this.recetaSeleccionadaId = null;
    this.mostrarModalAsignarReceta = true;
  }

  cerrarModalAsignarReceta(): void {
    this.mostrarModalAsignarReceta = false;
    this.recetaSeleccionadaId = null;
  }

  confirmarAsignarReceta(): void {
    if (!this.recetaSeleccionadaId || !this.estudianteSeleccionado) {
      this.notif.advertencia('Selecciona una receta.');
      return;
    }
    this.asignandoReceta = true;
    this.recetasService.asignarReceta(this.recetaSeleccionadaId, this.estudianteSeleccionado.estudiante_id)
      .subscribe({
        next: () => {
          this.notif.exito('Receta vinculada correctamente');
          this.asignandoReceta = false;
          this.cerrarModalAsignarReceta();
          this.verExpediente(this.estudianteSeleccionado); // Refrescar lista de recetas en el modal
        },
        error: (err) => {
          this.asignandoReceta = false;
          this.notif.error('Error al asignar receta: ' + (err?.error?.error || err.message));
        }
      });
  }

  // --- CIERRE DE MODALES ---

  cerrarModal(): void {
    this.mostrarModalDetalle = false;
    this.mostrarModalNuevoEstudiante = false;
    this.estudianteSeleccionado = null;
    this.recetasDelEstudiante = [];
    this.nuevoEstudiante = {
      codigo_estudiante: '',
      nombre: '',
      apellido: '',
      email: '',
      titulacion_id: null
    };
  }
}
