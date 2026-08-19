import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosService } from '../../../../services/horarios/horarios.service';
import { AsignaturasService } from '../../../../services/asignaturas/asignaturas.service';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { AuthService } from '../../../../services/auth.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-gestion-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './gestion-horarios.component.html',
  styleUrl: './gestion-horarios.component.css'
})
export class GestionHorariosComponent implements OnInit {

  horarios: any[] = [];
  asignaturas: any[] = [];
  docentes: any[] = []; // solo se usa si el usuario actual es Admin

  esAdmin = false;
  loading = true;
  error: string | null = null;

  mostrarModal = false;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  formHorario = {
    asignatura_id: null as number | null,
    docente_id: null as string | null, // solo aplica si esAdmin
    dia_semana: 'Lunes',
    hora_inicio: '',
    hora_fin: '',
    aula: ''
  };

  constructor(
    private horariosService: HorariosService,
    private asignaturasService: AsignaturasService,
    private usuariosService: UsuariosService,
    private authService: AuthService
  , private notif: NotificacionService) { }

  ngOnInit(): void {
    this.esAdmin = this.authService.getRoleFromToken() === 1;
    this.cargarHorarios();
    this.cargarAsignaturas();
    if (this.esAdmin) {
      this.cargarDocentes();
    }
  }

  cargarHorarios(): void {
    this.loading = true;
    this.error = null;

    this.horariosService.obtenerHorarios().subscribe({
      next: (data) => {
        this.horarios = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar horarios:', err);
        this.error = 'No se pudieron cargar los horarios.';
        this.loading = false;
      }
    });
  }

  cargarAsignaturas(): void {
    this.asignaturasService.obtenerAsignaturas().subscribe({
      next: (data) => (this.asignaturas = data),
      error: (err) => console.error('Error al cargar asignaturas:', err)
    });
  }

  cargarDocentes(): void {
    this.usuariosService.getUsuarios().subscribe({
      next: (data) => (this.docentes = data.filter((u: any) => u.rol_id === 2)),
      error: (err) => console.error('Error al cargar docentes:', err)
    });
  }

  abrirModalNuevo(): void {
    this.formHorario = {
      asignatura_id: null,
      docente_id: null,
      dia_semana: 'Lunes',
      hora_inicio: '',
      hora_fin: '',
      aula: ''
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarHorario(): void {
    if (!this.formHorario.asignatura_id || !this.formHorario.hora_inicio || !this.formHorario.hora_fin) {
      this.notif.info('Selecciona la asignatura y completa la hora de inicio y fin.');
      return;
    }

    this.horariosService.crearHorario(this.formHorario).subscribe({
      next: () => {
        this.notif.exito('Horario creado correctamente.');
        this.cerrarModal();
        this.cargarHorarios();
      },
      error: (err) => this.notif.error('' + (err?.error?.error || 'No se pudo crear el horario.'))
    });
  }

  eliminarHorario(horario: any): void {
    if (!confirm(`¿Eliminar el bloque de "${horario.nombre_asignatura}" (${horario.dia_semana})?`)) return;

    this.horariosService.eliminarHorario(horario.horario_id).subscribe({
      next: () => this.cargarHorarios(),
      error: (err) => this.notif.error('' + (err?.error?.error || 'No se pudo eliminar el horario.'))
    });
  }
}
