import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-perfil-estd',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    SpinnerComponent,
    CardModule,
    TagModule,
    AvatarModule,
    ToolbarModule,
    MessageModule,
    ProgressBarModule,
    DividerModule,
  ],
  templateUrl: './perfil-estd.component.html',
  styleUrl: './perfil-estd.component.css'
})
export class PerfilEstdComponent implements OnInit {

  perfil: any = null;
  progresoPorAsignatura: any[] = [];
  resumenAcademico: { total_recetas: number; recetas_aprobadas: number; porcentaje_avance: number } | null = null;

  loading = true;
  error: string | null = null;

  constructor(private estudiantesService: EstudiantesService) { }

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.loading = true;
    this.error = null;

    this.estudiantesService.getMiPerfil().subscribe({
      next: (data) => {
        this.perfil = data.perfil;
        this.progresoPorAsignatura = data.progresoPorAsignatura || [];
        this.resumenAcademico = data.resumenAcademico;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el perfil:', err);
        this.error = 'No se pudo cargar tu perfil académico.';
        this.loading = false;
      }
    });
  }
}
