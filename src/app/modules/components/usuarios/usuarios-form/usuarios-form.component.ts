import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios: any[] = [];
  usuarioForm!: FormGroup;
  mostrarForm = false;
  editando = false;
  usuarioSeleccionadoId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarUsuarios();
  }

  inicializarFormulario() {
    this.usuarioForm = this.fb.group({
      usuario_id: ['', Validators.required],
      nombre_completo: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      rol_id: [1, Validators.required],
      activo: [true]
    });
  }

  cargarUsuarios() {
    this.usuariosService.getUsuarios().subscribe({
      next: (res) => (this.usuarios = res),
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  editarUsuario(usuario: any) {
    this.mostrarForm = true;
    this.editando = true;
    this.usuarioSeleccionadoId = usuario.usuario_id;

    this.usuarioForm.patchValue({
      usuario_id: usuario.usuario_id,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      rol_id: usuario.rol_id,
      activo: usuario.activo
    });
  }

  guardarUsuario() {
    if (!this.usuarioForm.valid) return;

    if (this.editando && this.usuarioSeleccionadoId) {
      this.usuariosService.updateUsuario(
        this.usuarioSeleccionadoId,
        this.usuarioForm.value
      ).subscribe({
        next: () => {
          alert('Usuario actualizado correctamente');
          this.cargarUsuarios();
          this.cerrarFormulario();
        }
      });
    } else {
      this.usuariosService.createUsuario(this.usuarioForm.value).subscribe({
        next: () => {
          alert('Usuario creado correctamente');
          this.cargarUsuarios();
          this.cerrarFormulario();
        }
      });
    }
  }

  eliminarUsuario(id: number) {
    if (!confirm('¿Seguro deseas eliminar este usuario?')) return;

    this.usuariosService.deleteUsuario(id).subscribe({
      next: () => {
        alert('Usuario eliminado');
        this.cargarUsuarios();
      }
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
