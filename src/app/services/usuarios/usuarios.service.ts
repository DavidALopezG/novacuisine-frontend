import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private apiUrl = 'http://localhost:3000/api/usuarios'; // tu backend

  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  createUsuario(usuario: Usuario): Observable<any> {
    return this.http.post(this.apiUrl, usuario);
  }

  updateUsuario(id: number, usuario: Usuario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, usuario);
  }

  deleteUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
