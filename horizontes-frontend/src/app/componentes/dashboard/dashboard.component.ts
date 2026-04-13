import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../servicios/auth.service';
import { SesionUsuario } from '../../modelos/modelos';

interface MenuItem {
  etiqueta: string;
  icono: string;
  ruta: string;
  roles: number[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatSidenavModule, MatToolbarModule,
    MatListModule, MatIconModule, MatButtonModule, MatDividerModule,
    MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="contenedor-principal">
      <mat-sidenav #sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="sidenav-logo">flight_takeoff</mat-icon>
          <div>
            <p class="sidenav-titulo">Horizontes</p>
            <p class="sidenav-subtitulo">Sin Limites</p>
          </div>
        </div>
        <mat-divider></mat-divider>
        <mat-nav-list>
          <ng-container *ngFor="let item of menuFiltrado()">
            <a mat-list-item [routerLink]="item.ruta" routerLinkActive="activo" class="menu-item">
              <mat-icon matListItemIcon>{{ item.icono }}</mat-icon>
              <span matListItemTitle>{{ item.etiqueta }}</span>
            </a>
          </ng-container>
        </mat-nav-list>
        <mat-divider></mat-divider>
        <div class="sidenav-footer">
          <mat-icon>account_circle</mat-icon>
          <div class="info-usuario">
            <span class="nombre-usuario">{{ usuario?.nombreUsuario }}</span>
            <span class="rol-usuario">{{ usuario?.nombreRol }}</span>
          </div>
        </div>
      </mat-sidenav>
      <mat-sidenav-content class="contenido-principal">
        <mat-toolbar color="primary" class="toolbar">
          <span class="toolbar-titulo">Sistema de Gestion</span>
          <span class="espacio"></span>
          <button mat-icon-button [matMenuTriggerFor]="menuUsuario">
            <mat-icon>account_circle</mat-icon>
          </button>
          <mat-menu #menuUsuario="matMenu">
            <button mat-menu-item disabled>
              <mat-icon>person</mat-icon>
              <span>{{ usuario?.nombreUsuario }}</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="cerrarSesion()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar sesion</span>
            </button>
          </mat-menu>
        </mat-toolbar>
        <div class="area-contenido">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .contenedor-principal { height: 100vh; }
    .sidenav {
      width: 240px;
      background: #1a237e;
      color: white;
    }
    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
    }
    .sidenav-logo {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #90caf9;
    }
    .sidenav-titulo {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
    }
    .sidenav-subtitulo {
      margin: 0;
      font-size: 0.75rem;
      color: #90caf9;
    }
    .menu-item {
      color: #e3f2fd;
      margin: 2px 8px;
      border-radius: 8px;
    }
    .menu-item:hover { background: rgba(255,255,255,0.1); }
    .menu-item.activo {
      background: rgba(144,202,249,0.2);
      color: #90caf9;
    }
    .sidenav-footer {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px;
      color: #90caf9;
      font-size: 0.85rem;
    }
    .info-usuario { display: flex; flex-direction: column; }
    .nombre-usuario { font-weight: 600; color: white; }
    .rol-usuario { font-size: 0.75rem; color: #90caf9; }
    .toolbar { box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .toolbar-titulo { font-size: 1.1rem; font-weight: 500; }
    .espacio { flex: 1 1 auto; }
    .area-contenido { padding: 24px; background: #f5f5f5; min-height: calc(100vh - 64px); overflow-y: auto; }
    mat-divider { border-color: rgba(255,255,255,0.15) !important; }
  `]
})
export class DashboardComponent implements OnInit {
  usuario: SesionUsuario | null = null;

  menuItems: MenuItem[] = [
    { etiqueta: 'Inicio', icono: 'home', ruta: '/dashboard/inicio', roles: [1, 2, 3] },
    { etiqueta: 'Clientes', icono: 'people', ruta: '/dashboard/clientes', roles: [1, 3] },
    { etiqueta: 'Reservaciones', icono: 'event_note', ruta: '/dashboard/reservaciones', roles: [1, 3] },
    { etiqueta: 'Destinos', icono: 'place', ruta: '/dashboard/destinos', roles: [2, 3] },
    { etiqueta: 'Proveedores', icono: 'business', ruta: '/dashboard/proveedores', roles: [2, 3] },
    { etiqueta: 'Paquetes', icono: 'card_travel', ruta: '/dashboard/paquetes', roles: [2, 3] },
    { etiqueta: 'Usuarios', icono: 'manage_accounts', ruta: '/dashboard/usuarios', roles: [3] },
    { etiqueta: 'Reportes', icono: 'bar_chart', ruta: '/dashboard/reportes', roles: [3] },
    { etiqueta: 'Carga de Datos', icono: 'upload_file', ruta: '/dashboard/carga', roles: [3] }
  ];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.usuario = this.auth.usuarioActual;
  }

  menuFiltrado(): MenuItem[] {
    const rol = this.usuario?.idRol ?? 0;
    return this.menuItems.filter(m => m.roles.includes(rol));
  }

  cerrarSesion(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}