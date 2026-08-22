import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecetasService } from '../../../../services/recetas/recetas.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';

interface RecetaAsignada {
  receta_id: number;
  nombre: string;
  porciones: number;
  tiempo_prep_min: number;
  nombre_asignatura: string | null;
  numero_version: string | null;
  estado_version: string | null;
  costo_unitario: number | null;
  precio_venta_sugerido: number | null;
  fecha_acceso: string;
}

@Component({
  selector: 'app-mis-recetas-estd',
  standalone: true,
  imports: [
    CommonModule,
    SpinnerComponent,
    CardModule,
    TagModule,
    ButtonModule,
    DialogModule,
    ToolbarModule,
    MessageModule,
    DividerModule,
  ],
  templateUrl: './mis-recetas-estd.component.html',
  styleUrl: './mis-recetas-estd.component.css'
})
export class MisRecetasEstdComponent implements OnInit {

  recetas: RecetaAsignada[] = [];
  loading = true;
  error: string | null = null;

  // Detalle completo de la receta seleccionada
  mostrarModalDetalle = false;
  cargandoDetalle = false;
  recetaDetalle: any = null;

  constructor(
    private recetasService: RecetasService,
    private notif: NotificacionService
  ) { }

  ngOnInit(): void {
    this.cargarMisRecetas();
  }

  cargarMisRecetas(): void {
    this.loading = true;
    this.error = null;

    this.recetasService.misRecetas().subscribe({
      next: (data: RecetaAsignada[]) => {
        this.recetas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar mis recetas:', err);
        this.error = 'No se pudieron cargar tus recetas asignadas.';
        this.loading = false;
      }
    });
  }

  verRecetaCompleta(receta: RecetaAsignada): void {
    this.cargandoDetalle = true;
    this.mostrarModalDetalle = true;
    this.recetaDetalle = null;

    this.recetasService.obtenerRecetaPorId(receta.receta_id).subscribe({
      next: (detalle) => {
        this.recetaDetalle = detalle;
        this.cargandoDetalle = false;
      },
      error: (err) => {
        console.error('Error al obtener el detalle de la receta:', err);
        this.notif.error('No se pudo cargar el detalle de la receta.');
        this.cargandoDetalle = false;
        this.mostrarModalDetalle = false;
      }
    });
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
    this.recetaDetalle = null;
  }
}
