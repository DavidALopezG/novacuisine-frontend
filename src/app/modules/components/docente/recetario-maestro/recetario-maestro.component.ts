import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecetasService } from '../../../../services/recetas/recetas.service';
import { AsignaturasService } from '../../../../services/asignaturas/asignaturas.service';
import { InsumosService } from '../../../../services/insumos/insumos.service';
import { EstudiantesService } from '../../../../services/estudiantes/estudiantes.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

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
  imports: [CommonModule, FormsModule, SpinnerComponent],
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

  searchTerm = '';
  categoriaSeleccionada = 'Todas';

  // ── MODAL 1: Crear / Editar receta ──────────────────────
  mostrarModalReceta = false;
  modoEdicion = false;
  recetaSeleccionadaId: number | null = null;

  formReceta = {
    nombre: '',
    porciones: 1,
    tiempo_prep_min: 0,
    asignatura_id: null as number | null
  };

  ingredientesNuevaReceta: IngredienteForm[] = [];

  // ── Selector compartido de ingredientes ─────────────────
  selectorInsumoId: number | null = null;
  selectorCantidad: number = 1;

  nuevoInsumoNombre = '';
  nuevoInsumoCosto = 0;
  nuevoInsumoUnidad = '';

  // ── MODAL 2: Gestionar ingredientes (nueva versión) ──────
  mostrarModalIngredientes = false;
  recetaIngredientesId: number | null = null;
  recetaIngredientesNombre = '';
  numeroVersionActual: string | null = null;
  precioVentaActual = 0;
  ingredientesVersion: IngredienteForm[] = [];
  guardandoVersion = false;

  // ── MODAL 3: Asignar receta a estudiante ─────────────────
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
  , private notif: NotificacionService) {}

  ngOnInit(): void {
    this.cargarAsignaturas();
    this.cargarRecetas();
    this.cargarCatalogoInsumos();
    this.cargarEstudiantes();
  }

  // ─────────────────── CARGA DE DATOS ─────────────────────

  cargarRecetas(): void {
    this.loading = true;
    this.error = null;
    this.recetasService.obtenerRecetas().subscribe({
      next: (data: Receta[]) => { this.recetas = data; this.loading = false; },
      error: () => { this.error = 'No se pudieron cargar las recetas.'; this.loading = false; }
    });
  }

  cargarAsignaturas(): void {
    this.asignaturasService.obtenerAsignaturas().subscribe({
      next: (data) => (this.asignaturas = data),
      error: (err) => console.error('Error asignaturas:', err)
    });
  }

  cargarCatalogoInsumos(): void {
    this.insumosService.obtenerInsumos().subscribe({
      next: (data) => (this.catalogoInsumos = data),
      error: (err) => console.error('Error insumos:', err)
    });
  }

  cargarEstudiantes(): void {
    this.estudiantesService.getEstudiantes().subscribe({
      next: (data) => (this.estudiantes = data),
      error: (err) => console.error('Error estudiantes:', err)
    });
  }

  // ─────────────────── FILTRO ─────────────────────────────

  get recetasFiltradas(): Receta[] {
    return this.recetas.filter(r => {
      const b = r.nombre.toLowerCase().includes(this.searchTerm.toLowerCase());
      const c = this.categoriaSeleccionada === 'Todas' || r.nombre_asignatura === this.categoriaSeleccionada;
      return b && c;
    });
  }

  // ─────────────────── MODAL 1 ────────────────────────────

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
    this.ingredientesNuevaReceta = [];   // ← limpiar siempre al cerrar
    this.resetSelectorIngrediente();
  }

  guardarReceta(): void {
    if (!this.formReceta.nombre.trim()) {
      this.notif.info('El nombre de la receta es obligatorio.');
      return;
    }

    if (this.modoEdicion && this.recetaSeleccionadaId) {
      this.recetasService.actualizarReceta(this.recetaSeleccionadaId, this.formReceta).subscribe({
        next: () => { this.notif.exito('Receta actualizada correctamente'); this.cerrarModal(); this.cargarRecetas(); },
        error: () => this.notif.error('Error al actualizar la receta.')
      });
    } else {
      // ─── BUG FIX: si quedó algo seleccionado en el selector sin presionar "+",
      //     lo agregamos automáticamente antes de guardar
      if (this.selectorInsumoId) {
        this.agregarIngrediente('nueva');
      }

      const payload = {
        ...this.formReceta,
        insumos: this.ingredientesNuevaReceta.map(i => ({ insumo_id: i.insumo_id, cantidad: i.cantidad }))
      };

      this.recetasService.crearReceta(payload).subscribe({
        next: (resp) => {
          const total = resp?.message || 'Receta creada correctamente';
          this.notif.exito(total);
          this.cerrarModal();
          this.cargarRecetas();
        },
        error: () => this.notif.error('Error al crear la receta.')
      });
    }
  }

  eliminarReceta(receta: Receta): void {
    if (!confirm(`¿Seguro que deseas eliminar la receta "${receta.nombre}"?`)) return;
    this.recetasService.eliminarReceta(receta.receta_id).subscribe({
      next: () => { this.notif.info('Receta eliminada'); this.cargarRecetas(); },
      error: () => this.notif.error('Error al eliminar la receta.')
    });
  }

  // ─────────────────── INGREDIENTES ───────────────────────

  resetSelectorIngrediente(): void {
    this.selectorInsumoId = null;
    this.selectorCantidad = 1;
  }

  agregarIngrediente(target: 'nueva' | 'version'): void {
    // ── BUG FIX: convertir a número para evitar comparación estricta string vs number
    const idNum = Number(this.selectorInsumoId);
    const cantNum = Number(this.selectorCantidad);

    if (!idNum || cantNum <= 0) {
      this.notif.info('Selecciona un insumo y una cantidad mayor a 0.');
      return;
    }

    // ── BUG FIX: buscar por Number() para que 5 === "5" no sea un problema
    const insumo = this.catalogoInsumos.find(i => Number(i.insumo_id) === idNum);
    if (!insumo) {
      this.notif.info('Insumo no encontrado en el catálogo. Recarga la página e intenta de nuevo.');
      return;
    }

    const lista = target === 'nueva' ? this.ingredientesNuevaReceta : this.ingredientesVersion;

    const existente = lista.find(i => Number(i.insumo_id) === idNum);
    if (existente) {
      existente.cantidad = Number((existente.cantidad + cantNum).toFixed(3));
    } else {
      lista.push({
        insumo_id: insumo.insumo_id,
        nombre_insumo: insumo.nombre_insumo,
        unidad_medida: insumo.unidad_medida,
        cantidad: cantNum
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
      this.notif.info('Completa nombre, costo y unidad de medida del nuevo insumo.');
      return;
    }
    this.insumosService.crearInsumo({
      nombre_insumo: this.nuevoInsumoNombre,
      costo_unitario: this.nuevoInsumoCosto,
      unidad_medida: this.nuevoInsumoUnidad
    }).subscribe({
      next: (resp) => {
        const nuevo: Insumo = resp.insumo;
        this.catalogoInsumos = [...this.catalogoInsumos, nuevo]; // nueva referencia para CD
        this.selectorInsumoId = nuevo.insumo_id;
        this.nuevoInsumoNombre = '';
        this.nuevoInsumoCosto = 0;
        this.nuevoInsumoUnidad = '';
        this.notif.exito(`Insumo "${nuevo.nombre_insumo}" creado y seleccionado.`);
      },
      error: (err) => this.notif.error(err?.error?.error || 'No se pudo crear el insumo.')
    });
  }

  // ─────────────────── MODAL 2 ────────────────────────────

  abrirModalIngredientes(receta: Receta): void {
    this.recetaIngredientesId = receta.receta_id;
    this.recetaIngredientesNombre = receta.nombre;
    this.resetSelectorIngrediente();

    this.recetasService.obtenerRecetaPorId(receta.receta_id).subscribe({
      next: (detalle) => {
        this.numeroVersionActual = detalle.ultima_version?.numero_version || null;
        this.precioVentaActual = detalle.ultima_version?.precio_venta_sugerido || 0;
        this.ingredientesVersion = (detalle.insumos || []).map((i: any) => ({
          insumo_id: Number(i.insumo_id),
          nombre_insumo: i.nombre_insumo,
          unidad_medida: i.unidad_medida,
          cantidad: Number(i.cantidad)
        }));
        this.mostrarModalIngredientes = true;
      },
      error: () => this.notif.error('No se pudo cargar el detalle de la receta.')
    });
  }

  cerrarModalIngredientes(): void {
    this.mostrarModalIngredientes = false;
    this.recetaIngredientesId = null;
    this.ingredientesVersion = [];
  }

  private incrementarVersion(actual: string | null): string {
    if (!actual) return '1.0';
    const n = parseFloat(actual);
    return isNaN(n) ? '1.0' : (n + 0.1).toFixed(1);
  }

  guardarNuevaVersion(): void {
    if (!this.recetaIngredientesId) return;

    // Auto-agregar si quedó algo en el selector
    if (this.selectorInsumoId) {
      this.agregarIngrediente('version');
    }

    if (this.ingredientesVersion.length === 0) {
      this.notif.info('Agrega al menos un ingrediente antes de guardar la versión.');
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
        this.notif.exito(`Versión ${nuevoNumero} creada con ${this.ingredientesVersion.length} ingrediente(s). Pendiente de aprobación.`);
        this.guardandoVersion = false;
        this.cerrarModalIngredientes();
        this.cargarRecetas();
      },
      error: (err) => {
        this.notif.error(err?.error?.error || 'No se pudo guardar la nueva versión.');
        this.guardandoVersion = false;
      }
    });
  }

  // ─────────────────── APROBAR VERSIÓN ────────────────────

  aprobarVersionReceta(receta: Receta): void {
    if (!receta.version_id) {
      this.notif.info('Esta receta no tiene una versión para aprobar.');
      return;
    }
    if (!confirm(`¿Aprobar versión ${receta.numero_version} de "${receta.nombre}"? Quedará visible para los estudiantes.`)) return;

    this.recetasService.aprobarVersion(receta.version_id).subscribe({
      next: () => { this.notif.exito('Versión aprobada.'); this.cargarRecetas(); },
      error: () => this.notif.error('No se pudo aprobar la versión.')
    });
  }

  // ─────────────────── MODAL 3 ────────────────────────────

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
      this.notif.info('Selecciona un estudiante.');
      return;
    }
    this.asignando = true;
    this.recetasService.asignarReceta(this.recetaAsignarId, this.estudianteSeleccionadoId).subscribe({
      next: (resp) => { this.notif.exito('' + (resp?.message || 'Receta asignada.')); this.asignando = false; this.cerrarModalAsignar(); },
      error: () => { this.notif.error('No se pudo asignar la receta.'); this.asignando = false; }
    });
  }
}
