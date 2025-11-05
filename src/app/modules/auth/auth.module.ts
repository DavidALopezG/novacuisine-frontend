import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // ✅ Asegúrate de importar esto
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule, // ✅ FALTABA ESTA LÍNEA - Agrégalo aquí
    LoginComponent // ✅ Importing the standalone component here
  ],
  exports: [
  ]
})
export class AuthModule { }
