import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecetasService } from '../../../../services/recetas/recetas.service';
import { AsignaturasService } from '../../../../services/asignaturas/asignaturas.service';
import { InsumosService } from '../../../../services/insumos/insumos.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';

interface Receta {
  receta_id: number;
  nombre: string;
  porciones: number;
  tiempo_prep_min: number;
  asignatura_id: number | null;
  nombre_asignatura: string | null;
  autor: string;
  version_id: number | null;
  numero_version: string | null;
  estado_version: string | null;
  costo_unitario: number | null;
  precio_venta_sugerido: number | null;
}

interface Insumo {
  insumo_id: number;
  nombre_insumo: string;
  costo_unitario: number;
  unidad_medida: string;
}

interface IngredienteForm {
  insumo_id: number;
  nombre_insumo: string;
  unidad_medida: string;
  cantidad: number;
}

@Component({
  selector: 'app-recetario-maestro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recetario-maestro.component.html',
  styleUrl: './recetario-maestro.component.css'
})
export class RecetarioMaestroComponent implements OnInit {

  recetas: Receta[] = [];
  asignaturas: any[] = [];
  catalogoInsumos: Insumo[] = [];
  estudiantes: any[] = [];

  loading = true;
  error: string | null = null;

  searchTerm: string = '';
  categoriaSeleccionada: string = 'Todas';

  /* ===========================================================
     MODAL 1: Crear / Editar datos básicos de la receta
     (al crear, también se registran los ingredientes iniciales)
     =========================================================== */
  mostrarModalReceta = false;
  modoEdicion = false;
  recetaSeleccionadaId: number | null = null;

  formReceta = {
    nombre: '',
    porciones: 1,
    tiempo_prep_min: 0,
    asignatura_id: null as number | null
  };

  // Ingredientes que se asignan solo al CREAR una receta nueva
  ingredientesNuevaReceta: IngredienteForm[] = [];

  /* ===========================================================
     Selector compartido para agregar un ingrediente desde el
     catálogo (se usa tanto al crear receta como al gestionar
     ingredientes de una receta ya existente)
     =========================================================== */
  selectorInsumoId: number | null = null;
  selectorCantidad: number = 1;

  // Alta rápida de un insumo nuevo si no existe en el catálogo
  nuevoInsumoNombre = '';
  nuevoInsumoCosto = 0;
  nuevoInsumoUnidad = '';

  /* ===========================================================
     MODAL 2: Gestionar ingredientes de una receta existente
     (genera una nueva versión, ej: 1.0 -> 1.1)
     =========================================================== */
  mostrarModalIngredientes = false;
  recetaIngredientesId: number | null = null;
  recetaIngredientesNombre = '';
  numeroVersionActual: string | null = null;
  precioVentaActual: number = 0;
  ingredientesVersion: IngredienteForm[] = [];
  guardandoVersion = false;

  /* ===========================================================
     MODAL 3: Asignar receta a un estudiante
     =========================================================== */
  mostrarModalAsignar = false;
  recetaAsignarId: number | null = null;
  recetaAsignarNombre = '';
  estudianteSeleccionadoId: string | null = null;
  asignando = false;

  constructor(
    private recetasService: RecetasService,
    private asignaturasService: AsignaturasService,
    private insumosService: InsumosService,
    private estudiantesService: EstudiantesService
  ) { }

  ngOnInit(): void {
    this.cargarAsignaturas();
    this.cargarRecetas();
    this.cargarCatalogoInsumos();
    this.cargarEstudiantes();
  }

  /* =================== CARGA DE DATOS =================== */

  cargarRecetas(): void {
    this.loading = true;
    this.error = null;

    this.recetasService.obtenerRecetas().subscribe({
      next: (data: Receta[]) => {
        this.recetas = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar recetas:', err);
        this.error = 'No se pudieron cargar las recetas.';
        this.loading = false;
      }
    });
  }

  cargarAsignaturas(): void {
    this.asignaturasService.obtenerAsignaturas().subscribe({
      next: (data) => (this.asignaturas = data),
      error: (err) => console.error('Error al cargar asignaturas:', err)
    });
  }

  cargarCatalogoInsumos(): void {
    this.insumosService.obtenerInsumos().subscribe({
      next: (data) => (this.catalogoInsumos = data),
      error: (err) => console.error('Error al cargar insumos:', err)
    });
  }

