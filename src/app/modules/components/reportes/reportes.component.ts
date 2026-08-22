import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService, FiltrosReporte } from '../../../services/reportes/reportes.service';
import { TitulacionesService } from '../../../services/titulaciones/titulaciones.service';
import { NotificacionService } from '../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../shared/spinner/spinner.component';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    SpinnerComponent,
    CardModule,
    TableModule,
    ButtonModule,
    TagModule,
    ToolbarModule,
    MessageModule,
    SelectModule,
    DatePickerModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ChartModule,
  ],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {

  loadingResumen = true;
  loadingTabla = true;
  loadingGraficos = true;
  error: string | null = null;
  exportando: 'excel' | 'pdf' | null = null;

  resumen: any = null;
  obligaciones: any[] = [];
  totalRegistros = 0;

  // ── Filtros dinámicos ─────────────────────────────────────
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  titulacionId: number | null = null;
  estado: string | null = null;
  busqueda = '';
  page = 1;
  rowsPorPagina = 10;

  titulaciones: any[] = [];
  get titulacionOptions(): { label: string; value: number }[] {
    return this.titulaciones.map(t => ({ label: t.nombre_titulacion, value: t.titulacion_id }));
  }

  estadoOptions = [
    { label: 'Todos los estados', value: null },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Parcial', value: 'PARCIAL' },
    { label: 'Pagado', value: 'PAGADO' },
    { label: 'Vencido', value: 'VENCIDO' }
  ];

  // ── Datos y configuración de gráficos (Chart.js vía primeng/chart) ──
  dataSerieMensual: any = null;
  dataPorTitulacion: any = null;
  dataPorEstado: any = null;
  opcionesLineales: any;
  opcionesBarras: any;
  opcionesDona: any;

  constructor(
    private reportesService: ReportesService,
    private titulacionesService: TitulacionesService,
    private notif: NotificacionService
  ) {
    this.construirOpcionesGraficos();
  }

  ngOnInit(): void {
    this.cargarTitulaciones();
    this.recargarTodo();
  }

  private construirOpcionesGraficos(): void {
    const baseLegend = { labels: { color: '#1a1a1a' } };

    this.opcionesLineales = {
      plugins: { legend: baseLegend },
      scales: {
        x: { ticks: { color: '#666' }, grid: { display: false } },
        y: { ticks: { color: '#666' }, grid: { color: '#eee' } }
      }
    };
    this.opcionesBarras = this.opcionesLineales;
    this.opcionesDona = {
      plugins: { legend: { position: 'bottom', labels: { color: '#1a1a1a' } } }
    };
  }

  cargarTitulaciones(): void {
    this.titulacionesService.obtenerTitulaciones().subscribe({
      next: (data) => (this.titulaciones = data),
      error: (err) => console.error('Error al cargar titulaciones:', err)
    });
  }

  private get filtrosActuales(): FiltrosReporte {
    return {
      fecha_inicio: this.fechaInicio ? this.formatearFecha(this.fechaInicio) : null,
      fecha_fin: this.fechaFin ? this.formatearFecha(this.fechaFin) : null,
      titulacion_id: this.titulacionId,
      estado: this.estado,
      busqueda: this.busqueda || null,
      page: this.page,
      limit: this.rowsPorPagina
    };
  }

  private formatearFecha(fecha: Date): string {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Se llama al aplicar/limpiar filtros: recarga KPIs, gráficos y tabla (desde la página 1)
  aplicarFiltros(): void {
    this.page = 1;
    this.recargarTodo();
  }

  limpiarFiltros(): void {
    this.fechaInicio = null;
    this.fechaFin = null;
    this.titulacionId = null;
    this.estado = null;
    this.busqueda = '';
    this.aplicarFiltros();
  }

  recargarTodo(): void {
    this.cargarResumen();
    this.cargarGraficos();
    this.cargarTabla();
  }

  cargarResumen(): void {
    this.loadingResumen = true;
    this.error = null;
    this.reportesService.getResumen(this.filtrosActuales).subscribe({
      next: (data) => { this.resumen = data; this.loadingResumen = false; },
      error: (err) => {
        console.error('Error al cargar resumen:', err);
        this.error = 'No se pudieron cargar los reportes financieros.';
        this.loadingResumen = false;
      }
    });
  }

  cargarGraficos(): void {
    this.loadingGraficos = true;

    this.reportesService.getSerieMensual(this.filtrosActuales).subscribe({
      next: (serie) => {
        this.dataSerieMensual = {
          labels: serie.map(s => s.mes),
          datasets: [
            { label: 'Recaudado', data: serie.map(s => Number(s.recaudado)), borderColor: '#b8860b', backgroundColor: 'rgba(184,134,11,0.15)', tension: 0.3, fill: true },
            { label: 'Pendiente', data: serie.map(s => Number(s.pendiente)), borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.1)', tension: 0.3, fill: true }
          ]
        };
      },
      error: (err) => console.error('Error al cargar serie mensual:', err)
    });

    this.reportesService.getPorTitulacion(this.filtrosActuales).subscribe({
      next: (datos) => {
        this.dataPorTitulacion = {
          labels: datos.map(d => d.titulacion),
          datasets: [
            { label: 'Recaudado', data: datos.map(d => Number(d.recaudado)), backgroundColor: '#b8860b' },
            { label: 'Pendiente', data: datos.map(d => Number(d.pendiente)), backgroundColor: '#1a1a1a' }
          ]
        };
      },
      error: (err) => console.error('Error al cargar reporte por titulación:', err)
    });

    this.reportesService.getPorEstado(this.filtrosActuales).subscribe({
      next: (datos) => {
        const coloresPorEstado: Record<string, string> = {
          PAGADO: '#27ae60', PARCIAL: '#f39c12', PENDIENTE: '#3498db', VENCIDO: '#e74c3c'
        };
        this.dataPorEstado = {
          labels: datos.map(d => d.estado),
          datasets: [{
            data: datos.map(d => d.cantidad),
            backgroundColor: datos.map(d => coloresPorEstado[d.estado] || '#999')
          }]
        };
        this.loadingGraficos = false;
      },
      error: (err) => { console.error('Error al cargar distribución por estado:', err); this.loadingGraficos = false; }
    });
  }

  cargarTabla(): void {
    this.loadingTabla = true;
    this.reportesService.getObligaciones(this.filtrosActuales).subscribe({
      next: (res) => {
        this.obligaciones = res.data;
        this.totalRegistros = res.total;
        this.loadingTabla = false;
      },
      error: (err) => {
        console.error('Error al cargar la tabla de obligaciones:', err);
        this.loadingTabla = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.page = Math.floor(event.first / event.rows) + 1;
    this.rowsPorPagina = event.rows;
    this.cargarTabla();
  }

  estadoSeverity(estado: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (estado) {
      case 'PAGADO': return 'success';
      case 'PARCIAL': return 'warn';
      case 'VENCIDO': return 'danger';
      default: return 'info';
    }
  }

  // ─────────────────── EXPORTACIÓN ─────────────────────────

  private descargarBlob(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }

  exportarExcel(): void {
    this.exportando = 'excel';
    this.reportesService.exportarExcel(this.filtrosActuales).subscribe({
      next: (blob) => {
        this.descargarBlob(blob, `reporte-financiero-${Date.now()}.xlsx`);
        this.exportando = null;
      },
      error: (err) => {
        console.error('Error al exportar Excel:', err);
        this.notif.error('No se pudo generar el archivo Excel.');
        this.exportando = null;
      }
    });
  }

  exportarPdf(): void {
    this.exportando = 'pdf';
    this.reportesService.exportarPdf(this.filtrosActuales).subscribe({
      next: (blob) => {
        this.descargarBlob(blob, `reporte-financiero-${Date.now()}.pdf`);
        this.exportando = null;
      },
      error: (err) => {
        console.error('Error al exportar PDF:', err);
        this.notif.error('No se pudo generar el archivo PDF.');
        this.exportando = null;
      }
    });
  }
}
