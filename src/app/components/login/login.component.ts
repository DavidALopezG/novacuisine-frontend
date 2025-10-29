import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  isRightPanelActive = false;
  loginForm: FormGroup;
  registerForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {}

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePanel(isRightActive: boolean): void {
    this.isRightPanelActive = isRightActive;
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;
      console.log('Datos de login:', loginData);
      // Aquí llamarías a tu servicio de autenticación
      // this.authService.login(loginData.email, loginData.password);
    }
  }

  onRegister(): void {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value;
      console.log('Datos de registro:', registerData);
      // Aquí llamarías a tu servicio de registro
      // this.authService.register(registerData);
    }
  }

}
