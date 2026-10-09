import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CobrosService } from '../../../../services/cobros/cobros.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';

const c100 = (v: any) => Math.round(parseFloat(v ?? 0) * 100);

@Component({
  selector: 'app-estado-cuenta-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, SelectModule, TagModule, TableModule,
    TooltipModule, InputNumberModule, InputTextModule],
  template: `
<p-dialog [visible]="visible" (visibleChange)="visibleChange.emit($event)" [modal]="true" [draggable]="false"
  [style]="{ width: '1100px', maxWidth: '97vw' }" [header]="titulo" (onHide)="visibleChange.emit(false)">

  <div *ngIf="cargando" class="tw-py-8 tw-text-center tw-text-gray-500"><i class="pi pi-spin pi-spinner"></i> Cargando…</div>

  <div *ngIf="!cargando && data" class="tw-flex tw-flex-col tw-gap-4">

    <!-- Cabecera -->
    <div class="tw-flex tw-flex-wrap tw-justify-between tw-gap-2 tw-items-center">
      <div class="tw-text-sm tw-text-gray-600">
        <div>{{ data.estudiante.nombre_titulacion || 'Sin titulación' }} · {{ data.estudiante.codigo_estudiante || 'Sin código' }}</div>
        <div>{{ data.estudiante.email || 'Sin correo' }}</div>
      </div>
      <button pButton type="button" icon="pi pi-envelope" label="Enviar recordatorio por correo" severity="secondary"
        [loading]="enviandoCorreo" [disabled]="enviandoCorreo || r.saldo_c <= 0" (click)="enviarCorreo()"></button>
    </div>

    <!-- Indicadores -->
    <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-6 tw-gap-3">
      <div class="kpi"><span>Total del plan</span><strong>\${{ data.resumen.total_base | number:'1.2-2' }}</strong></div>
      <div class="kpi"><span>Recargos</span><strong class="tw-text-orange-600">\${{ data.resumen.total_recargos | number:'1.2-2' }}</strong></div>
      <div class="kpi"><span>Total a pagar</span><strong>\${{ data.resumen.total_a_pagar | number:'1.2-2' }}</strong></div>
      <div class="kpi"><span>Pagado</span><strong class="tw-text-green-600">\${{ data.resumen.total_pagado | number:'1.2-2' }}</strong></div>
      <div class="kpi"><span>Saldo</span><strong class="tw-text-red-600">\${{ data.resumen.saldo | number:'1.2-2' }}</strong></div>
      <div class="kpi" [class.kpi-alerta]="data.resumen.cuotas_vencidas > 0">
        <span>Vencido</span><strong class="tw-text-red-700">\${{ data.resumen.saldo_vencido | number:'1.2-2' }}</strong>
        <small>{{ data.resumen.cuotas_vencidas }} cuota(s) · {{ data.resumen.cuotas_pagadas }}/{{ data.resumen.total_cuotas }} pagadas</small>
      </div>
    </div>

    <!-- Registrar pago -->
    <div class="tw-border tw-rounded-lg tw-p-3 tw-flex tw-flex-col tw-gap-2" *ngIf="r.saldo_c > 0">
      <span class="tw-font-semibold tw-text-sm">Registrar pago (se aplica primero a la cuota más antigua)</span>
      <div class="tw-flex tw-flex-wrap tw-gap-3 tw-items-end">
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-xs tw-text-gray-600">Monto ($)</label>
          <p-inputNumber [(ngModel)]="montoPago" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" styleClass="tw-w-40"></p-inputNumber>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-xs tw-text-gray-600">Método</label>
          <p-select [options]="metodos" [(ngModel)]="metodo" optionLabel="label" optionValue="value" styleClass="tw-w-44" appendTo="body"></p-select>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-1" *ngIf="planesOpciones.length > 2">
          <label class="tw-text-xs tw-text-gray-600">Aplicar a</label>
          <p-select [options]="planesOpciones" [(ngModel)]="planFiltro" optionLabel="label" optionValue="value" styleClass="tw-w-52" appendTo="body"></p-select>
        </div>
        <button pButton type="button" icon="pi pi-check" label="Confirmar pago" [disabled]="procesando || !!errorPago"
          [loading]="procesando" (click)="pagar()"></button>
        <button pButton type="button" class="p-button-text" label="Pagar todo el saldo" (click)="montoPago = saldoAplicable / 100"></button>
      </div>
      <small *ngIf="errorPago" class="tw-text-red-600">{{ errorPago }}</small>
      <div *ngIf="!errorPago && vistaPrevia.length" class="tw-text-sm tw-bg-gray-50 tw-rounded tw-p-2">
        <strong>Vista previa:</strong>
        <span *ngFor="let v of vistaPrevia; let last = last">
          {{ v.concepto }} \${{ v.monto | number:'1.2-2' }}{{ v.completa ? ' (queda pagada)' : ' (parcial)' }}{{ last ? '' : ' · ' }}
        </span>
      </div>
    </div>

    <!-- Cuotas por mes -->
    <div>
      <h4 class="tw-font-semibold tw-mb-2">Cuotas por mes</h4>
      <p-table [value]="data.cuotas" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="320px">
        <ng-template pTemplate="header">
          <tr>
            <th>Mes</th><th>Concepto</th><th>Vence</th>
            <th class="tw-text-right">Base</th><th class="tw-text-right">Recargo</th><th class="tw-text-right">Total</th>
            <th class="tw-text-right">Pagado</th><th class="tw-text-right">Saldo</th><th>Estado</th><th class="tw-text-right">Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-q>
          <tr>
            <td>{{ q.mes }}</td>
            <td>
              {{ q.concepto || ('Cobro #' + q.obligacion_id) }}
              <small *ngIf="q.numero_cuota" class="tw-text-gray-500 tw-block">{{ q.plan_nombre }} · cuota {{ q.numero_cuota }}</small>
            </td>
            <td>{{ q.fecha_vencimiento | date:'dd/MM/yyyy' }}</td>
            <td class="tw-text-right">\${{ q.monto_base | number:'1.2-2' }}</td>
            <td class="tw-text-right" [class.tw-text-orange-600]="+q.recargo_acumulado > 0">\${{ q.recargo_acumulado | number:'1.2-2' }}</td>
            <td class="tw-text-right">\${{ q.monto_total | number:'1.2-2' }}</td>
            <td class="tw-text-right tw-text-green-600">\${{ q.monto_pagado | number:'1.2-2' }}</td>
            <td class="tw-text-right tw-font-semibold">\${{ q.saldo | number:'1.2-2' }}</td>
            <td>
              <p-tag [severity]="severidad(q.estado_real)" [value]="q.estado_real"></p-tag>
              <small *ngIf="q.estado_real === 'VENCIDO'" class="tw-block tw-text-red-600">{{ q.dias_mora }} día(s)</small>
            </td>
            <td class="tw-text-right tw-whitespace-nowrap">
              <button pButton type="button" icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-sm" pTooltip="Editar cuota"
                *ngIf="q.estado !== 'PAGADO'" (click)="abrirEditar(q)"></button>
              <button pButton type="button" icon="pi pi-eraser" class="p-button-text p-button-rounded p-button-warn p-button-sm"
                pTooltip="Condonar recargo" *ngIf="+q.recargo_acumulado > 0 && q.estado !== 'PAGADO'" (click)="condonar(q)"></button>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="10" class="tw-text-center tw-py-6 tw-text-gray-400">Este estudiante aún no tiene cuotas.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <!-- Historial -->
    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
      <div>
        <h4 class="tw-font-semibold tw-mb-2">Historial de pagos</h4>
        <p-table [value]="data.pagos" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="200px">
          <ng-template pTemplate="header"><tr><th>Fecha</th><th>Cuota</th><th class="tw-text-right">Monto</th><th>Método</th></tr></ng-template>
          <ng-template pTemplate="body" let-p>
            <tr><td>{{ p.fecha_pago | date:'dd/MM/yyyy HH:mm' }}</td><td>{{ p.concepto || ('#' + p.obligacion_id) }}</td>
              <td class="tw-text-right">\${{ p.monto | number:'1.2-2' }}</td><td>{{ p.metodo_pago || p.origen }}</td></tr>
          </ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="4" class="tw-text-center tw-text-gray-400 tw-py-3">Sin pagos registrados.</td></tr></ng-template>
        </p-table>
      </div>
      <div>
        <h4 class="tw-font-semibold tw-mb-2">Ajustes y auditoría</h4>
        <p-table [value]="data.ajustes" styleClass="p-datatable-sm" [scrollable]="true" scrollHeight="200px">
          <ng-template pTemplate="header"><tr><th>Fecha</th><th>Tipo</th><th>Detalle</th></tr></ng-template>
          <ng-template pTemplate="body" let-a>
            <tr><td>{{ a.fecha | date:'dd/MM/yyyy' }}</td><td>{{ a.tipo }}</td><td>{{ a.detalle }}</td></tr>
          </ng-template>
          <ng-template pTemplate="emptymessage"><tr><td colspan="3" class="tw-text-center tw-text-gray-400 tw-py-3">Sin ajustes.</td></tr></ng-template>
        </p-table>
      </div>
    </div>
  </div>

  <!-- Editar cuota -->
  <p-dialog [(visible)]="mostrarEditar" [modal]="true" [style]="{ width: '420px' }" header="Editar cuota" appendTo="body">
    <div *ngIf="edit" class="tw-flex tw-flex-col tw-gap-3 tw-mt-1">
      <div class="tw-flex tw-flex-col tw-gap-1">
        <label class="tw-text-sm tw-font-medium">Concepto</label>
        <input pInputText [(ngModel)]="edit.concepto" maxlength="120" class="tw-w-full" />
      </div>
      <div class="tw-flex tw-flex-col tw-gap-1">
        <label class="tw-text-sm tw-font-medium">Valor base ($)</label>
        <p-inputNumber [(ngModel)]="edit.monto_base" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" styleClass="tw-w-full"></p-inputNumber>
        <small class="tw-text-gray-500">Ya pagado: \${{ edit.pagado | number:'1.2-2' }}. El total no puede quedar por debajo de eso.</small>
      </div>
      <div class="tw-flex tw-flex-col tw-gap-1">
        <label class="tw-text-sm tw-font-medium">Vence</label>
        <input type="date" pInputText [(ngModel)]="edit.fecha_vencimiento" class="tw-w-full" />
      </div>
      <small *ngIf="errorEdicion" class="tw-text-red-600">{{ errorEdicion }}</small>
    </div>
    <ng-template pTemplate="footer">
      <button pButton type="button" label="Cancelar" class="p-button-text" (click)="mostrarEditar = false"></button>
      <button pButton type="button" label="Guardar" icon="pi pi-check" [disabled]="guardandoEdicion || !!errorEdicion" [loading]="guardandoEdicion" (click)="guardarEdicion()"></button>
    </ng-template>
  </p-dialog>
</p-dialog>`,
  styles: [`
    .kpi { background:#f8f9fb; border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px; display:flex; flex-direction:column; gap:2px; }
    .kpi span { font-size:12px; color:#6b7280; }
    .kpi strong { font-size:18px; }
    .kpi small { font-size:11px; color:#6b7280; }
    .kpi-alerta { background:#fef2f2; border-color:#fecaca; }
  `]
})
export class EstadoCuentaDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() estudianteId: string | number | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cambiado = new EventEmitter<void>();

  data: any = null;
  cargando = false;
  montoPago: number | null = null;
  metodo = 'EFECTIVO';
  planFiltro: number | null = null;
  procesando = false;
  enviandoCorreo = false;

  metodos = [
    { label: 'Efectivo', value: 'EFECTIVO' },
    { label: 'Transferencia', value: 'TRANSFERENCIA' },
    { label: 'Deuna', value: 'DEUNA' },
    { label: 'Otro', value: 'OTRO' }
  ];

  mostrarEditar = false;
  guardandoEdicion = false;
  edit: { obligacion_id: number; concepto: string; monto_base: number | null; fecha_vencimiento: string; pagado: number; recargo: number } | null = null;

  constructor(private cobros: CobrosService, private notif: NotificacionService) {}

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['visible'] && this.visible && this.estudianteId !== null) this.cargar();
  }

  get titulo(): string {
    const e = this.data?.estudiante;
    return e ? `Estado de cuenta · ${e.apellido} ${e.nombre}` : 'Estado de cuenta';
  }

  get r(): { saldo_c: number } {
    return { saldo_c: this.data ? c100(this.data.resumen.saldo) : 0 };
  }

  get planesOpciones(): { label: string; value: number | null }[] {
    const vistos = new Map<number, string>();
    for (const q of this.data?.cuotas || []) {
      if (q.plan_id && q.estado !== 'PAGADO') vistos.set(q.plan_id, q.plan_nombre || `Plan ${q.plan_id}`);
    }
    return [{ label: 'Todas las deudas', value: null }, ...[...vistos].map(([value, label]) => ({ label, value }))];
  }

  /** Cuotas impagas ordenadas de la más antigua a la más reciente (igual que el servidor). */
  private get impagas(): any[] {
    return (this.data?.cuotas || [])
      .filter((q: any) => q.estado !== 'PAGADO' && c100(q.saldo) > 0 && (this.planFiltro === null || q.plan_id === this.planFiltro))
      .sort((a: any, b: any) => String(a.fecha_vencimiento).localeCompare(String(b.fecha_vencimiento)) || a.obligacion_id - b.obligacion_id);
  }

  get saldoAplicable(): number {
    return this.impagas.reduce((a: number, q: any) => a + c100(q.saldo), 0);
  }

  get errorPago(): string | null {
    const m = Number(this.montoPago);
    if (this.montoPago === null || this.montoPago === undefined || !Number.isFinite(m) || m <= 0) return 'Ingresa un monto mayor a 0.';
    if (Math.round(m * 100) / 100 !== m) return 'Máximo 2 decimales.';
    if (Math.round(m * 100) > this.saldoAplicable) return `El monto excede la deuda ($${(this.saldoAplicable / 100).toFixed(2)}).`;
    return null;
  }

  get vistaPrevia(): { concepto: string; monto: number; completa: boolean }[] {
    if (this.errorPago) return [];
    let resto = Math.round(Number(this.montoPago) * 100);
    const out: { concepto: string; monto: number; completa: boolean }[] = [];
    for (const q of this.impagas) {
      if (resto <= 0) break;
      const saldo = c100(q.saldo);
      const aplica = Math.min(resto, saldo);
      out.push({ concepto: q.concepto || `Cobro #${q.obligacion_id}`, monto: aplica / 100, completa: aplica === saldo });
      resto -= aplica;
    }
    return out;
  }

  severidad(estado: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    return ({ PAGADO: 'success', PARCIAL: 'warn', VENCIDO: 'danger', PENDIENTE: 'info' } as any)[estado] || 'secondary';
  }

  cargar(): void {
    this.cargando = true;
    this.cobros.obtenerEstadoCuentaAdmin(this.estudianteId as any).subscribe({
      next: (d) => {
        this.data = d;
        this.cargando = false;
        this.planFiltro = null;
        this.montoPago = this.proximaSugerencia();
      },
      error: (err) => {
        this.cargando = false;
        this.notif.error(err?.error?.error || 'No se pudo cargar el estado de cuenta.');
        this.visibleChange.emit(false);
      }
    });
  }

  /** Sugiere pagar la deuda vencida o, si no hay, la próxima cuota. */
  private proximaSugerencia(): number | null {
    const venc = c100(this.data?.resumen?.saldo_vencido);
    if (venc > 0) return venc / 100;
    const prox = this.data?.resumen?.proxima_cuota;
    return prox ? parseFloat(prox.saldo) : null;
  }

  pagar(): void {
    if (this.procesando || this.errorPago) return;
    this.procesando = true;
    this.cobros.pagarAcumulado(this.estudianteId as any, {
      monto: Number(this.montoPago), metodo_pago: this.metodo, plan_id: this.planFiltro
    }).subscribe({
      next: (res) => {
        this.procesando = false;
        this.notif.exito(res?.message || 'Pago registrado.');
        this.cambiado.emit();
        this.cargar();
      },
      error: (err) => {
        this.procesando = false;
        this.notif.error(err?.error?.error || 'No se pudo registrar el pago.');
      }
    });
  }

  condonar(q: any): void {
    const motivo = window.prompt(`Condonar $${q.recargo_acumulado} de recargo de "${q.concepto || '#' + q.obligacion_id}".\nMotivo (obligatorio, queda en auditoría):`);
    if (motivo === null) return;
    if (motivo.trim().length < 3) { this.notif.advertencia('Indica un motivo de al menos 3 caracteres.'); return; }
    this.cobros.condonarRecargo(q.obligacion_id, motivo.trim()).subscribe({
      next: (res) => { this.notif.exito(res?.message || 'Recargo condonado.'); this.cambiado.emit(); this.cargar(); },
      error: (err) => this.notif.error(err?.error?.error || 'No se pudo condonar.')
    });
  }

  abrirEditar(q: any): void {
    this.edit = {
      obligacion_id: q.obligacion_id,
      concepto: q.concepto || '',
      monto_base: parseFloat(q.monto_base),
      fecha_vencimiento: String(q.fecha_vencimiento).slice(0, 10),
      pagado: parseFloat(q.monto_pagado),
      recargo: parseFloat(q.recargo_acumulado)
    };
    this.mostrarEditar = true;
  }

  get errorEdicion(): string | null {
    const e = this.edit;
    if (!e) return null;
    if ((e.concepto || '').trim().length < 3) return 'El concepto es muy corto.';
    const m = Number(e.monto_base);
    if (!Number.isFinite(m) || m <= 0) return 'El valor debe ser mayor a 0.';
    if (m > 10000) return 'El valor no puede superar $10.000.';
    if (Math.round(m * 100) / 100 !== m) return 'Máximo 2 decimales.';
    if (Math.round((m + e.recargo) * 100) < Math.round(e.pagado * 100)) return 'El total no puede quedar por debajo de lo ya pagado.';
    if (!e.fecha_vencimiento) return 'Falta la fecha.';
    return null;
  }

  guardarEdicion(): void {
    if (!this.edit || this.errorEdicion || this.guardandoEdicion) return;
    this.guardandoEdicion = true;
    this.cobros.editarCuota(this.edit.obligacion_id, {
      monto_base: Number(this.edit.monto_base), fecha_vencimiento: this.edit.fecha_vencimiento, concepto: this.edit.concepto.trim()
    }).subscribe({
      next: (res) => {
        this.guardandoEdicion = false;
        this.mostrarEditar = false;
        this.notif.exito(res?.message || 'Cuota actualizada.');
        this.cambiado.emit();
        this.cargar();
      },
      error: (err) => { this.guardandoEdicion = false; this.notif.error(err?.error?.error || 'No se pudo editar la cuota.'); }
    });
  }

  enviarCorreo(forzar = false): void {
    this.enviandoCorreo = true;
    this.cobros.enviarRecordatorio(this.estudianteId as any, forzar).subscribe({
      next: (res) => { this.enviandoCorreo = false; this.notif.exito(res?.message || 'Recordatorio enviado.'); },
      error: (err) => {
        this.enviandoCorreo = false;
        const tipo = err?.error?.tipo;
        if (tipo === 'RECIENTE' && window.confirm(`${err.error.error}\n¿Enviarlo de nuevo de todos modos?`)) {
          this.enviarCorreo(true);
          return;
        }
        this.notif.error(err?.error?.error || 'No se pudo enviar el correo.');
      }
    });
  }
}
