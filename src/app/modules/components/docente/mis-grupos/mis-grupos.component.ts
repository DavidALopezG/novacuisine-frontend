import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosService } from '../../../../services/horarios/horarios.service';
import { AsignaturasService } from '../../../../services/asignaturas/asignaturas.service';

// Nota de diseño: en la BD actual no existe una tabla "grupos". Cada bloque de
// horarios_clase (asignatura + día + hora + aula, asociado a este docente) se
// trata como "un grupo de clase". Así se evita una migración de esquema.
interface GrupoDocente {
  horario_id: number;
  asignatura_id: number;
  nombre_asignatura: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  aula: string | null;
  alumnos_estimados: number;
}

@Component({
  selector: 'app-mis-grupos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-grupos.component.html',
  styleUrl: './mis-grupos.component.css'
})
export class MisGruposComponent implements OnInit {

  grupos: GrupoDocente[] = [];
  asignaturas: any[] = [];

  loading = true;
  error: string | null = null;

  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

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

  constructor(
    private horariosService: HorariosService,
    private asignaturasService: AsignaturasService
  ) { }

  ngOnInit(): void {
    this.cargarGrupos();
    this.cargarAsignaturas();
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

  get totalEstudiantes(): number {
    // Suma simple de los estimados por grupo (puede haber solapamiento si
    // varios grupos comparten titulación; se deja así por ser un estimado).
    return this.grupos.reduce((acc, g) => acc + (g.alumnos_estimados || 0), 0);
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
      alert('Selecciona la asignatura y completa la hora de inicio y fin.');
      return;
    }

    if (this.formGrupo.hora_fin <= this.formGrupo.hora_inicio) {
      alert('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    const peticion = this.editandoId
      ? this.horariosService.actualizarHorario(this.editandoId, this.formGrupo)
      : this.horariosService.crearHorario(this.formGrupo);

    peticion.subscribe({
      next: () => {
        alert(this.editandoId ? '✅ Grupo actualizado correctamente.' : '✅ Grupo creado correctamente.');
        this.cerrarModal();
        this.cargarGrupos();
      },
      error: (err) => alert('❌ ' + (err?.error?.error || 'No se pudo guardar el grupo.'))
    });
  }

  eliminarGrupo(grupo: GrupoDocente): void {
    if (!confirm(`¿Eliminar el grupo de "${grupo.nombre_asignatura}" (${grupo.dia_semana})? Esta acción no se puede deshacer.`)) {
      return;
    }

    this.horariosService.eliminarHorario(grupo.horario_id).subscribe({
      next: () => this.cargarGrupos(),
      error: (err) => alert('❌ ' + (err?.error?.error || 'No se pudo eliminar el grupo.'))
    });
  }
}
