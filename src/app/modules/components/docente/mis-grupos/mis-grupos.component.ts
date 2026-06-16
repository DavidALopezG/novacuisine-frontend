import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-grupos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-grupos.component.html',
  styleUrl: './mis-grupos.component.css'
})
export class MisGruposComponent implements OnInit {

  // Resumen del docente
  docenteInfo = {
    nombre: 'Chef Roberto Guzmán',
    especialidad: 'Alta Cocina Internacional',
    totalEstudiantes: 42
  };

  // Listado de grupos asignados
  grupos = [
    {
      id: 'G1-2024',
      nombre: 'Técnicas Culinarias I',
      paralelo: 'A',
      horario: 'Lunes y Miércoles (08:00 - 11:00)',
      alumnosCount: 22,
      progreso: 45,
      cocina: 'Cocina Principal'
    },
    {
      id: 'G2-2024',
      nombre: 'Cocina Fría y Ensaladas',
      paralelo: 'B',
      horario: 'Martes y Jueves (11:30 - 14:30)',
      alumnosCount: 20,
      progreso: 30,
      cocina: 'Taller de Fríos'
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  verDetallesGrupo(id: string) {
    console.log('Navegando a detalles del grupo:', id);
    // Aquí iría un router.navigate a la lista de estudiantes de ese grupo
  }
}