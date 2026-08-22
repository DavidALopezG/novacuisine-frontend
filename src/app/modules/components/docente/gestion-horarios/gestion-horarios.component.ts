import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosService } from '../../../../services/horarios/horarios.service';
import { AsignaturasService } from '../../../../services/asignaturas/asignaturas.service';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { AuthService } from '../../../../services/auth.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

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

@Component({
  selector: 'app-gestion-horarios',
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
  ],
  providers: [ConfirmationService],
  templateUrl: './gestion-horarios.component.html',
  styleUrl: './gestion-horarios.component.css'
})
export class GestionHorariosComponent implements OnInit {

  horarios: any[] = [];
  asignaturas: any[] = [];
  docentes: any[] = []; // solo se usa si el usuario actual es Admin
  estudiantes: any[] = []; // catálogo completo, para matricular por grupo

  esAdmin = false;
  loading = true;
  error: string | null = null;

  mostrarModal = false;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  diaOptions = this.diasSemana.map(d => ({ label: d, value: d }));

  formHorario = {
    asignatura_id: null as number | null,
    docente_id: null as string | null, // solo aplica si esAdmin
    dia_semana: 'Lunes',
    hora_inicio: '',
    hora_fin: '',
    aula: ''
  };

  get asignaturaOptions(): { label: string; value: number }[] {
    return this.asignaturas.map(a => ({ label: a.nombre_asignatura, value: a.asignatura_id }));
  }

  get docenteOptions(): { label: string; value: string }[] {
    return this.docentes.map(d => ({ label: d.nombre_completo, value: d.usuario_id }));
  }

  // ─────────────────── MATRÍCULA (asignar estudiantes a un grupo) ─────
  mostrarModalMatricula = false;
  cargandoMatricula = false;
  horarioMatriculaId: number | null = null;
  horarioMatriculaNombre = '';
  horarioMatriculaTitulacionId: number | null = null;
  estudiantesMatriculados: any[] = [];
  estudianteAMatricular: string | null = null;
  guardandoMatricula = false;

  // Solo se puede matricular estudiantes de la misma titulación que la asignatura del grupo,
  // y se excluyen los que ya están matriculados en este bloque.
  get estudiantesDisponiblesOptions(): { label: string; value: string }[] {
    const yaMatriculadosIds = new Set(this.estudiantesMatriculados.map(e => String(e.estudiante_id)));
    return this.estudiantes
      .filter(e =>
        (!this.horarioMatriculaTitulacionId || e.titulacion_id === this.horarioMatriculaTitulacionId) &&
        !yaMatriculadosIds.has(String(e.estudiante_id))
      )
      .map(e => ({ label: `${e.apellido} ${e.nombre} (${e.codigo_estudiante})`, value: e.estudiante_id }));
  }

  constructor(
    private horariosService: HorariosService,
    private asignaturasService: AsignaturasService,
    private usuariosService: UsuariosService,
    private estudiantesService: EstudiantesService,
    private authService: AuthService,
    private notif: NotificacionService,
    private confirmacion: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.esAdmin = this.authService.getRoleFromToken() === 1;
    this.cargarHorarios();
    this.cargarAsignaturas();
    this.cargarEstudiantes();
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

  cargarEstudiantes(): void {
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data) => (this.estudiantes = data),
      error: (err) => console.error('Error al cargar estudiantes:', err)
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
      next: (resp) => {
        this.notif.exito('Horario creado correctamente.');
        this.cerrarModal();
        const nuevoId = resp?.horario?.horario_id;
        this.loading = true;
        this.horariosService.obtenerHorarios().subscribe({
          next: (data) => {
            this.horarios = data;
            this.loading = false;
            // Abre directamente la matrícula del grupo recién creado, para que
            // puedas ingresar estudiantes de una vez según la asignatura elegida.
            const creado = nuevoId ? data.find((h: any) => h.horario_id === nuevoId) : null;
            if (creado) this.abrirModalMatricula(creado);
          },
          error: () => { this.error = 'No se pudieron recargar los horarios.'; this.loading = false; }
        });
      },
      error: (err) => this.notif.error('' + (err?.error?.error || 'No se pudo crear el horario.'))
    });
  }

  eliminarHorario(horario: any): void {
    this.confirmacion.confirm({
      header: 'Eliminar horario',
      message: `¿Eliminar el bloque de "${horario.nombre_asignatura}" (${horario.dia_semana})?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.horariosService.eliminarHorario(horario.horario_id).subscribe({
          next: () => { this.notif.exito('Horario eliminado.'); this.cargarHorarios(); },
          error: (err) => this.notif.error('' + (err?.error?.error || 'No se pudo eliminar el horario.'))
        });
      }
    });
  }

  // ─────────────────── MATRÍCULA ───────────────────────────

  abrirModalMatricula(horario: any): void {
    this.horarioMatriculaId = horario.horario_id;
    this.horarioMatriculaNombre = `${horario.nombre_asignatura} — ${horario.dia_semana} ${horario.hora_inicio?.slice(0,5)}-${horario.hora_fin?.slice(0,5)}`;
    this.horarioMatriculaTitulacionId = horario.titulacion_id ?? null;
    this.estudianteAMatricular = null;
    this.cargarMatriculados();
    this.mostrarModalMatricula = true;
  }

  cargarMatriculados(): void {
    if (!this.horarioMatriculaId) return;
    this.cargandoMatricula = true;
    this.horariosService.obtenerEstudiantesDeHorario(this.horarioMatriculaId).subscribe({
      next: (data) => {
        this.estudiantesMatriculados = data;
        this.cargandoMatricula = false;
      },
      error: (err) => {
        console.error('Error al cargar matriculados:', err);
        this.notif.error('No se pudo cargar la lista de estudiantes matriculados.');
        this.cargandoMatricula = false;
      }
    });
  }

  cerrarModalMatricula(): void {
    this.mostrarModalMatricula = false;
    this.horarioMatriculaId = null;
    this.estudiantesMatriculados = [];
  }

  matricularEstudianteSeleccionado(): void {
    if (!this.horarioMatriculaId || !this.estudianteAMatricular) {
      this.notif.advertencia('Selecciona un estudiante para matricular.');
      return;
    }
    this.guardandoMatricula = true;
    this.horariosService.matricularEstudiante(this.horarioMatriculaId, this.estudianteAMatricular).subscribe({
      next: () => {
        this.notif.exito('Estudiante matriculado en el grupo.');
        this.estudianteAMatricular = null;
        this.guardandoMatricula = false;
        this.cargarMatriculados();
        this.cargarHorarios(); // refresca el contador de alumnos_matriculados en la tabla
      },
      error: (err) => {
        this.notif.error(err?.error?.error || 'No se pudo matricular al estudiante.');
        this.guardandoMatricula = false;
      }
    });
  }

  retirarEstudianteDelGrupo(estudiante: any): void {
    if (!this.horarioMatriculaId) return;
    this.confirmacion.confirm({
      header: 'Retirar estudiante',
      message: `¿Retirar a ${estudiante.nombre} ${estudiante.apellido} de este grupo?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.horariosService.retirarEstudiante(this.horarioMatriculaId!, estudiante.estudiante_id).subscribe({
          next: () => {
            this.notif.exito('Estudiante retirado del grupo.');
            this.cargarMatriculados();
            this.cargarHorarios();
          },
          error: (err) => this.notif.error(err?.error?.error || 'No se pudo retirar al estudiante.')
        });
      }
    });
  }
}
