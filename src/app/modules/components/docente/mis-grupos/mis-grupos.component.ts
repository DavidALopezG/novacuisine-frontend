import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosService } from '../../../../services/horarios/horarios.service';
import { AsignaturasService } from '../../../../services/asignaturas/asignaturas.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

// Nota de diseño: en la BD actual no existe una tabla "grupos" separada. Cada
// bloque de horarios_clase (asignatura + día + hora + aula, asociado a este
// docente) se trata como "un grupo de clase". La matrícula real de estudiantes
// por grupo vive en la tabla matriculas_horario (estudiante_id <-> horario_id).
interface GrupoDocente {
  horario_id: number;
  asignatura_id: number;
  nombre_asignatura: string;
  titulacion_id: number | null;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
  alumnos_matriculados: number;
}

@Component({
  selector: 'app-mis-grupos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SpinnerComponent,
    CardModule,
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
  templateUrl: './mis-grupos.component.html',
  styleUrl: './mis-grupos.component.css'
})
export class MisGruposComponent implements OnInit {

  grupos: GrupoDocente[] = [];
  asignaturas: any[] = [];
  estudiantes: any[] = [];

  loading = true;
  error: string | null = null;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  diaOptions = this.diasSemana.map(d => ({ label: d, value: d }));

  // ── Modal crear/editar grupo ──────────────────────────────
  mostrarModal = false;
  editandoId: number | null = null; // null = creando, con valor = editando ese horario_id

  formGrupo = {
    asignatura_id: null as number | null,
    dia_semana: 'Lunes',
    hora_inicio: '',
    hora_fin: '',
    aula: ''
  };

  get asignaturaOptions(): { label: string; value: number }[] {
    return this.asignaturas.map(a => ({ label: a.nombre_asignatura, value: a.asignatura_id }));
  }

  // ─────────────────── MATRÍCULA ───────────────────────────
  mostrarModalMatricula = false;
  cargandoMatricula = false;
  horarioMatriculaId: number | null = null;
  horarioMatriculaNombre = '';
  horarioMatriculaTitulacionId: number | null = null;
  estudiantesMatriculados: any[] = [];
  estudianteAMatricular: string | null = null;
  guardandoMatricula = false;

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
    private estudiantesService: EstudiantesService,
    private notif: NotificacionService,
    private confirmacion: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.cargarGrupos();
    this.cargarAsignaturas();
    this.cargarEstudiantes();
  }

  cargarGrupos(): void {
    this.loading = true;
    this.error = null;

    // El backend ya filtra por docente_id = usuario autenticado cuando rol = Docente
    this.horariosService.obtenerHorarios().subscribe({
      next: (data) => {
        this.grupos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.error = 'No se pudieron cargar tus grupos.';
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

  cargarEstudiantes(): void {
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data) => (this.estudiantes = data),
      error: (err) => console.error('Error al cargar estudiantes:', err)
    });
  }

  get totalEstudiantes(): number {
    // Suma real de matriculados por grupo (ya no es un estimado: viene de
    // la tabla matriculas_horario). Un mismo estudiante en 2 grupos cuenta 2 veces.
    return this.grupos.reduce((acc, g) => acc + (g.alumnos_matriculados || 0), 0);
  }

  // ─────────────────── Crear / Editar ──────────────────────

  abrirModalNuevo(): void {
    this.editandoId = null;
    this.formGrupo = {
      asignatura_id: null,
      dia_semana: 'Lunes',
      hora_inicio: '',
      hora_fin: '',
      aula: ''
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(grupo: GrupoDocente): void {
    this.editandoId = grupo.horario_id;
    this.formGrupo = {
      asignatura_id: grupo.asignatura_id,
      dia_semana: grupo.dia_semana,
      hora_inicio: grupo.hora_inicio,
      hora_fin: grupo.hora_fin,
      aula: grupo.aula || ''
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.editandoId = null;
  }

  guardarGrupo(): void {
    if (!this.formGrupo.asignatura_id || !this.formGrupo.hora_inicio || !this.formGrupo.hora_fin) {
      this.notif.advertencia('Selecciona la asignatura y completa la hora de inicio y fin.');
      return;
    }

    if (this.formGrupo.hora_fin <= this.formGrupo.hora_inicio) {
      this.notif.advertencia('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    const creandoNuevo = !this.editandoId;
    const peticion = this.editandoId
      ? this.horariosService.actualizarHorario(this.editandoId, this.formGrupo)
      : this.horariosService.crearHorario(this.formGrupo);

    peticion.subscribe({
      next: (resp: any) => {
        this.notif.exito(this.editandoId ? 'Grupo actualizado correctamente.' : 'Grupo creado correctamente.');
        this.cerrarModal();

        const nuevoId = creandoNuevo ? resp?.horario?.horario_id : null;
        this.loading = true;
        this.horariosService.obtenerHorarios().subscribe({
          next: (data) => {
            this.grupos = data;
            this.loading = false;
            // Al crear un grupo nuevo, abre de una vez su matrícula para
            // ingresar estudiantes de la asignatura recién elegida.
            const creado = nuevoId ? data.find((h: any) => h.horario_id === nuevoId) : null;
            if (creado) this.abrirModalMatricula(creado);
          },
          error: () => { this.error = 'No se pudieron recargar tus grupos.'; this.loading = false; }
        });
      },
      error: (err) => this.notif.error(err?.error?.error || 'No se pudo guardar el grupo.')
    });
  }

  eliminarGrupo(grupo: GrupoDocente): void {
    this.confirmacion.confirm({
      header: 'Eliminar grupo',
      message: `¿Eliminar el grupo de "${grupo.nombre_asignatura}" (${grupo.dia_semana})? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.horariosService.eliminarHorario(grupo.horario_id).subscribe({
          next: () => { this.notif.exito('Grupo eliminado.'); this.cargarGrupos(); },
          error: (err) => this.notif.error(err?.error?.error || 'No se pudo eliminar el grupo.')
        });
      }
    });
  }

  // ─────────────────── MATRÍCULA ───────────────────────────

  abrirModalMatricula(grupo: GrupoDocente): void {
    this.horarioMatriculaId = grupo.horario_id;
    this.horarioMatriculaNombre = `${grupo.nombre_asignatura} — ${grupo.dia_semana}`;
    this.horarioMatriculaTitulacionId = grupo.titulacion_id ?? null;
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
        this.cargarGrupos(); // refresca el contador de alumnos_matriculados en la tarjeta
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
            this.cargarGrupos();
          },
          error: (err) => this.notif.error(err?.error?.error || 'No se pudo retirar al estudiante.')
        });
      }
    });
  }
}
