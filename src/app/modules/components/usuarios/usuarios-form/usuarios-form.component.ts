import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { TitulacionesService } from '../../../../services/titulaciones/titulaciones.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios: any[] = [];
  usuarioForm!: FormGroup;
  mostrarForm = false;
  editando = false;
  usuarioSeleccionadoId: string | null = null;

  // Filtros básicos de la tabla
  filtroTexto: string = '';
  filtroRol: string = 'Todos';

  // Catálogo de titulaciones (solo se usa cuando el rol elegido es Estudiante)
  titulaciones: any[] = [];

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private titulacionesService: TitulacionesService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarUsuarios();
    this.cargarTitulaciones();
  }

  cargarTitulaciones(): void {
    this.titulacionesService.obtenerTitulaciones().subscribe({
      next: (data) => (this.titulaciones = data),
      error: (err) => console.error('Error al cargar titulaciones:', err)
    });
  }

  inicializarFormulario() {
    this.usuarioForm = this.fb.group({
      usuario_id: ['', Validators.required],
      nombre_completo: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: [''], // obligatoria solo al crear; vacía en edición = no se cambia
      rol_id: [1, Validators.required],
      titulacion_id: [null], // solo aplica si rol_id = 3 (Estudiante)
      activo: [true]
    });
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (res) => (this.usuarios = res),
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  // Lista filtrada que se muestra en la tabla
  get usuariosFiltrados(): any[] {
    return this.usuarios.filter(u => {
      const coincideTexto =
        u.nombre_completo?.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        u.email?.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        String(u.usuario_id).toLowerCase().includes(this.filtroTexto.toLowerCase());

      const coincideRol = this.filtroRol === 'Todos' || this.obtenerRolNombre(u.rol_id) === this.filtroRol;

      return coincideTexto && coincideRol;
    });
  }

  abrirModalNuevoUsuario() {
    this.editando = false;
    this.usuarioSeleccionadoId = null;
    this.usuarioForm.reset({ rol_id: 1, activo: true });
    this.mostrarForm = true;
  }

  editarUsuario(usuario: any) {
    this.mostrarForm = true;
    this.editando = true;
    this.usuarioSeleccionadoId = usuario.usuario_id;

    this.usuarioForm.patchValue({
      usuario_id: usuario.usuario_id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      contrasena: '',
      rol_id: usuario.rol_id,
      activo: usuario.activo
    });
  }

  guardarUsuario() {
    if (!this.usuarioForm.valid) return;

    if (!this.editando && !this.usuarioForm.value.contrasena?.trim()) {
      alert('Debes asignar una contraseña inicial para el nuevo usuario.');
      return;
    }

    if (this.editando && this.usuarioSeleccionadoId) {
      this.usuariosService.updateUsuario(
        this.usuarioSeleccionadoId,
        this.usuarioForm.value
      ).subscribe({
        next: () => {
          alert('Usuario actualizado correctamente');
          this.cargarUsuarios();
          this.cerrarFormulario();
        },
        error: (err) => alert('❌ ' + (err?.error?.error || 'No se pudo actualizar el usuario.'))
      });
    } else {
      this.usuariosService.createUsuario(this.usuarioForm.value).subscribe({
        next: (resp) => {
          alert('✅ ' + (resp?.message || 'Usuario creado correctamente'));
          this.cargarUsuarios();
          this.cerrarFormulario();
        },
        error: (err) => alert('❌ ' + (err?.error?.error || 'No se pudo crear el usuario.'))
      });
    }
  }

  // Activa o desactiva un usuario directamente desde la tabla (sin abrir el modal)
  toggleActivo(usuario: any) {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Seguro que deseas ${accion} a ${usuario.nombre_completo}?`)) return;

    this.usuariosService.updateUsuario(usuario.usuario_id, {
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      rol_id: usuario.rol_id,
      activo: !usuario.activo
    }).subscribe({
      next: () => {
        this.cargarUsuarios();
      },
      error: (err) => alert('❌ ' + (err?.error?.error || 'No se pudo cambiar el estado del usuario.'))
    });
  }

  cerrarFormulario() {
    this.mostrarForm = false;
    this.usuarioForm.reset();
    this.editando = false;
    this.usuarioSeleccionadoId = null;
  }

  obtenerRolNombre(rolId: number) {
    switch (rolId) {
      case 1: return 'Administrador';
      case 2: return 'Profesor';
      case 3: return 'Estudiante';
      default: return 'Desconocido';
    }
  }
}
