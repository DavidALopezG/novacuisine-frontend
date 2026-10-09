import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { CobrosService } from '../../../../services/cobros/cobros.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';

@Component({
  selector: 'app-config-mora-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule, SelectModule, InputNumberModule, InputTextModule, CheckboxModule],
  template: `
<p-dialog [visible]="visible" (visibleChange)="visibleChange.emit($event)" [modal]="true" [draggable]="false"
  [style]="{ width: '520px', maxWidth: '96vw' }" header="Recargos por mora" (onHide)="visibleChange.emit(false)">

  <div class="tw-flex tw-flex-col tw-gap-4 tw-mt-1">
    <p class="tw-text-sm tw-text-gray-600">
      Una cuota no pagada y vencida genera un recargo por <strong>cada mes completo</strong> de atraso, de forma
      acumulativa (mes 1, mes 2, mes 3…). El recargo se suma al total de esa cuota. Si la parte base ya se pagó, deja de crecer.
    </p>

    <div class="tw-flex tw-items-center tw-gap-2">
      <p-checkbox [(ngModel)]="activo" [binary]="true" inputId="chkMora"></p-checkbox>
      <label for="chkMora" class="tw-font-semibold">Aplicar recargos por mora</label>
    </div>

    <ng-container *ngIf="activo">
      <div class="tw-grid tw-grid-cols-2 tw-gap-3">
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-sm tw-font-medium">Tipo</label>
          <p-select [options]="tipos" [(ngModel)]="tipo" optionLabel="label" optionValue="value" styleClass="tw-w-full" appendTo="body"></p-select>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-sm tw-font-medium">{{ tipo === 'PORCENTAJE' ? 'Porcentaje mensual (%)' : 'Valor fijo mensual ($)' }}</label>
          <p-inputNumber [(ngModel)]="valor" mode="decimal" [minFractionDigits]="2" [maxFractionDigits]="2" styleClass="tw-w-full"></p-inputNumber>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-sm tw-font-medium">Tope (% de la cuota, opcional)</label>
          <p-inputNumber [(ngModel)]="tope" mode="decimal" [minFractionDigits]="0" [maxFractionDigits]="2" placeholder="Sin tope" styleClass="tw-w-full"></p-inputNumber>
        </div>
        <div class="tw-flex tw-flex-col tw-gap-1">
          <label class="tw-text-sm tw-font-medium">Aplicar desde</label>
          <input type="date" pInputText [(ngModel)]="desde" class="tw-w-full" />
        </div>
      </div>
      <small class="tw-text-gray-500">
        «Aplicar desde» evita cobrar con efecto retroactivo: los meses anteriores a esa fecha no generan recargo.
      </small>
      <div class="tw-bg-gray-50 tw-rounded-lg tw-p-3 tw-text-sm">
        <strong>Ejemplo:</strong> cuota de $70 con {{ tipo === 'PORCENTAJE' ? ((valor || 0) + '% mensual') : ('$' + (valor || 0) + ' fijo mensual') }}:
        a 1 mes de atraso se suma <strong>\${{ ejemplo(1) | number:'1.2-2' }}</strong>, a 3 meses <strong>\${{ ejemplo(3) | number:'1.2-2' }}</strong>.
      </div>
    </ng-container>

    <small *ngIf="error" class="tw-text-red-600">{{ error }}</small>
    <small *ngIf="ultimaEjecucion" class="tw-text-green-700">{{ ultimaEjecucion }}</small>
  </div>

  <ng-template pTemplate="footer">
    <button pButton type="button" label="Aplicar recargos ahora" icon="pi pi-bolt" class="p-button-text" [disabled]="cargando || guardando" (click)="aplicarAhora()"></button>
    <button pButton type="button" label="Cerrar" class="p-button-text" (click)="visibleChange.emit(false)"></button>
    <button pButton type="button" label="Guardar" icon="pi pi-check" [disabled]="guardando || cargando || !!error" [loading]="guardando" (click)="guardar()"></button>
  </ng-template>
</p-dialog>`
})
export class ConfigMoraDialogComponent implements OnChanges {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cambiado = new EventEmitter<void>();

  tipos = [{ label: 'Porcentaje sobre el saldo base', value: 'PORCENTAJE' }, { label: 'Valor fijo ($)', value: 'FIJO' }];
  activo = false;
  tipo: 'PORCENTAJE' | 'FIJO' = 'PORCENTAJE';
  valor: number | null = 5;
  tope: number | null = null;
  desde = '';
  cargando = false;
  guardando = false;
  ultimaEjecucion = '';

  constructor(private cobros: CobrosService, private notif: NotificacionService) {}

  ngOnChanges(ch: SimpleChanges): void {
    if (ch['visible'] && this.visible) this.cargar();
  }

  private cargar(): void {
    this.cargando = true;
    this.ultimaEjecucion = '';
    this.cobros.obtenerConfiguracion().subscribe({
      next: (c) => {
        this.activo = !!c.recargo_activo;
        this.tipo = c.recargo_tipo;
        this.valor = Number(c.recargo_valor);
        this.tope = c.recargo_tope_porcentaje === null ? null : Number(c.recargo_tope_porcentaje);
        this.desde = String(c.recargo_desde || '').slice(0, 10);
        this.cargando = false;
      },
      error: () => { this.cargando = false; this.notif.error('No se pudo cargar la configuración.'); }
    });
  }

  ejemplo(meses: number): number {
    const base = 70;
    const v = Number(this.valor) || 0;
    let r = this.tipo === 'PORCENTAJE' ? base * v / 100 * meses : v * meses;
    if (this.tope) r = Math.min(r, base * this.tope / 100);
    return Math.round(r * 100) / 100;
  }

  get error(): string | null {
    if (!this.activo) return null;
    const v = Number(this.valor);
    if (!Number.isFinite(v) || v <= 0) return 'Ingresa un valor mayor a 0.';
    if (this.tipo === 'PORCENTAJE' && v > 100) return 'El porcentaje no puede superar 100.';
    if (this.tipo === 'FIJO' && v > 500) return 'El valor fijo no puede superar $500.';
    if (this.tope !== null && this.tope !== undefined && Number(this.tope) <= 0) return 'El tope debe ser mayor a 0 (o déjalo vacío).';
    return null;
  }

  guardar(): void {
    if (this.error) return;
    this.guardando = true;
    this.cobros.guardarConfiguracion({
      recargo_activo: this.activo,
      recargo_tipo: this.tipo,
      recargo_valor: this.valor,
      recargo_tope_porcentaje: this.tope || null,
      recargo_desde: this.desde || undefined
    }).subscribe({
      next: (res) => {
        this.guardando = false;
        this.notif.exito(res?.message || 'Configuración guardada.');
        this.cambiado.emit();
        this.cargar();
      },
      error: (err) => { this.guardando = false; this.notif.error(err?.error?.error || 'No se pudo guardar.'); }
    });
  }

  aplicarAhora(): void {
    this.cobros.aplicarRecargosAhora().subscribe({
      next: (res) => {
        this.ultimaEjecucion = res?.message || 'Listo.';
        this.cambiado.emit();
      },
      error: (err) => this.notif.error(err?.error?.error || 'No se pudieron aplicar los recargos.')
    });
  }
}
