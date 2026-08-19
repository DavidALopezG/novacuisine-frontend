import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { NotificacionService } from '../../../services/notificacion/notificacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  isRightPanelActive = false;
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notif: NotificacionService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      usuario_id: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)]],
      nombre_completo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const contrasena = control.get('contrasena');
    const confirmPassword = control.get('confirmPassword');
    if (!contrasena || !confirmPassword) return null;
    return contrasena.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePanel(isRightActive: boolean): void {
    this.isRightPanelActive = isRightActive;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { email, contrasena } = this.loginForm.value;
      this.authService.login(email, contrasena).subscribe({
        next: (res) => {
          this.notif.exito('Inicio de sesión exitoso');
          localStorage.setItem('token', res.token);
          const nombreCompleto = res.nombre_completo || res.usuario?.nombre || res.usuario?.nombre_completo || '';
          localStorage.setItem('nombre_completo', nombreCompleto);
          
          const userRole = this.authService.getRoleFromToken();
          if (userRole !== null) {
            localStorage.setItem('user_role', String(userRole));
          }

          this.router.navigate(['/dashboard/inicio']);
        },
        error: (err) => {
          console.error('❌ Error en login:', err);
          this.notif.error(err.error?.error || 'Error al iniciar sesión');
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const registerData = {
        usuario_id: this.registerForm.value.usuario_id,
        nombre_completo: this.registerForm.value.nombre_completo,
        email: this.registerForm.value.email,
        contrasena: this.registerForm.value.contrasena,
        activo: true
      };
      this.authService.register(registerData).subscribe({
        next: (res) => {
          this.notif.exito('Usuario creado correctamente');
          this.togglePanel(false);
          this.registerForm.reset();
        },
        error: (err) => {
          console.error('❌ Error en registro:', err);
          this.notif.error(err.error?.error || 'Error al registrar usuario');
        }
      });
    }
  }
}
