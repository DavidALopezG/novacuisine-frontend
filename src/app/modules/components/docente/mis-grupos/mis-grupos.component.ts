import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorariosService } from '../../../../services/horarios/horarios.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

@Component({
  selector: 'app-mis-grupos',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './mis-grupos.component.html',
  styleUrl: './mis-grupos.component.css'
})
export class MisGruposComponent implements OnInit {

  grupos: any[] = [];
  loading = true;
  error: string | null = null;

  // Modal de estudiantes del grupo
  mostrarModalEstudiantes = false;
  grupoSeleccionado: any = null;
  estudiantesGrupo: any[] = [];
  cargandoEstudiantes = false;

  constructor(private horariosService: HorariosService) {}

  ngOnInit(): void {
    this.cargarGrupos();
  }

  cargarGrupos(): void {
    this.loading = true;
    this.error = null;

    this.horariosService.obtenerMisGrupos().subscribe({
      next: (data) => {
        this.grupos = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar grupos:', err);
        this.error = 'No se pudieron cargar tus grupos asignados.';
        this.loading = false;
      }
    });
  }

  verEstudiantes(grupo: any): void {
    this.grupoSeleccionado = grupo;
    this.estudiantesGrupo = [];
    this.cargandoEstudiantes = true;
    this.mostrarModalEstudiantes = true;

    this.horariosService.obtenerEstudiantesDeGrupo(grupo.asignatura_id).subscribe({
      next: (data) => {
        this.estudiantesGrupo = data;
        this.cargandoEstudiantes = false;
      },
      error: (err) => {
        console.error('Error al cargar estudiantes del grupo:', err);
        this.cargandoEstudiantes = false;
      }
    });
  }

  cerrarModalEstudiantes(): void {
    this.mostrarModalEstudiantes = false;
    this.grupoSeleccionado = null;
    this.estudiantesGrupo = [];
  }
}