  cargarEstudiantes(): void {
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data) => (this.estudiantes = data),
      error: (err) => console.error('Error al cargar estudiantes:', err)
    });
  }

  /* =================== FILTRO DE TABLA =================== */

  get recetasFiltradas(): Receta[] {
    return this.recetas.filter(r => {
      const coincideBusqueda = r.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const coincideCategoria =
        this.categoriaSeleccionada === 'Todas' || r.nombre_asignatura === this.categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }

  /* =================== MODAL 1: CREAR / EDITAR =================== */

  abrirModalNuevaReceta(): void {
    this.modoEdicion = false;
    this.recetaSeleccionadaId = null;
    this.formReceta = { nombre: '', porciones: 1, tiempo_prep_min: 0, asignatura_id: null };
    this.ingredientesNuevaReceta = [];
    this.resetSelectorIngrediente();
    this.mostrarModalReceta = true;
  }

  editarReceta(receta: Receta): void {
    this.modoEdicion = true;
    this.recetaSeleccionadaId = receta.receta_id;
    this.formReceta = {
      nombre: receta.nombre,
      porciones: receta.porciones,
      tiempo_prep_min: receta.tiempo_prep_min,
      asignatura_id: receta.asignatura_id
    };
    this.mostrarModalReceta = true;
  }

  cerrarModal(): void {
    this.mostrarModalReceta = false;
    this.recetaSeleccionadaId = null;
  }

  guardarReceta(): void {
    if (!this.formReceta.nombre.trim()) {
      alert('El nombre de la receta es obligatorio.');
      return;
    }

    if (this.modoEdicion && this.recetaSeleccionadaId) {
      this.recetasService.actualizarReceta(this.recetaSeleccionadaId, this.formReceta).subscribe({
        next: () => {
          alert('✅ Receta actualizada correctamente');
          this.cerrarModal();
          this.cargarRecetas();
        },
        error: (err) => {
          console.error('Error al actualizar receta:', err);
          alert('❌ Error al actualizar la receta.');
        }
      });
    } else {
      const payload = {
        ...this.formReceta,
        insumos: this.ingredientesNuevaReceta.map(i => ({ insumo_id: i.insumo_id, cantidad: i.cantidad }))
      };

      this.recetasService.crearReceta(payload).subscribe({
        next: () => {
          alert('✅ Receta creada correctamente con sus ingredientes');
          this.cerrarModal();
          this.cargarRecetas();
        },
        error: (err) => {
          console.error('Error al crear receta:', err);
          alert('❌ Error al crear la receta.');
        }
      });
    }
  }

  eliminarReceta(receta: Receta): void {
    if (!confirm(`¿Seguro que deseas eliminar la receta "${receta.nombre}"?`)) return;

    this.recetasService.eliminarReceta(receta.receta_id).subscribe({
      next: () => {
        alert('🗑️ Receta eliminada');
        this.cargarRecetas();
      },
      error: (err) => {
        console.error('Error al eliminar receta:', err);
        alert('❌ Error al eliminar la receta.');
      }
    });
  }

  /* =================== INGREDIENTES (selector compartido) =================== */

  resetSelectorIngrediente(): void {
    this.selectorInsumoId = null;
    this.selectorCantidad = 1;
  }

  // target indica a qué lista se agrega: la de "nueva receta" o la del "modal de versión"
  agregarIngrediente(target: 'nueva' | 'version'): void {
    if (!this.selectorInsumoId || this.selectorCantidad <= 0) {
      alert('Selecciona un insumo y una cantidad válida.');
      return;
    }

    const insumo = this.catalogoInsumos.find(i => i.insumo_id === this.selectorInsumoId);
    if (!insumo) return;

    const lista = target === 'nueva' ? this.ingredientesNuevaReceta : this.ingredientesVersion;

    const existente = lista.find(i => i.insumo_id === insumo.insumo_id);
    if (existente) {
      existente.cantidad += this.selectorCantidad;
    } else {
      lista.push({
        insumo_id: insumo.insumo_id,
        nombre_insumo: insumo.nombre_insumo,
        unidad_medida: insumo.unidad_medida,
        cantidad: this.selectorCantidad
      });
    }

    this.resetSelectorIngrediente();
  }

  quitarIngrediente(target: 'nueva' | 'version', index: number): void {
    const lista = target === 'nueva' ? this.ingredientesNuevaReceta : this.ingredientesVersion;
    lista.splice(index, 1);
  }

  crearInsumoRapido(target: 'nueva' | 'version'): void {
    if (!this.nuevoInsumoNombre.trim() || !this.nuevoInsumoUnidad.trim() || this.nuevoInsumoCosto < 0) {
      alert('Completa nombre, costo y unidad de medida del nuevo insumo.');
      return;
    }

    this.insumosService.crearInsumo({
      nombre_insumo: this.nuevoInsumoNombre,
      costo_unitario: this.nuevoInsumoCosto,
      unidad_medida: this.nuevoInsumoUnidad
    }).subscribe({
      next: (resp) => {
        const nuevo: Insumo = resp.insumo;
        this.catalogoInsumos.push(nuevo);
        this.selectorInsumoId = nuevo.insumo_id;
        this.nuevoInsumoNombre = '';
        this.nuevoInsumoCosto = 0;
        this.nuevoInsumoUnidad = '';
        alert(`✅ Insumo "${nuevo.nombre_insumo}" creado. Ahora puedes agregarlo a la receta.`);
      },
      error: (err) => {
        console.error('Error al crear insumo:', err);
        alert('❌ ' + (err?.error?.error || 'No se pudo crear el insumo.'));
      }
    });
  }

  /* =================== MODAL 2: GESTIONAR INGREDIENTES (nueva versión) =================== */

  abrirModalIngredientes(receta: Receta): void {
    this.recetaIngredientesId = receta.receta_id;
    this.recetaIngredientesNombre = receta.nombre;
    this.resetSelectorIngrediente();

    this.recetasService.obtenerRecetaPorId(receta.receta_id).subscribe({
      next: (detalle) => {
        this.numeroVersionActual = detalle.ultima_version?.numero_version || null;
        this.precioVentaActual = detalle.ultima_version?.precio_venta_sugerido || 0;
        this.ingredientesVersion = (detalle.insumos || []).map((i: any) => ({
          insumo_id: i.insumo_id,
          nombre_insumo: i.nombre_insumo,
          unidad_medida: i.unidad_medida,
          cantidad: Number(i.cantidad)
        }));
        this.mostrarModalIngredientes = true;
      },
      error: (err) => {
        console.error('Error al cargar el detalle de la receta:', err);
        alert('❌ No se pudo cargar el detalle de la receta.');
      }
    });
  }

  cerrarModalIngredientes(): void {
    this.mostrarModalIngredientes = false;
    this.recetaIngredientesId = null;
    this.ingredientesVersion = [];
  }

  private incrementarVersion(actual: string | null): string {
    if (!actual) return '1.0';
    const numero = parseFloat(actual);
    if (isNaN(numero)) return '1.0';
    return (numero + 0.1).toFixed(1);
  }

  guardarNuevaVersion(): void {
    if (!this.recetaIngredientesId) return;

    if (this.ingredientesVersion.length === 0) {
      alert('Agrega al menos un ingrediente antes de guardar la versión.');
      return;
    }

    const nuevoNumero = this.incrementarVersion(this.numeroVersionActual);

    const payload = {
      numero_version: nuevoNumero,
      precio_venta_sugerido: this.precioVentaActual,
      insumos: this.ingredientesVersion.map(i => ({ insumo_id: i.insumo_id, cantidad: i.cantidad }))
    };

    this.guardandoVersion = true;
    this.recetasService.crearVersion(this.recetaIngredientesId, payload).subscribe({
      next: () => {
        alert(`✅ Nueva versión ${nuevoNumero} creada con los ingredientes actualizados. Queda pendiente de aprobación.`);
        this.guardandoVersion = false;
        this.cerrarModalIngredientes();
        this.cargarRecetas();
      },
      error: (err) => {
        console.error('Error al crear la nueva versión:', err);
        alert('❌ ' + (err?.error?.error || 'No se pudo guardar la nueva versión.'));
        this.guardandoVersion = false;
      }
    });
  }

  /* =================== APROBAR VERSIÓN =================== */

  aprobarVersionReceta(receta: Receta): void {
    if (!receta.version_id) {
      alert('Esta receta no tiene una versión para aprobar.');
      return;
    }

    if (!confirm(`¿Aprobar la versión ${receta.numero_version} de "${receta.nombre}"? Quedará visible para los estudiantes que la tengan asignada.`)) {
      return;
    }

    this.recetasService.aprobarVersion(receta.version_id).subscribe({
      next: () => {
        alert('✅ Versión aprobada.');
        this.cargarRecetas();
      },
      error: (err) => {
        console.error('Error al aprobar la versión:', err);
        alert('❌ No se pudo aprobar la versión.');
      }
    });
  }

  /* =================== MODAL 3: ASIGNAR A ESTUDIANTE =================== */

  abrirModalAsignar(receta: Receta): void {
    this.recetaAsignarId = receta.receta_id;
    this.recetaAsignarNombre = receta.nombre;
    this.estudianteSeleccionadoId = null;
    this.mostrarModalAsignar = true;
  }

  cerrarModalAsignar(): void {
    this.mostrarModalAsignar = false;
    this.recetaAsignarId = null;
  }

  confirmarAsignacion(): void {
    if (!this.recetaAsignarId || !this.estudianteSeleccionadoId) {
      alert('Selecciona un estudiante.');
      return;
    }

    this.asignando = true;
    this.recetasService.asignarReceta(this.recetaAsignarId, this.estudianteSeleccionadoId).subscribe({
      next: (resp) => {
        alert('✅ ' + (resp?.message || 'Receta asignada.'));
        this.asignando = false;
        this.cerrarModalAsignar();
      },
      error: (err) => {
        console.error('Error al asignar receta:', err);
        alert('❌ No se pudo asignar la receta.');
        this.asignando = false;
      }
    });
  }
}
