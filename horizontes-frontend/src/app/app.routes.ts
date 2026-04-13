import { Routes } from '@angular/router';
import { authGuard, adminGuard, operacionesGuard, clienteGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./componentes/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./componentes/dashboard/dashboard.component').then(m => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./componentes/dashboard/inicio/inicio.component').then(m => m.InicioComponent)
      },
      {
        path: 'clientes',
        canActivate: [clienteGuard],
        loadComponent: () => import('./componentes/clientes/clientes.component').then(m => m.ClientesComponent)
      },
      {
        path: 'reservaciones',
        canActivate: [clienteGuard],
        loadComponent: () => import('./componentes/reservaciones/reservaciones.component').then(m => m.ReservacionesComponent)
      },
      {
        path: 'destinos',
        canActivate: [operacionesGuard],
        loadComponent: () => import('./componentes/destinos/destinos.component').then(m => m.DestinosComponent)
      },
      {
        path: 'proveedores',
        canActivate: [operacionesGuard],
        loadComponent: () => import('./componentes/proveedores/proveedores.component').then(m => m.ProveedoresComponent)
      },
      {
        path: 'paquetes',
        canActivate: [operacionesGuard],
        loadComponent: () => import('./componentes/paquetes/paquetes.component').then(m => m.PaquetesComponent)
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./componentes/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'reportes',
        canActivate: [adminGuard],
        loadComponent: () => import('./componentes/reportes/reportes.component').then(m => m.ReportesComponent)
      },
      {
        path: 'carga',
        canActivate: [adminGuard],
        loadComponent: () => import('./componentes/carga/carga.component').then(m => m.CargaComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];