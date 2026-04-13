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
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProveedorApiService } from '../../servicios/api.service';
import { Proveedor } from '../../modelos/modelos';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="pagina-contenedor">
      <div class="pagina-header">
        <h2>Gestion de Proveedores</h2>
        <button mat-raised-button color="primary" (click)="abrirFormulario()">
          <mat-icon>add_business</mat-icon> Nuevo Proveedor
        </button>
      </div>

      <mat-card *ngIf="mostrarFormulario" class="formulario-card">
        <mat-card-header><mat-card-title>{{ editando ? 'Editar Proveedor' : 'Registrar Proveedor' }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="guardar()" class="formulario-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nombre del Proveedor</mat-label>
              <input matInput formControlName="nombre">
              <mat-error *ngIf="formulario.get('nombre')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Tipo de Servicio</mat-label>
              <mat-select formControlName="tipoServicio">
                <mat-option [value]="1">Aerolinea</mat-option>
                <mat-option [value]="2">Hotel</mat-option>
                <mat-option [value]="3">Tour</mat-option>
                <mat-option [value]="4">Traslado</mat-option>
                <mat-option [value]="5">Otro</mat-option>
              </mat-select>
              <mat-error *ngIf="formulario.get('tipoServicio')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Pais de Operacion</mat-label>
              <input matInput formControlName="paisOperacion">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Datos de Contacto</mat-label>
              <input matInput formControlName="contacto">
            </mat-form-field>
            <div class="acciones-formulario">
              <button mat-button type="button" (click)="cancelar()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="guardando">
                {{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Registrar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" class="buscador">
            <mat-label>Buscar proveedor</mat-label>
            <input matInput (keyup)="filtrar($event)" placeholder="Nombre o tipo">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <div *ngIf="cargando" class="cargando-contenedor"><mat-spinner diameter="40"></mat-spinner></div>
          <table mat-table [dataSource]="dataSource" matSort *ngIf="!cargando">
            <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th><td mat-cell *matCellDef="let p">{{ p.nombre }}</td></ng-container>
            <ng-container matColumnDef="tipoNombre"><th mat-header-cell *matHeaderCellDef>Tipo</th><td mat-cell *matCellDef="let p">{{ p.tipoNombre }}</td></ng-container>
            <ng-container matColumnDef="paisOperacion"><th mat-header-cell *matHeaderCellDef>Pais</th><td mat-cell *matCellDef="let p">{{ p.paisOperacion }}</td></ng-container>
            <ng-container matColumnDef="contacto"><th mat-header-cell *matHeaderCellDef>Contacto</th><td mat-cell *matCellDef="let p">{{ p.contacto }}</td></ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button color="primary" (click)="editar(p)"><mat-icon>edit</mat-icon></button>
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
    .formulario-card { margin-bottom: 16px; }
    .formulario-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
    .acciones-formulario { grid-column: 1/-1; display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }
    .buscador { width: 100%; margin-bottom: 8px; }
    .cargando-contenedor { display: flex; justify-content: center; padding: 40px; }
  `]
})
export class ProveedoresComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Proveedor>([]);
  columnas = ['nombre', 'tipoNombre', 'paisOperacion', 'contacto', 'acciones'];
  formulario!: FormGroup;
  mostrarFormulario = false;
  editando: Proveedor | null = null;
  cargando = false;
  guardando = false;

  constructor(private fb: FormBuilder, private api: ProveedorApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      tipoServicio: ['', Validators.required],
      paisOperacion: [''],
      contacto: ['']
    });
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.api.listar().subscribe({
      next: datos => {
        this.dataSource.data = datos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  filtrar(event: Event): void {
    this.dataSource.filter = (event.target as HTMLInputElement).value.trim().toLowerCase();
  }

  abrirFormulario(): void { this.editando = null; this.formulario.reset(); this.mostrarFormulario = true; }

  editar(p: Proveedor): void {
    this.editando = p;
    this.formulario.patchValue(p);
    this.mostrarFormulario = true;
  }

  guardar(): void {
    if (this.formulario.invalid) return;
    this.guardando = true;
    const datos = this.formulario.value;
    const op = this.editando ? this.api.actualizar(this.editando.id!, datos) : this.api.crear(datos);
    op.subscribe({
      next: () => {
        this.snackBar.open(this.editando ? 'Proveedor actualizado.' : 'Proveedor registrado.', 'OK', { duration: 3000 });
        this.cancelar();
        this.cargar();
        this.guardando = false;
      },
      error: (e) => { this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 }); this.guardando = false; }
    });
  }

  cancelar(): void { this.mostrarFormulario = false; this.editando = null; this.formulario.reset(); }
}