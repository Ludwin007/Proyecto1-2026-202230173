import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClienteApiService, ReservacionApiService } from '../../servicios/api.service';
import { Cliente, Reservacion } from '../../modelos/modelos';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="pagina-contenedor">
      <div class="pagina-header">
        <h2>Gestion de Clientes</h2>
        <button mat-raised-button color="primary" (click)="abrirFormulario()">
          <mat-icon>person_add</mat-icon> Nuevo Cliente
        </button>
      </div>

      <mat-card *ngIf="mostrarFormulario" class="formulario-card">
        <mat-card-header>
          <mat-card-title>{{ clienteEditando ? 'Editar Cliente' : 'Registrar Cliente' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="guardar()" class="formulario-grid">
            <mat-form-field appearance="outline">
              <mat-label>DPI / Pasaporte</mat-label>
              <input matInput formControlName="dpiPasaporte" [readonly]="!!clienteEditando">
              <mat-error *ngIf="formulario.get('dpiPasaporte')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nombre Completo</mat-label>
              <input matInput formControlName="nombreCompleto">
              <mat-error *ngIf="formulario.get('nombreCompleto')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fecha de Nacimiento</mat-label>
              <input matInput type="date" formControlName="fechaNacimiento">
              <mat-error *ngIf="formulario.get('fechaNacimiento')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Telefono</mat-label>
              <input matInput formControlName="telefono">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Correo Electronico</mat-label>
              <input matInput formControlName="correo">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Nacionalidad</mat-label>
              <input matInput formControlName="nacionalidad">
            </mat-form-field>
            <div class="acciones-formulario">
              <button mat-button type="button" (click)="cancelar()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="guardando">
                {{ guardando ? 'Guardando...' : (clienteEditando ? 'Actualizar' : 'Registrar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="clienteSeleccionado" class="historial-card">
        <mat-card-header>
          <mat-card-title>Historial - {{ clienteSeleccionado.nombreCompleto }}</mat-card-title>
          <button mat-icon-button (click)="clienteSeleccionado = null" style="margin-left:auto">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="historial.length === 0" class="sin-datos">Sin reservaciones registradas.</div>
          <table mat-table [dataSource]="historial" *ngIf="historial.length > 0" class="tabla-historial">
            <ng-container matColumnDef="numero"><th mat-header-cell *matHeaderCellDef>No.</th><td mat-cell *matCellDef="let r">{{ r.numeroReservacion }}</td></ng-container>
            <ng-container matColumnDef="paquete"><th mat-header-cell *matHeaderCellDef>Paquete</th><td mat-cell *matCellDef="let r">{{ r.nombrePaquete }}</td></ng-container>
            <ng-container matColumnDef="fechaViaje"><th mat-header-cell *matHeaderCellDef>Fecha Viaje</th><td mat-cell *matCellDef="let r">{{ r.fechaViaje | date:'dd/MM/yyyy' }}</td></ng-container>
            <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef>Estado</th><td mat-cell *matCellDef="let r"><span [class]="'estado-' + r.estado?.toLowerCase()">{{ r.estado }}</span></td></ng-container>
            <ng-container matColumnDef="costo"><th mat-header-cell *matHeaderCellDef>Costo</th><td mat-cell *matCellDef="let r">Q. {{ r.costoTotal | number:'1.2-2' }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="['numero','paquete','fechaViaje','estado','costo']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['numero','paquete','fechaViaje','estado','costo'];"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" class="buscador">
            <mat-label>Buscar cliente</mat-label>
            <input matInput (keyup)="filtrar($event)" placeholder="Nombre o DPI">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <div *ngIf="cargando" class="cargando-contenedor"><mat-spinner diameter="40"></mat-spinner></div>
          <table mat-table [dataSource]="dataSource" matSort *ngIf="!cargando">
            <ng-container matColumnDef="dpiPasaporte"><th mat-header-cell *matHeaderCellDef mat-sort-header>DPI/Pasaporte</th><td mat-cell *matCellDef="let c">{{ c.dpiPasaporte }}</td></ng-container>
            <ng-container matColumnDef="nombreCompleto"><th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th><td mat-cell *matCellDef="let c">{{ c.nombreCompleto }}</td></ng-container>
            <ng-container matColumnDef="telefono"><th mat-header-cell *matHeaderCellDef>Telefono</th><td mat-cell *matCellDef="let c">{{ c.telefono }}</td></ng-container>
            <ng-container matColumnDef="correo"><th mat-header-cell *matHeaderCellDef>Correo</th><td mat-cell *matCellDef="let c">{{ c.correo }}</td></ng-container>
            <ng-container matColumnDef="nacionalidad"><th mat-header-cell *matHeaderCellDef>Nacionalidad</th><td mat-cell *matCellDef="let c">{{ c.nacionalidad }}</td></ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let c">
                <button mat-icon-button color="primary" (click)="editar(c)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="accent" (click)="verHistorial(c)"><mat-icon>history</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas;"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25, 50]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .pagina-contenedor { padding: 8px; }
    .pagina-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .pagina-header h2 { margin: 0; color: #1a237e; }
    .formulario-card, .historial-card { margin-bottom: 16px; }
    .formulario-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
    .acciones-formulario { grid-column: 1/-1; display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }
    .buscador { width: 100%; margin-bottom: 8px; }
    .cargando-contenedor { display: flex; justify-content: center; padding: 40px; }
    .tabla-historial { width: 100%; }
    .sin-datos { padding: 16px; color: #666; text-align: center; }
    .estado-confirmada { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .estado-pendiente { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .estado-cancelada { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .estado-completada { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
  `]
})
export class ClientesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Cliente>([]);
  columnas = ['dpiPasaporte', 'nombreCompleto', 'telefono', 'correo', 'nacionalidad', 'acciones'];
  formulario!: FormGroup;
  mostrarFormulario = false;
  clienteEditando: Cliente | null = null;
  clienteSeleccionado: Cliente | null = null;
  historial: Reservacion[] = [];
  cargando = false;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private api: ClienteApiService,
    private reservacionApi: ReservacionApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarClientes();
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      dpiPasaporte: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      telefono: [''],
      correo: [''],
      nacionalidad: ['']
    });
  }

  cargarClientes(): void {
    this.cargando = true;
    this.api.listar().subscribe({
      next: clientes => {
        this.dataSource.data = clientes;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  filtrar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  abrirFormulario(): void {
    this.clienteEditando = null;
    this.formulario.reset();
    this.formulario.get('dpiPasaporte')?.enable();
    this.mostrarFormulario = true;
  }

  editar(cliente: Cliente): void {
    this.clienteEditando = cliente;
    this.formulario.patchValue({
      dpiPasaporte: cliente.dpiPasaporte,
      nombreCompleto: cliente.nombreCompleto,
      fechaNacimiento: cliente.fechaNacimiento,
      telefono: cliente.telefono,
      correo: cliente.correo,
      nacionalidad: cliente.nacionalidad
    });
    this.formulario.get('dpiPasaporte')?.disable();
    this.mostrarFormulario = true;
  }

  guardar(): void {
    if (this.formulario.invalid) return;
    this.guardando = true;
    const datos = this.formulario.getRawValue();
    const operacion = this.clienteEditando
      ? this.api.actualizar(this.clienteEditando.id!, datos)
      : this.api.crear(datos);
    operacion.subscribe({
      next: () => {
        this.snackBar.open(this.clienteEditando ? 'Cliente actualizado.' : 'Cliente registrado.', 'OK', { duration: 3000 });
        this.cancelar();
        this.cargarClientes();
        this.guardando = false;
      },
      error: (e) => {
        this.snackBar.open(e.error?.error || 'Error al guardar.', 'Cerrar', { duration: 4000 });
        this.guardando = false;
      }
    });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.clienteEditando = null;
    this.formulario.reset();
  }

verHistorial(cliente: Cliente): void {
  this.clienteSeleccionado = cliente;
  this.reservacionApi.historialReservaciones(cliente.id!).subscribe((r: Reservacion[]) => this.historial = r);
}

}