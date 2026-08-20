import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ReportesService } from '../../../services/reportes/reportes.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    SpinnerComponent,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToolbarModule,
    MessageModule,
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  loading = true;
  error: string | null = null;

  resumen: any = null;
  pagosRecientes: any[] = [];

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.loading = true;
    this.error = null;

    this.reportesService.getResumenCompleto().subscribe({
      next: (data) => {
        this.resumen        = data.resumen;
        this.pagosRecientes = data.pagosRecientes || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar reportes:', err);
        this.error = 'No se pudieron cargar los reportes financieros.';
        this.loading = false;
      }
    });
  }

  imprimirReporte(): void {
    window.print();
  }
}
