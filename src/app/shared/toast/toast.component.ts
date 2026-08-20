// src/app/shared/toast/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../services/notificacion/notificacion.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-contenedor">
      @for (t of notif.toasts(); track t.id) {
        <div class="toast toast-{{ t.tipo }}">
          <i class="toast-icono pi" [ngClass]="iconos[t.tipo]"></i>
          <span class="toast-msg">{{ t.mensaje }}</span>
          <button class="toast-cerrar" (click)="notif.cerrar(t.id)" aria-label="Cerrar">
            <i class="pi pi-times"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-contenedor {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 360px;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      font-size: 0.9rem;
      font-weight: 500;
      animation: slideIn 0.3s ease;
      color: white;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    .toast-exito       { background: #2e7d32; }
    .toast-error       { background: #c62828; }
    .toast-advertencia { background: #e65100; }
    .toast-info        { background: #1565c0; }
    .toast-icono  { font-size: 1.1rem; flex-shrink: 0; }
    .toast-msg    { flex: 1; line-height: 1.3; }
    .toast-cerrar {
      background: none;
      border: none;
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      font-size: 0.85rem;
      padding: 0 4px;
      flex-shrink: 0;
    }
    .toast-cerrar:hover { color: white; }
  `]
})
export class ToastComponent {
  notif  = inject(NotificacionService);
  iconos: Record<string, string> = {
    exito: 'pi-check-circle', error: 'pi-times-circle', advertencia: 'pi-exclamation-triangle', info: 'pi-info-circle'
  };
}
