import { Injectable, signal } from '@angular/core';

export type ToastTipo = 'exito' | 'error' | 'info' | 'advertencia';

export interface Toast {
  id: number;
  mensaje: string;
  tipo: ToastTipo;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  toasts = signal<Toast[]>([]);
  private contador = 0;

  mostrar(mensaje: string, tipo: ToastTipo = 'info', duracionMs = 3500): void {
    const id = ++this.contador;
    this.toasts.update(lista => [...lista, { id, mensaje, tipo }]);
    setTimeout(() => this.cerrar(id), duracionMs);
  }

  exito(mensaje: string)       { this.mostrar(mensaje, 'exito'); }
  error(mensaje: string)       { this.mostrar(mensaje, 'error', 5000); }
  info(mensaje: string)        { this.mostrar(mensaje, 'info'); }
  advertencia(mensaje: string) { this.mostrar(mensaje, 'advertencia'); }

  cerrar(id: number): void {
    this.toasts.update(lista => lista.filter(t => t.id !== id));
  }
}