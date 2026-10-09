import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { CobrosService } from '../../../../services/cobros/cobros.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';

interface CuotaEditable {
  concepto: string;
  tipo: 'MATRICULA' | 'MENSUALIDAD' | 'OTRO';
  monto: number | null;
  fecha_vencimiento: string;
}

/** Fecha local YYYY-MM-DD (sin pasar por UTC, para no correr un día). */
function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** Suma meses conservando el día; si el mes destino es más corto usa su último día (31 ene → 28 feb). */
function sumarMeses(base: string, meses: number): string {
  const [y, m, d] = base.split('-').map(Number);
  const destino = new Date(y, m - 1 + meses, 1);
  const ultimo = new Date(destino.getFullYear(), destino.getMonth() + 1, 0).getDate();
  destino.setDate(Math.min(d, ultimo));
  return iso(destino);
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

@Component({
  selector: 'app-plan-pagos-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, SelectModule, InputNumberModule,
    InputTextModule, CheckboxModule, TableModule],
  template: `
<p-dialog [visible]="visible" (visibleChange)="visibleChange.emit($event)" [modal]="true"
  [style]="{ width: '860px', maxWidth: '96vw' }" [draggable]="false" header="Nuevo plan de pagos" (onHide)="cerrar()">

  <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4 tw-mt-1">
    <div class="tw-flex tw-flex-col tw-gap-1 md:tw-col-span-2">
      <label class="tw-font-medium tw-text-sm">Estudiante</label>
      <p-select [options]="estudianteOptions" [(ngModel)]="estudianteId" optionLabel="label" optionValue="value"
        [filter]="true" filterBy="label" filterPlaceholder="Buscar por nombre, código o CI..." emptyFilterMessage="Sin resultados"
        placeholder="Selecciona un estudiante..." styleClass="tw-w-full" appendTo="body" (onChange)="alCambiarEstudiante()">
      </p-select>
      <small *ngIf="infoTitulacion" class="tw-text-gray-500">{{ infoTitulacion }}</small>
    </div>

    <div class="tw-flex tw-flex-col tw-gap-1 md:tw-col-span-2">
      <label class="tw-font-medium tw-text-sm">Nombre del plan</label>
      <input pInputText [(ngModel)]="nombre" maxlength="120" class="tw-w-full" />
    </div>

    <div class="tw-border tw-rounded-lg tw-p-3 tw-flex tw-flex-col tw-gap-3">
      <div class="tw-flex tw-items-center tw-gap-2">
        <p-checkbox [(ngModel)]="incluyeMatricula" [binary]="true" inputId="chkMat"></p-checkbox>
        <label for="chkMat" class="tw-font-semibold tw-text-sm">Incluir matrícula</label>
      </div>
      <div class="tw-grid tw-grid-cols-2 tw-gap-3" *ngIf="incluyeMatricula">
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-xs tw-text-gray-600">Valor ($)</label>
          <p-inputNumber [(ngModel)]="montoMatricula" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" styleClass="tw-w-full"></p-inputNumber>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-xs tw-text-gray-600">Vence</label>
          <input type="date" pInputText [(ngModel)]="fechaMatricula" class="tw-w-full" />
        </div>
      </div>
    </div>

    <div class="tw-border tw-rounded-lg tw-p-3 tw-flex tw-flex-col tw-gap-3">
      <span class="tw-font-semibold tw-text-sm">Mensualidades</span>
      <div class="tw-grid tw-grid-cols-3 tw-gap-3">
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-xs tw-text-gray-600">N.º de meses</label>
          <p-inputNumber [(ngModel)]="numMensualidades" [useGrouping]="false" [maxFractionDigits]="0" styleClass="tw-w-full"></p-inputNumber>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-xs tw-text-gray-600">Valor ($)</label>
          <p-inputNumber [(ngModel)]="montoMensualidad" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" styleClass="tw-w-full"></p-inputNumber>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-xs tw-text-gray-600">1.ª vence</label>
          <input type="date" pInputText [(ngModel)]="fechaPrimera" class="tw-w-full" />
        </div>
      </div>
    </div>
  </div>

  <div class="tw-flex tw-items-center tw-gap-3 tw-mt-4">
    <button pButton type="button" icon="pi pi-refresh" label="Generar cuotas" severity="secondary" (click)="generar()"></button>
    <small class="tw-text-gray-500">Genera la tabla; después puedes editar cada valor, fecha o concepto, o quitar cuotas.</small>
  </div>

  <div *ngIf="cuotas.length > 0" class="tw-mt-3">
    <p-table [value]="cuotas" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="260px">
      <ng-template pTemplate="header">
        <tr><th style="width:3rem">#</th><th>Concepto</th><th style="width:9rem">Valor ($)</th><th style="width:10rem">Vence</th><th style="width:3rem"></th></tr>
      </ng-template>
      <ng-template pTemplate="body" let-c let-i="rowIndex">
        <tr>
          <td>{{ i + 1 }}</td>
          <td><input pInputText [(ngModel)]="c.concepto" maxlength="120" class="tw-w-full" /></td>
          <td><p-inputNumber [(ngModel)]="c.monto" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" styleClass="tw-w-full"></p-inputNumber></td>
          <td><input type="date" pInputText [(ngModel)]="c.fecha_vencimiento" class="tw-w-full" /></td>
          <td><button pButton type="button" icon="pi pi-trash" class="p-button-text p-button-rounded p-button-danger p-button-sm" (click)="quitar(i)"></button></td>
        </tr>
      </ng-template>
    </p-table>
    <div class="tw-flex tw-justify-between tw-mt-2 tw-text-sm">
      <span class="tw-text-gray-600">{{ cuotas.length }} cuota(s)</span>
      <strong>Total del plan: \${{ total | number:'1.2-2' }}</strong>
    </div>
  </div>

  <small *ngIf="errorPlan" class="tw-text-red-600 tw-block tw-mt-3">{{ errorPlan }}</small>

  <ng-template pTemplate="footer">
    <button pButton type="button" label="Cancelar" icon="pi pi-times" class="p-button-text" (click)="cerrar()"></button>
    <button pButton type="button" label="Crear plan" icon="pi pi-check" [disabled]="guardando || !!errorPlan || cuotas.length === 0"
      [loading]="guardando" (click)="guardar()"></button>
  </ng-template>
</p-dialog>`
})
export class PlanPagosDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() estudianteOptions: { label: string; value: any }[] = [];
  @Input() estudiantes: any[] = [];
  @Input() titulaciones: any[] = [];
  @Input() estudianteInicial: any = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() creado = new EventEmitter<void>();

  estudianteId: any = null;
  nombre = '';
  incluyeMatricula = true;
  montoMatricula: number | null = null;
  fechaMatricula = '';
  numMensualidades: number | null = 12;
  montoMensualidad: number | null = null;
  fechaPrimera = '';
  cuotas: CuotaEditable[] = [];
  guardando = false;
  infoTitulacion = '';

  constructor(private cobros: CobrosService, private notif: NotificacionService) {}

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['visible'] && this.visible) this.reiniciar();
  }

  private reiniciar(): void {
    const hoy = new Date();
    this.estudianteId = this.estudianteInicial ?? null;
    this.nombre = `Plan ${hoy.getFullYear()}`;
    this.incluyeMatricula = true;
    this.montoMatricula = null;
    this.fechaMatricula = iso(hoy);
    this.numMensualidades = 12;
    this.montoMensualidad = null;
    this.fechaPrimera = sumarMeses(iso(hoy), 1);
    this.cuotas = [];
    this.infoTitulacion = '';
    this.guardando = false;
    if (this.estudianteId) this.alCambiarEstudiante();
  }

  alCambiarEstudiante(): void {
    const e = this.estudiantes.find(x => String(x.estudiante_id) === String(this.estudianteId));
    const t = e ? this.titulaciones.find(x => x.titulacion_id === e.titulacion_id) : null;
    if (t) {
      const dur = Number(t.duracion_meses);
      if (Number.isInteger(dur) && dur > 0 && dur <= 36) this.numMensualidades = dur;
      this.infoTitulacion = `${t.nombre_titulacion}${dur ? ' · duración ' + dur + ' meses' : ''}`;
    } else {
      this.infoTitulacion = '';
    }
  }

  generar(): void {
    const n = Number(this.numMensualidades);
    if (!Number.isInteger(n) || n < 1 || n > 36) {
      this.notif.advertencia('El número de mensualidades debe ser un entero entre 1 y 36.');
      return;
    }
    if (!this.montoMensualidad || this.montoMensualidad <= 0) {
      this.notif.advertencia('Ingresa el valor de la mensualidad.');
      return;
    }
    if (this.incluyeMatricula && (!this.montoMatricula || this.montoMatricula <= 0)) {
      this.notif.advertencia('Ingresa el valor de la matrícula o desmarca la opción.');
      return;
    }
    if (!this.fechaPrimera || (this.incluyeMatricula && !this.fechaMatricula)) {
      this.notif.advertencia('Completa las fechas de vencimiento.');
      return;
    }
    const lista: CuotaEditable[] = [];
    if (this.incluyeMatricula) {
      lista.push({ concepto: 'Matrícula', tipo: 'MATRICULA', monto: this.montoMatricula, fecha_vencimiento: this.fechaMatricula });
    }
    for (let i = 0; i < n; i++) {
      const fecha = sumarMeses(this.fechaPrimera, i);
      const [y, m] = fecha.split('-').map(Number);
      lista.push({
        concepto: `Mensualidad ${i + 1} - ${MESES[m - 1]} ${y}`,
        tipo: 'MENSUALIDAD',
        monto: this.montoMensualidad,
        fecha_vencimiento: fecha
      });
    }
    this.cuotas = lista;
  }

  quitar(i: number): void {
    this.cuotas = this.cuotas.filter((_, idx) => idx !== i);
  }

  get total(): number {
    return Math.round(this.cuotas.reduce((a, c) => a + Math.round((Number(c.monto) || 0) * 100), 0)) / 100;
  }

  get errorPlan(): string | null {
    if (!this.estudianteId) return this.cuotas.length ? 'Selecciona un estudiante.' : null;
    if (!this.nombre.trim()) return 'El plan necesita un nombre.';
    const vistos = new Set<string>();
    for (let i = 0; i < this.cuotas.length; i++) {
      const c = this.cuotas[i];
      const n = i + 1;
      const concepto = (c.concepto || '').trim();
      if (concepto.length < 3) return `Cuota ${n}: el concepto es muy corto.`;
      if (vistos.has(concepto.toLowerCase())) return `Cuota ${n}: el concepto "${concepto}" está repetido.`;
      vistos.add(concepto.toLowerCase());
      const m = Number(c.monto);
      if (!Number.isFinite(m) || m <= 0) return `Cuota ${n}: el valor debe ser mayor a 0.`;
      if (m > 10000) return `Cuota ${n}: el valor no puede superar $10.000.`;
      if (Math.round(m * 100) / 100 !== m) return `Cuota ${n}: máximo 2 decimales.`;
      if (!c.fecha_vencimiento) return `Cuota ${n}: falta la fecha.`;
    }
    if (this.cuotas.filter(c => c.tipo === 'MATRICULA').length > 1) return 'Solo puede haber una matrícula.';
    return null;
  }

  guardar(): void {
    if (this.guardando || this.errorPlan || !this.estudianteId) {
      if (!this.estudianteId) this.notif.advertencia('Selecciona un estudiante.');
      return;
    }
    this.guardando = true;
    this.cobros.crearPlan({
      estudiante_id: this.estudianteId,
      nombre: this.nombre.trim(),
      cuotas: this.cuotas.map(c => ({ concepto: c.concepto.trim(), tipo: c.tipo, monto: c.monto, fecha_vencimiento: c.fecha_vencimiento }))
    }).subscribe({
      next: (res) => {
        this.guardando = false;
        this.notif.exito(res?.message || 'Plan creado.');
        this.creado.emit();
        this.cerrar();
      },
      error: (err) => {
        this.guardando = false;
        this.notif.error(err?.error?.error || 'No se pudo crear el plan.');
      }
    });
  }

  cerrar(): void {
    this.visibleChange.emit(false);
  }
}
