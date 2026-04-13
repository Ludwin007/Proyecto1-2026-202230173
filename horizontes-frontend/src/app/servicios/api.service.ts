import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Usuario, Destino, Proveedor, Paquete, ServicioPaquete,
  Cliente, Reservacion, Pago, ResultadoCarga
} from '../modelos/modelos';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UsuarioApiService {
  private url = `${environment.apiUrl}/usuarios`;
  constructor(private http: HttpClient, private auth: AuthService) {}
  listar(): Observable<Usuario[]> { return this.http.get<Usuario[]>(this.url, { headers: this.auth.getHeaders() }); }
  crear(u: Usuario): Observable<any> { return this.http.post(this.url, u, { headers: this.auth.getHeaders() }); }
  cambiarRol(id: number, idRol: number): Observable<any> { return this.http.put(`${this.url}/${id}`, { idRol }, { headers: this.auth.getHeaders() }); }
  desactivar(id: number): Observable<any> { return this.http.delete(`${this.url}/${id}`, { headers: this.auth.getHeaders() }); }
  activar(id: number): Observable<any> { 
  return this.http.put(`${this.url}/${id}`, { activar: true }, { headers: this.auth.getHeaders() }); 
}
}

@Injectable({ providedIn: 'root' })
export class DestinoApiService {
  private url = `${environment.apiUrl}/destinos`;
  constructor(private http: HttpClient, private auth: AuthService) {}
  listar(): Observable<Destino[]> { return this.http.get<Destino[]>(this.url, { headers: this.auth.getHeaders() }); }
  obtener(id: number): Observable<Destino> { return this.http.get<Destino>(`${this.url}/${id}`, { headers: this.auth.getHeaders() }); }
  crear(d: Destino): Observable<any> { return this.http.post(this.url, d, { headers: this.auth.getHeaders() }); }
  actualizar(id: number, d: Destino): Observable<any> { return this.http.put(`${this.url}/${id}`, d, { headers: this.auth.getHeaders() }); }
  eliminar(id: number): Observable<any> { return this.http.delete(`${this.url}/${id}`, { headers: this.auth.getHeaders() }); }
}

@Injectable({ providedIn: 'root' })
export class ProveedorApiService {
  private url = `${environment.apiUrl}/proveedores`;
  constructor(private http: HttpClient, private auth: AuthService) {}
  listar(): Observable<Proveedor[]> { return this.http.get<Proveedor[]>(this.url, { headers: this.auth.getHeaders() }); }
  obtener(id: number): Observable<Proveedor> { return this.http.get<Proveedor>(`${this.url}/${id}`, { headers: this.auth.getHeaders() }); }
  crear(p: Proveedor): Observable<any> { return this.http.post(this.url, p, { headers: this.auth.getHeaders() }); }
  actualizar(id: number, p: Proveedor): Observable<any> { return this.http.put(`${this.url}/${id}`, p, { headers: this.auth.getHeaders() }); }
}

@Injectable({ providedIn: 'root' })
export class PaqueteApiService {
  private url = `${environment.apiUrl}/paquetes`;
  constructor(private http: HttpClient, private auth: AuthService) {}
  listar(soloActivos = false): Observable<Paquete[]> {
    const params = soloActivos ? new HttpParams().set('activos', 'true') : new HttpParams();
    return this.http.get<Paquete[]>(this.url, { params, headers: this.auth.getHeaders() });
  }
  listarPorDestino(idDestino: number): Observable<Paquete[]> {
    return this.http.get<Paquete[]>(this.url, { params: new HttpParams().set('destino', idDestino), headers: this.auth.getHeaders() });
  }
  obtener(id: number): Observable<Paquete> { return this.http.get<Paquete>(`${this.url}/${id}`, { headers: this.auth.getHeaders() }); }
  crear(p: any): Observable<any> { return this.http.post(this.url, p, { headers: this.auth.getHeaders() }); }
  actualizar(id: number, p: Paquete): Observable<any> { return this.http.put(`${this.url}/${id}`, p, { headers: this.auth.getHeaders() }); }
  desactivar(id: number): Observable<any> { return this.http.put(`${this.url}/${id}/desactivar`, {}, { headers: this.auth.getHeaders() }); }
  agregarServicio(idPaquete: number, sp: ServicioPaquete): Observable<any> { return this.http.post(`${this.url}/${idPaquete}/servicio`, sp, { headers: this.auth.getHeaders() }); }
  alertas(): Observable<any[]> { return this.http.get<any[]>(`${this.url}/alerta`, { headers: this.auth.getHeaders() }); }
  listarActivos(): Observable<Paquete[]> { return this.listar(true); }
}

