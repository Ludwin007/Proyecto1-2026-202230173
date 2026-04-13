import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { SesionUsuario } from '../modelos/modelos';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private url = `${environment.apiUrl}/auth`;
  private usuarioSubject = new BehaviorSubject<SesionUsuario | null>(this.cargarSesion());
  public usuario$ = this.usuarioSubject.asObservable();

  constructor(private http: HttpClient) {}

  private cargarSesion(): SesionUsuario | null {
    const datos = sessionStorage.getItem('usuario');
    return datos ? JSON.parse(datos) : null;
  }

  login(nombreUsuario: string, contrasena: string): Observable<SesionUsuario> {
    return this.http.post<SesionUsuario>(`${this.url}/login`,
      { usuario: nombreUsuario, contrasena }).pipe(
      tap(usuario => {
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
        this.usuarioSubject.next(usuario);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.url}/logout`, {}, { headers: this.getHeaders() }).pipe(
      tap(() => {
        sessionStorage.removeItem('usuario');
        this.usuarioSubject.next(null);
      })
    );
  }

  get usuarioActual(): SesionUsuario | null {
    return this.usuarioSubject.value;
  }

  estaLogueado(): boolean {
    return this.usuarioSubject.value !== null;
  }

  esAdmin(): boolean {
    return this.usuarioSubject.value?.idRol === 3;
  }

  esOperaciones(): boolean {
    return this.usuarioSubject.value?.idRol === 2;
  }

  esAtencionCliente(): boolean {
    return this.usuarioSubject.value?.idRol === 1;
  }

  tieneRol(...roles: number[]): boolean {
    const rol = this.usuarioSubject.value?.idRol;
    return rol !== undefined && roles.includes(rol);
  }

  getHeaders(): { [key: string]: string } {
    const usuario = this.usuarioActual;
    if (usuario) {
      return {
        'X-Usuario-Id': usuario.id.toString(),
        'X-Usuario-Rol': usuario.idRol.toString()
      };
    }
    return {};
  }
}