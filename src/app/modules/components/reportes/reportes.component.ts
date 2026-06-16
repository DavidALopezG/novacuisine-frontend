import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportesService } from '../../../services/reportes/reportes.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  resumen: any = {};
  pagosRecientes: any[] = [];
  loading: boolean = true;

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes() {
    this.loading = true;
    // Ejecutamos ambas peticiones
    this.reportesService.getResumenFinanciero().subscribe(data => {
      this.resumen = data;
    });

    this.reportesService.getReportePagosRecientes().subscribe(data => {
      this.pagosRecientes = data;
      this.loading = false;
    });
  }

  imprimirReporte() {
    window.print();
  }
}