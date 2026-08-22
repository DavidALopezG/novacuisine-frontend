import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { UsuariosService } from '../../../../services/usuarios/usuarios.service';
import { TitulacionesService } from '../../../../services/titulaciones/titulaciones.service';
import { NotificacionService } from '../../../../services/notificacion/notificacion.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';

import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SpinnerComponent,
    TableModule,
    TagModule,
    ButtonModule,
    DialogModule,
    ToolbarModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    PasswordModule,
    ToggleSwitchModule,
    MessageModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './usuarios-form.component.html',
  styleUrls: ['./usuarios-form.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios: any[] = [];
  usuarioForm!: FormGroup;
  mostrarForm = false;
  editando = false;
  usuarioSeleccionadoId: string | null = null;

  loading = false;
  error: string | null = null;

  // Filtros básicos de la tabla
  filtroTexto = '';
  filtroRol = 'Todos';

  rolOptions = [
    { label: 'Administrador', value: 1 },
    { label: 'Profesor', value: 2 },
    { label: 'Estudiante', value: 3 }
  ];

  filtroRolOptions = [
    { label: 'Todos los roles', value: 'Todos' },
    { label: 'Administrador', value: 'Administrador' },
    { label: 'Profesor', value: 'Profesor' },
    { label: 'Estudiante', value: 'Estudiante' }
  ];

  // Catálogo de titulaciones (solo se usa cuando el rol elegido es Estudiante)
  titulaciones: any[] = [];

  get titulacionOptions(): { label: string; value: number }[] {
    return this.titulaciones.map(t => ({ label: t.nombre_titulacion, value: t.titulacion_id }));
  }

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private titulacionesService: TitulacionesService,
    private notif: NotificacionService,
    private confirmacion: ConfirmationService
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
    this.loading = true;
    this.error = null;

    this.usuariosService.getUsuarios().subscribe({
      next: (res) => {
        this.usuarios = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.error = 'Ocurrió un error al cargar la lista de usuarios. Intente de nuevo.';
        this.loading = false;
      }
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
      this.notif.advertencia('Debes asignar una contraseña inicial para el nuevo usuario.');
      return;
    }

    if (this.editando && this.usuarioSeleccionadoId) {
      this.usuariosService.updateUsuario(
        this.usuarioSeleccionadoId,
        this.usuarioForm.value
      ).subscribe({
        next: () => {
          this.notif.exito('Usuario actualizado correctamente');
          this.cargarUsuarios();
          this.cerrarFormulario();
        },
        error: (err) => this.notif.error(err?.error?.error || 'No se pudo actualizar el usuario.')
      });
    } else {
      this.usuariosService.createUsuario(this.usuarioForm.value).subscribe({
        next: (resp) => {
          this.notif.exito(resp?.message || 'Usuario creado correctamente');
          this.cargarUsuarios();
          this.cerrarFormulario();
        },
        error: (err) => this.notif.error(err?.error?.error || 'No se pudo crear el usuario.')
      });
    }
  }

  // Activa o desactiva un usuario directamente desde la tabla (sin abrir el modal)
  toggleActivo(usuario: any) {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    this.confirmacion.confirm({
      header: usuario.activo ? 'Desactivar usuario' : 'Activar usuario',
      message: `¿Seguro que deseas ${accion} a ${usuario.nombre_completo}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: usuario.activo ? 'Desactivar' : 'Activar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: usuario.activo ? 'p-button-danger' : 'p-button-success',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.usuariosService.updateUsuario(usuario.usuario_id, {
          nombre_completo: usuario.nombre_completo,
          email: usuario.email,
          rol_id: usuario.rol_id,
          activo: !usuario.activo
        }).subscribe({
          next: () => {
            this.notif.exito(`Usuario ${usuario.activo ? 'desactivado' : 'activado'} correctamente`);
            this.cargarUsuarios();
          },
          error: (err) => this.notif.error(err?.error?.error || 'No se pudo cambiar el estado del usuario.')
        });
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

  rolSeverity(rolId: number): 'danger' | 'warn' | 'info' | 'secondary' {
    switch (rolId) {
      case 1: return 'danger';   // Administrador
      case 2: return 'warn';     // Profesor
      case 3: return 'info';     // Estudiante
      default: return 'secondary';
    }
  }
}
