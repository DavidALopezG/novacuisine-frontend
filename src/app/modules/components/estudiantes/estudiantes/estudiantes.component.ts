import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { EstudiantesService } from './../../../../services/estudiantes/estudiantes.service';
import { RecetasService } from './../../../../services/recetas/recetas.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-estudiantes',
  standalone: true, 
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css'
})
export class EstudiantesComponent implements OnInit {
  // Datos
  listaEstudiantes: any[] = [];
  recetasDelEstudiante: any[] = [];
  estudianteSeleccionado: any = null;
  
  // UI State
  loading: boolean = false;
  error: string | null = null;
  filtro: string = ''; // Para el buscador
  
  // Modales
  mostrarModalDetalle: boolean = false;
  mostrarModalNuevoEstudiante: boolean = false;

  // Formulario Nuevo Estudiante
  nuevoEstudiante = {
    codigo_estudiante: '',
    nombre: '',
    apellido: '',
    email: '',
    titulacion_id: null
  };

  constructor(
    private estudiantesService: EstudiantesService,
    private recetasService: RecetasService,
    private notif: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantes();
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

  // --- BUSCADOR (Lógica de filtrado en tiempo real) ---

  get estudiantesFiltrados() {
    if (!this.filtro) return this.listaEstudiantes;
    const busqueda = this.filtro.toLowerCase();
    return this.listaEstudiantes.filter(e => 
      e.nombre.toLowerCase().includes(busqueda) ||
      e.apellido.toLowerCase().includes(busqueda) ||
      e.codigo_estudiante.toLowerCase().includes(busqueda)
    );
  }

  // --- GESTIÓN DE EXPEDIENTE (MODAL) ---

  verExpediente(estudiante: any): void {
    this.estudianteSeleccionado = estudiante;
    this.loading = true;
    
    // Obtenemos recetas y detalles desde la tabla intermedia en el backend
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
        this.cargarEstudiantes(); // Recargar la lista
        this.cerrarModal();
      },
      error: (err) => this.notif.error(err?.error?.error || err?.error?.message || 'Error al crear estudiante')
    });
  }

  abrirModalAsignarReceta(): void {
    const recetaId = prompt('Ingrese el ID de la receta para asignar a este estudiante:');

    if (recetaId && this.estudianteSeleccionado) {
      this.recetasService.asignarReceta(+recetaId, this.estudianteSeleccionado.estudiante_id)
        .subscribe({
          next: () => {
            this.notif.exito('Receta vinculada correctamente');
            this.verExpediente(this.estudianteSeleccionado); // Refrescar lista de recetas en el modal
          },
          error: (err) => this.notif.error('Error al asignar receta: ' + (err?.error?.error || err.message))
        });
    }
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