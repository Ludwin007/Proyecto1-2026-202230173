import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuarioApiService } from '../../servicios/api.service';
import { Usuario } from '../../modelos/modelos';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatCardModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  template: `
    <div class="pagina-contenedor">
      <div class="pagina-header">
        <h2>Gestion de Usuarios</h2>
        <button mat-raised-button color="primary" (click)="abrirFormulario()">
          <mat-icon>person_add</mat-icon> Nuevo Usuario
        </button>
      </div>

      <mat-card *ngIf="mostrarFormulario" class="formulario-card">
        <mat-card-header><mat-card-title>{{ editando ? 'Cambiar Rol' : 'Crear Usuario' }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="guardar()" class="formulario-grid">
            <mat-form-field appearance="outline" *ngIf="!editando">
              <mat-label>Nombre de Usuario</mat-label>
              <input matInput formControlName="nombreUsuario">
              <mat-error *ngIf="formulario.get('nombreUsuario')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" *ngIf="!editando">
              <mat-label>Contrasena (min. 6 caracteres)</mat-label>
              <input matInput type="password" formControlName="contrasena">
              <mat-error *ngIf="formulario.get('contrasena')?.hasError('minlength')">Minimo 6 caracteres</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Rol</mat-label>
              <mat-select formControlName="idRol">
                <mat-option [value]="1">Atencion al Cliente</mat-option>
                <mat-option [value]="2">Operaciones</mat-option>
                <mat-option [value]="3">Administrador</mat-option>
              </mat-select>
            </mat-form-field>
            <div class="acciones-formulario">
              <button mat-button type="button" (click)="cancelar()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="guardando">
                {{ guardando ? 'Guardando...' : (editando ? 'Actualizar Rol' : 'Crear') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <div *ngIf="cargando" class="cargando-contenedor"><mat-spinner diameter="40"></mat-spinner></div>
          <table mat-table [dataSource]="dataSource" *ngIf="!cargando">
            <ng-container matColumnDef="nombreUsuario">
              <th mat-header-cell *matHeaderCellDef>Usuario</th>
              <td mat-cell *matCellDef="let u">{{ u.nombreUsuario }}</td>
            </ng-container>
            <ng-container matColumnDef="nombreRol">
              <th mat-header-cell *matHeaderCellDef>Rol</th>
              <td mat-cell *matCellDef="let u">{{ u.nombreRol }}</td>
            </ng-container>
            <ng-container matColumnDef="activo">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let u">
                <span [class]="u.activo ? 'estado-activo' : 'estado-inactivo'">
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let u">
                <button mat-icon-button color="primary" (click)="cambiarRol(u)" matTooltip="Cambiar rol" *ngIf="u.activo">
                  <mat-icon>manage_accounts</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="desactivar(u)" matTooltip="Desactivar" *ngIf="u.activo">
                  <mat-icon>person_off</mat-icon>
                </button>
                <button mat-icon-button color="accent" (click)="activar(u)" matTooltip="Activar usuario" *ngIf="!u.activo">
                  <mat-icon>person</mat-icon>
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columnas"></tr>
            <tr mat-row *matRowDef="let row; columns: columnas;" [class.fila-inactiva]="!row.activo"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[10, 25]" showFirstLastButtons></mat-paginator>
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
    .acciones-formulario { grid-column: 1/-1; display: flex; justify-content: flex-end; gap: 8px; }
    .cargando-contenedor { display: flex; justify-content: center; padding: 40px; }
    .estado-activo { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .estado-inactivo { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .fila-inactiva { opacity: 0.6; }
  `]
})
export class UsuariosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource = new MatTableDataSource<Usuario>([]);
  columnas = ['nombreUsuario', 'nombreRol', 'activo', 'acciones'];
  formulario!: FormGroup;
  mostrarFormulario = false;
  editando: Usuario | null = null;
  cargando = false;
  guardando = false;

  constructor(private fb: FormBuilder, private api: UsuarioApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void { this.inicializarFormulario(); this.cargar(); }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombreUsuario: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      idRol: ['', Validators.required]
    });
  }

  cargar(): void {
    this.cargando = true;
    this.api.listar().subscribe({
      next: datos => { this.dataSource.data = datos; this.dataSource.paginator = this.paginator; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  abrirFormulario(): void { this.editando = null; this.inicializarFormulario(); this.mostrarFormulario = true; }

  cambiarRol(u: Usuario): void {
    this.editando = u;
    this.formulario = this.fb.group({ idRol: [u.idRol, Validators.required] });
    this.mostrarFormulario = true;
  }

  guardar(): void {
    if (this.formulario.invalid) return;
    this.guardando = true;
    const op = this.editando
      ? this.api.cambiarRol(this.editando.id, this.formulario.value.idRol)
      : this.api.crear(this.formulario.value);
    op.subscribe({
      next: () => {
        this.snackBar.open(this.editando ? 'Rol actualizado.' : 'Usuario creado.', 'OK', { duration: 3000 });
        this.cancelar();
        this.cargar();
        this.guardando = false;
      },
      error: (e) => { this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 }); this.guardando = false; }
    });
  }

  desactivar(u: Usuario): void {
    if (!confirm(`Desactivar al usuario "${u.nombreUsuario}"?`)) return;
    this.api.desactivar(u.id).subscribe({
      next: () => { this.snackBar.open('Usuario desactivado.', 'OK', { duration: 3000 }); this.cargar(); },
      error: (e) => this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 })
    });
  }

  activar(u: Usuario): void {
    if (!confirm(`Activar al usuario "${u.nombreUsuario}"?`)) return;
    this.api.activar(u.id).subscribe({
      next: () => { this.snackBar.open('Usuario activado correctamente.', 'OK', { duration: 3000 }); this.cargar(); },
      error: (e) => this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 })
    });
  }

  cancelar(): void { this.mostrarFormulario = false; this.editando = null; this.inicializarFormulario(); }
}