@Injectable({ providedIn: 'root' })
export class ClienteApiService {
  private url = `${environment.apiUrl}/clientes`;
  constructor(private http: HttpClient, private auth: AuthService) {}
  listar(): Observable<Cliente[]> { return this.http.get<Cliente[]>(this.url, { headers: this.auth.getHeaders() }); }
  obtener(id: number): Observable<Cliente> { return this.http.get<Cliente>(`${this.url}/${id}`, { headers: this.auth.getHeaders() }); }
  buscarPorDpi(dpi: string): Observable<Cliente> { return this.http.get<Cliente>(this.url, { params: new HttpParams().set('dpi', dpi), headers: this.auth.getHeaders() }); }
  buscarPorNombre(nombre: string): Observable<Cliente[]> { return this.http.get<Cliente[]>(this.url, { params: new HttpParams().set('nombre', nombre), headers: this.auth.getHeaders() }); }
  historialReservaciones(id: number): Observable<Reservacion[]> { return this.http.get<Reservacion[]>(`${environment.apiUrl}/clientes/${id}/reservaciones`, { headers: this.auth.getHeaders() }); }
  crear(c: Cliente): Observable<any> { return this.http.post(this.url, c, { headers: this.auth.getHeaders() }); }
  actualizar(id: number, c: Cliente): Observable<any> { return this.http.put(`${this.url}/${id}`, c, { headers: this.auth.getHeaders() }); }
}

@Injectable({ providedIn: 'root' })
export class ReservacionApiService {
  private url = `${environment.apiUrl}/reservaciones`;
  constructor(private http: HttpClient, private auth: AuthService) {}
  listar(inicio?: string, fin?: string, estado?: string): Observable<Reservacion[]> {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fin) params = params.set('fin', fin);
    if (estado) params = params.set('estado', estado);
    return this.http.get<Reservacion[]>(this.url, { params, headers: this.auth.getHeaders() });
  }
  listarDelDia(): Observable<Reservacion[]> {
    return this.http.get<Reservacion[]>(this.url, { params: new HttpParams().set('tipo', 'hoy'), headers: this.auth.getHeaders() });
  }
  obtener(numero: string): Observable<Reservacion> { return this.http.get<Reservacion>(`${this.url}/${numero}`, { headers: this.auth.getHeaders() }); }
  crear(r: any): Observable<any> { return this.http.post(this.url, r, { headers: this.auth.getHeaders() }); }
  actualizarEstado(numero: string, estado: string): Observable<any> { return this.http.put(`${this.url}/${numero}`, { estado }, { headers: this.auth.getHeaders() }); }
  registrarPago(numero: string, pago: any): Observable<any> { return this.http.post(`${this.url}/${numero}/pago`, pago, { headers: this.auth.getHeaders() }); }
  cancelar(numero: string): Observable<any> { return this.http.post(`${this.url}/${numero}/cancelar`, {}, { headers: this.auth.getHeaders() }); }
  historialPagos(numero: string): Observable<Pago[]> { return this.http.get<Pago[]>(`${this.url}/${numero}/pagos`, { headers: this.auth.getHeaders() }); }
  historialReservaciones(idCliente: number): Observable<Reservacion[]> { return this.http.get<Reservacion[]>(`${environment.apiUrl}/clientes/${idCliente}/reservaciones`, { headers: this.auth.getHeaders() }); }
}

@Injectable({ providedIn: 'root' })
export class ReporteApiService {
  private url = `${environment.apiUrl}/reportes`;
  constructor(private http: HttpClient, private auth: AuthService) {}
  private params(inicio?: string, fin?: string): HttpParams {
    let p = new HttpParams();
    if (inicio) p = p.set('inicio', inicio);
    if (fin) p = p.set('fin', fin);
    return p;
  }
  ventas(inicio?: string, fin?: string): Observable<any[]> { return this.http.get<any[]>(`${this.url}/ventas`, { params: this.params(inicio, fin), headers: this.auth.getHeaders() }); }
  cancelaciones(inicio?: string, fin?: string): Observable<any[]> { return this.http.get<any[]>(`${this.url}/cancelaciones`, { params: this.params(inicio, fin), headers: this.auth.getHeaders() }); }
  ganancias(inicio?: string, fin?: string): Observable<any> { return this.http.get<any>(`${this.url}/ganancias`, { params: this.params(inicio, fin), headers: this.auth.getHeaders() }); }
  agenteMasVentas(inicio?: string, fin?: string): Observable<any> { return this.http.get<any>(`${this.url}/agente-mas-ventas`, { params: this.params(inicio, fin), headers: this.auth.getHeaders() }); }
  agenteMasGanancias(inicio?: string, fin?: string): Observable<any> { return this.http.get<any>(`${this.url}/agente-mas-ganancias`, { params: this.params(inicio, fin), headers: this.auth.getHeaders() }); }
  paqueteMasVendido(inicio?: string, fin?: string): Observable<any[]> { return this.http.get<any[]>(`${this.url}/paquete-mas-vendido`, { params: this.params(inicio, fin), headers: this.auth.getHeaders() }); }
  paqueteMenosVendido(inicio?: string, fin?: string): Observable<any[]> { return this.http.get<any[]>(`${this.url}/paquete-menos-vendido`, { params: this.params(inicio, fin), headers: this.auth.getHeaders() }); }
  ocupacionDestinos(inicio?: string, fin?: string): Observable<any[]> { return this.http.get<any[]>(`${this.url}/ocupacion-destinos`, { params: this.params(inicio, fin), headers: this.auth.getHeaders() }); }
}

@Injectable({ providedIn: 'root' })
export class CargaApiService {
  private url = `${environment.apiUrl}/carga`;
  constructor(private http: HttpClient, private auth: AuthService) {}
  cargarArchivo(archivo: File): Observable<ResultadoCarga> {
    const form = new FormData();
    form.append('archivo', archivo);
    return this.http.post<ResultadoCarga>(this.url, form, { headers: this.auth.getHeaders() });
  }
}