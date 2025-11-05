import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router'; // 👈 Asegúrate de que esta línea esté presente

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

  constructor(private fb: FormBuilder,
     private authService: AuthService,
     private router: Router // 🔑 CORRECCIÓN CLAVE: Inyectar el servicio Router
  ) {
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group({
      usuario_id: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(10), Validators.maxLength(10)]], // Ajusta min/max length según el formato de cédula en Ecuador (10 dígitos)
      nombre_completo: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      rol_id: ['', [Validators.required]]
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
                    console.log('✅ Login exitoso:', res);
                    alert('Inicio de sesión exitoso');
                    
                    localStorage.setItem('token', res.token);
                    
    const userRole = this.authService.getRoleFromToken(); // Obtener el rol desde el servicio                    
                    // 🔑 Esto ahora funcionará porque 'this.router' existe
                    if (userRole === 1) {
                        this.router.navigate(['/dashboard/admin']); 
                    } else if (userRole === 2) {
                        this.router.navigate(['/dashboard/docente']);
                    } else {
                        this.router.navigate(['/']);
                    }
                },
                error: (err) => {
                    console.error('❌ Error en login:', err);
                    alert(err.error?.error || 'Error al iniciar sesión');
                }
            });
        }
        // 🔑 CORRECCIÓN 2: Se eliminó el bloque 'onLogin' duplicado que estaba aquí
      }

  onRegister(): void {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      this.authService.register(registerData).subscribe({
        next: (res) => {
          console.log('✅ Usuario registrado:', res);
          alert('Usuario creado correctamente');
          this.togglePanel(false);
          this.registerForm.reset();
        },
        error: (err) => {
          console.error('❌ Error en registro:', err);
          alert(err.error?.error || 'Error al registrar usuario');
        }
      });
    }
  }
}
