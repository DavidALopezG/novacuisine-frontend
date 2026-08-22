import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorariosService } from '../../../../services/horarios/horarios.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';

interface BloqueHorario {
  hora: string;
  clases: { dia: string; materia: string; chef: string; aula: string }[];
}

@Component({
  selector: 'app-horario-clase',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    CardModule,
    TagModule,
    ButtonModule,
    ToolbarModule,
    MessageModule,
  ],
  templateUrl: './horario-clase.component.html',
  styleUrl: './horario-clase.component.css'
})
export class HorarioClaseComponent implements OnInit {

  // Etiqueta de la titulación del estudiante (real, desde su perfil)
  tituloHorario = 'Mi Horario';

  // Días de la semana visibles en la tabla (orden fijo de presentación, no es dato de negocio)
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  horarios: BloqueHorario[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private horariosService: HorariosService,
    private estudiantesService: EstudiantesService
  ) { }

  ngOnInit(): void {
    this.cargarTitulacion();
    this.cargarHorario();
  }

  cargarTitulacion(): void {
    this.estudiantesService.getMiPerfil().subscribe({
      next: (data) => {
        if (data?.perfil?.nombre_titulacion) {
          this.tituloHorario = data.perfil.nombre_titulacion;
        }
      },
      error: (err) => console.error('Error al cargar la titulación:', err)
    });
  }

  cargarHorario(): void {
    this.loading = true;
    this.error = null;

    this.horariosService.obtenerMiHorario().subscribe({
      next: (data) => {
        this.horarios = this.agruparPorBloque(data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el horario:', err);
        this.error = 'No se pudo cargar tu horario.';
        this.loading = false;
      }
    });
  }

  // Agrupa los registros planos del backend en bloques hora -> clases por día
  private agruparPorBloque(registros: any[]): BloqueHorario[] {
    const bloquesPorHora = new Map<string, BloqueHorario>();

    for (const r of registros) {
      const hora = `${this.formatearHora(r.hora_inicio)} - ${this.formatearHora(r.hora_fin)}`;

      if (!bloquesPorHora.has(hora)) {
        bloquesPorHora.set(hora, { hora, clases: [] });
      }

      bloquesPorHora.get(hora)!.clases.push({
        dia: r.dia_semana,
        materia: r.nombre_asignatura,
        chef: r.docente_nombre || 'Por asignar',
        aula: r.aula || 'Por asignar'
      });
    }

    return Array.from(bloquesPorHora.values()).sort((a, b) => a.hora.localeCompare(b.hora));
  }

  private formatearHora(hora: string): string {
    // El backend devuelve TIME como 'HH:MM:SS'; se muestra solo 'HH:MM'
    return hora ? hora.slice(0, 5) : '';
  }

  // Función auxiliar para encontrar la clase según el día y hora
  getClase(dia: string, clasesDelBloque: any[]) {
    return clasesDelBloque.find(c => c.dia === dia);
  }

  imprimirHorario(): void {
    window.print();
  }
}
