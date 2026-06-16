import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // 👈 Asegúrate de importar estos dos
@Component({
  selector: 'app-perfil-estd',
  imports: [

    CommonModule, // 👈 Esto soluciona el error de [ngClass]
    DatePipe
  ],
  templateUrl: './perfil-estd.component.html',
  styleUrl: './perfil-estd.component.css'
})
export class PerfilEstdComponent {
// Datos simulados del estudiante
perfil = {
  nombre: 'Jean Pierre',
  apellido: 'Casiraghi',
  email: 'j.casiraghi@novacuisine.com',
  codigo: 'EST-2024-089',
  fechaIngreso: new Date(2024, 1, 15),
  estado: 'Activo',
  titulacion: 'Diplomado en Alta Pastelería',
  ciclo: 'Segundo Nivel',
  imagen: 'assets/imagenes/default-avatar.png' // Puedes poner una ruta real o un placeholder
};

// Historial de inscripciones simulado
inscripciones = [
  { curso: 'Fundamentos de Cocina', fecha: 'Feb 2024', estado: 'Completado' },
  { curso: 'Alta Pastelería I', fecha: 'Mayo 2024', estado: 'En curso' },
  { curso: 'Manejo de Cuchillos y Seguridad', fecha: 'Feb 2024', estado: 'Completado' }
];

constructor() { }

ngOnInit(): void { }
}