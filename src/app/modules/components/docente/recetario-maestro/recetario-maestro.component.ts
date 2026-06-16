import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para el buscador

@Component({
  selector: 'app-recetario-maestro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recetario-maestro.component.html',
  styleUrl: './recetario-maestro.component.css'
})
export class RecetarioMaestroComponent implements OnInit {

  searchTerm: string = '';
  categoriaSeleccionada: string = 'Todas';

  categorias = ['Todas', 'Pastelería', 'Panadería', 'Cocina Caliente', 'Cocina Fría'];

  recetas = [
    { id: 1, nombre: 'Macarons de Lavanda', categoria: 'Pastelería', dificultad: 'Alta', tiempo: '120 min', autor: 'Chef Roberto G.' },
    { id: 2, nombre: 'Pan de Masa Madre', categoria: 'Panadería', dificultad: 'Media', tiempo: '24h', autor: 'Chef Carlos R.' },
    { id: 3, nombre: 'Salsa Holandesa Técnica', categoria: 'Cocina Caliente', dificultad: 'Media', tiempo: '20 min', autor: 'Chef Roberto G.' },
    { id: 4, nombre: 'Mousse de Maracuyá', categoria: 'Pastelería', dificultad: 'Baja', tiempo: '45 min', autor: 'Chef Elena S.' },
  ];

  constructor() { }

  ngOnInit(): void { }

  // Filtro dinámico
  get recetasFiltradas() {
    return this.recetas.filter(r => {
      const coincideBusqueda = r.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const coincideCategoria = this.categoriaSeleccionada === 'Todas' || r.categoria === this.categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }

  editarReceta(id: number) {
    console.log('Editando receta ID:', id);
  }

  nuevaReceta() {
    alert('Abriendo editor de nueva ficha técnica culinaria...');
  }
}