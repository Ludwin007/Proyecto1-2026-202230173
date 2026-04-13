import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../servicios/auth.service';
import { ReservacionApiService, PaqueteApiService } from '../../../servicios/api.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterModule],
  template: `
    <div class="inicio-contenedor">
      <h2 class="bienvenida">Bienvenido, {{ nombreUsuario }}</h2>
      <p class="subtitulo-bienvenida">{{ rolNombre }} - {{ fechaHoy }}</p>

      <div class="tarjetas-resumen" *ngIf="esAtencionCliente || esAdmin">
        <mat-card class="tarjeta-resumen azul">
          <mat-card-content>
            <mat-icon>event_note</mat-icon>
            <div>
              <p class="numero">{{ reservacionesHoy }}</p>
              <p class="etiqueta">Reservaciones de hoy</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="alertas-contenedor" *ngIf="alertas.length > 0 && (esOperaciones || esAdmin)">
        <h3><mat-icon style="vertical-align:middle;color:#f57c00">warning</mat-icon> Paquetes con alta demanda</h3>
        <mat-card *ngFor="let alerta of alertas" class="tarjeta-alerta">
          <mat-card-content>
            <strong>{{ alerta['paquete'] }}</strong> - {{ alerta['porcentaje'] }}% de capacidad ocupada
            ({{ alerta['reservacionesActivas'] }} / {{ alerta['capacidadMaxima'] }} lugares)
          </mat-card-content>
        </mat-card>
      </div>

      <div class="accesos-rapidos">
        <h3>Accesos rapidos</h3>
        <div class="grid-accesos">
          <ng-container *ngFor="let acceso of accesosFiltrados()">
            <mat-card class="tarjeta-acceso" [routerLink]="acceso.ruta" style="cursor:pointer">
              <mat-card-content>
                <mat-icon [style.color]="acceso.color">{{ acceso.icono }}</mat-icon>
                <p>{{ acceso.etiqueta }}</p>
              </mat-card-content>
            </mat-card>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inicio-contenedor { padding: 8px; }
    .bienvenida { font-size: 1.6rem; margin: 0 0 4px 0; color: #1a237e; }
    .subtitulo-bienvenida { margin: 0 0 24px 0; color: #666; }
    .tarjetas-resumen { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
    .tarjeta-resumen { min-width: 180px; }
    .tarjeta-resumen mat-card-content { display: flex; align-items: center; gap: 16px; }
    .tarjeta-resumen mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .azul mat-icon { color: #1565c0; }
    .numero { font-size: 2rem; font-weight: 700; margin: 0; color: #1565c0; }
    .etiqueta { margin: 0; color: #666; font-size: 0.85rem; }
    .alertas-contenedor { margin-bottom: 24px; }
    .alertas-contenedor h3 { color: #e65100; margin-bottom: 12px; }
    .tarjeta-alerta { margin-bottom: 8px; border-left: 4px solid #f57c00; }
    .accesos-rapidos h3 { color: #333; margin-bottom: 12px; }
    .grid-accesos { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 16px; }
    .tarjeta-acceso mat-card-content { text-align: center; padding: 16px 8px; }
    .tarjeta-acceso mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .tarjeta-acceso p { margin: 8px 0 0 0; font-size: 0.85rem; color: #333; }
    .tarjeta-acceso:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  `]
})
export class InicioComponent implements OnInit {
  nombreUsuario = '';
  rolNombre = '';
  fechaHoy = '';
  reservacionesHoy = 0;
  alertas: any[] = [];
  esAdmin = false;
  esOperaciones = false;
  esAtencionCliente = false;

  accesos = [
    { etiqueta: 'Clientes', icono: 'people', ruta: '/dashboard/clientes', color: '#1565c0', roles: [1, 3] },
    { etiqueta: 'Reservaciones', icono: 'event_note', ruta: '/dashboard/reservaciones', color: '#2e7d32', roles: [1, 3] },
    { etiqueta: 'Destinos', icono: 'place', ruta: '/dashboard/destinos', color: '#e65100', roles: [2, 3] },
    { etiqueta: 'Paquetes', icono: 'card_travel', ruta: '/dashboard/paquetes', color: '#6a1b9a', roles: [2, 3] },
    { etiqueta: 'Proveedores', icono: 'business', ruta: '/dashboard/proveedores', color: '#00838f', roles: [2, 3] },
    { etiqueta: 'Usuarios', icono: 'manage_accounts', ruta: '/dashboard/usuarios', color: '#4527a0', roles: [3] },
    { etiqueta: 'Reportes', icono: 'bar_chart', ruta: '/dashboard/reportes', color: '#c62828', roles: [3] },
    { etiqueta: 'Carga de Datos', icono: 'upload_file', ruta: '/dashboard/carga', color: '#558b2f', roles: [3] }
  ];

  constructor(
    private auth: AuthService,
    private reservacionApi: ReservacionApiService,
    private paqueteApi: PaqueteApiService
  ) {}

  ngOnInit(): void {
    const u = this.auth.usuarioActual;
    this.nombreUsuario = u?.nombreUsuario ?? '';
    this.rolNombre = u?.nombreRol ?? '';
    this.esAdmin = this.auth.esAdmin();
    this.esOperaciones = this.auth.esOperaciones();
    this.esAtencionCliente = this.auth.esAtencionCliente();
    this.fechaHoy = new Date().toLocaleDateString('es-GT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (this.esAtencionCliente || this.esAdmin) {
      this.reservacionApi.listarDelDia().subscribe(r => this.reservacionesHoy = r.length);
    }
    if (this.esOperaciones || this.esAdmin) {
      this.paqueteApi.alertas().subscribe(a => this.alertas = a);
    }
  }

  accesosFiltrados(): any[] {
    const rol = this.auth.usuarioActual?.idRol ?? 0;
    return this.accesos.filter(a => a.roles.includes(rol));
  }
}