import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-horario-clase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './horario-clase.component.html',
  styleUrl: './horario-clase.component.css'
})
export class HorarioClaseComponent implements OnInit {

  // Información del periodo actual
  periodoActual = 'Mayo - Agosto 2024';
  ciclo = 'Segundo Nivel - Alta Pastelería';

  // Estructura del horario
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  
  horarios = [
    {
      hora: '08:00 - 11:00',
      clases: [
        { dia: 'Lunes', materia: 'Panadería I', chef: 'Chef Carlos Ruiz', aula: 'Cocina A' },
        { dia: 'Miércoles', materia: 'Panadería I', chef: 'Chef Carlos Ruiz', aula: 'Cocina A' },
        { dia: 'Viernes', materia: 'Técnicas de Vanguardia', chef: 'Chef Ana M.', aula: 'Laboratorio' }
      ]
    },
    {
      hora: '11:30 - 14:30',
      clases: [
        { dia: 'Martes', materia: 'Chocolatería', chef: 'Chef Elena S.', aula: 'Taller Dulce' },
        { dia: 'Jueves', materia: 'Chocolatería', chef: 'Chef Elena S.', aula: 'Taller Dulce' }
      ]
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  // Función auxiliar para encontrar la clase según el día y hora
  getClase(dia: string, clasesDelBloque: any[]) {
    return clasesDelBloque.find(c => c.dia === dia);
  }
}
