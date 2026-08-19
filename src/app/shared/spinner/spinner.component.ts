// src/app/shared/spinner/spinner.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="spinner-contenedor" *ngIf="visible">
      <div class="spinner-anillo"></div>
      <p class="spinner-texto" *ngIf="texto">{{ texto }}</p>
    </div>
  `,
  styles: [`
    .spinner-contenedor {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 14px;
    }
    .spinner-anillo {
      width: 44px;
      height: 44px;
      border: 4px solid #f0e6c8;
      border-top-color: #b8860b;
      border-radius: 50%;
      animation: girar 0.8s linear infinite;
    }
    @keyframes girar {
      to { transform: rotate(360deg); }
    }
    .spinner-texto {
      color: #999;
      font-size: 0.85rem;
      margin: 0;
    }
  `]
})
export class SpinnerComponent {
  @Input() visible = true;
  @Input() texto   = 'Cargando...';
}
