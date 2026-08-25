import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-perfil-docente',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    CardModule,
    TagModule,
    AvatarModule,
    ToolbarModule,
    MessageModule,
    DividerModule,
  ],
  templateUrl: './perfil-docente.component.html',
  styleUrl: './perfil-docente.component.css'
})
export class PerfilDocenteComponent implements OnInit {

  usuario: any = null;
  stats: {
    total_grupos: number;
    total_estudiantes: number;
    total_recetas: number;
    asignaturas: { asignatura_id: number; nombre_asignatura: string }[];
  } | null = null;

  loading = true;
  error: string | null = null;

  constructor(private usuariosService: UsuariosService) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    this.loading = true;
    this.error = null;

    this.usuariosService.obtenerMiPerfil().subscribe({
      next: (data) => {
        this.usuario = data.usuario;
        this.stats = data.stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar el perfil del docente:', err);
        this.error = 'No se pudo cargar tu perfil.';
        this.loading = false;
      }
    });
  }

  get iniciales(): string {
    if (!this.usuario?.nombre_completo) return '';
    const partes = this.usuario.nombre_completo.trim().split(/\s+/);
    const primera = partes[0]?.[0] || '';
    const segunda = partes.length > 1 ? partes[partes.length - 1][0] : '';
    return (primera + segunda).toUpperCase();
  }
}
