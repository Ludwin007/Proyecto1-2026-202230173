import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
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
import { PaqueteApiService, DestinoApiService, ProveedorApiService } from '../../servicios/api.service';
import { Paquete, Destino, Proveedor } from '../../modelos/modelos';

@Component({
  selector: 'app-paquetes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="pagina-contenedor">
      <div class="pagina-header">
        <h2>Gestion de Paquetes Turisticos</h2>
        <button mat-raised-button color="primary" (click)="abrirFormulario()">
          <mat-icon>add</mat-icon> Nuevo Paquete
        </button>
      </div>

      <mat-card *ngIf="mostrarFormulario" class="formulario-card">
        <mat-card-header><mat-card-title>{{ editando ? 'Editar Paquete' : 'Registrar Paquete' }}</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="guardar()">
            <div class="formulario-grid">
              <mat-form-field appearance="outline">
                <mat-label>Nombre del Paquete</mat-label>
                <input matInput formControlName="nombre">
                <mat-error *ngIf="formulario.get('nombre')?.hasError('required')">Requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Destino Principal</mat-label>
                <mat-select formControlName="idDestino">
                  <mat-option *ngFor="let d of destinos" [value]="d.id">{{ d.nombre }} - {{ d.pais }}</mat-option>
                </mat-select>
                <mat-error *ngIf="formulario.get('idDestino')?.hasError('required')">Requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Duracion (dias)</mat-label>
                <input matInput type="number" formControlName="duracionDias" min="1">
                <mat-error *ngIf="formulario.get('duracionDias')?.hasError('required')">Requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Precio de Venta (Q.)</mat-label>
                <input matInput type="number" formControlName="precioVenta" min="0">
                <mat-error *ngIf="formulario.get('precioVenta')?.hasError('required')">Requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Capacidad Maxima</mat-label>
                <input matInput type="number" formControlName="capacidadMaxima" min="1">
                <mat-error *ngIf="formulario.get('capacidadMaxima')?.hasError('required')">Requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline" class="span-2">
                <mat-label>Descripcion General</mat-label>
                <textarea matInput formControlName="descripcion" rows="2"></textarea>
              </mat-form-field>
            </div>
            <div class="servicios-seccion">
              <div class="servicios-header">
                <h4>Servicios Incluidos</h4>
                <button mat-stroked-button type="button" color="primary" (click)="agregarServicio()">
                  <mat-icon>add</mat-icon> Agregar Servicio
                </button>
              </div>
              <div formArrayName="servicios">
                <div *ngFor="let srv of serviciosArray.controls; let i = index" [formGroupName]="i" class="servicio-fila">
                  <mat-form-field appearance="outline">
                    <mat-label>Proveedor</mat-label>
                    <mat-select formControlName="idProveedor">
                      <mat-option *ngFor="let p of proveedores" [value]="p.id">{{ p.nombre }}</mat-option>
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Descripcion del Servicio</mat-label>
                    <input matInput formControlName="descripcion">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Costo Proveedor (Q.)</mat-label>
                    <input matInput type="number" formControlName="costoProveedor">
                  </mat-form-field>
                  <button mat-icon-button color="warn" type="button" (click)="quitarServicio(i)">
                    <mat-icon>remove_circle</mat-icon>
                  </button>
                </div>
              </div>
              <div *ngIf="serviciosArray.length > 0" class="resumen-costos">
                <span>Costo total servicios: <strong>Q. {{ calcularCostoServicios() | number:'1.2-2' }}</strong></span>
                <span>Ganancia bruta estimada: <strong>Q. {{ (formulario.get('precioVenta')?.value || 0) - calcularCostoServicios() | number:'1.2-2' }}</strong></span>
              </div>
            </div>
            <div class="acciones-formulario">
              <button mat-button type="button" (click)="cancelar()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="guardando">
                {{ guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Registrar') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="paqueteDetalle">
        <mat-card-header>
          <mat-card-title>Detalle: {{ paqueteDetalle.nombre }}</mat-card-title>
          <button mat-icon-button (click)="paqueteDetalle = null; imagenDestinoPaquete = ''" style="margin-left:auto"><mat-icon>close</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <div class="detalle-con-imagen">
            <img *ngIf="imagenDestinoPaquete" [src]="imagenDestinoPaquete" [alt]="paqueteDetalle.nombreDestino"
              class="imagen-destino-paquete" (error)="imagenDestinoPaquete = ''">
            <div *ngIf="!imagenDestinoPaquete" class="sin-imagen-paquete">
              <mat-icon>image_not_supported</mat-icon>
              <p>Sin imagen</p>
            </div>
            <div class="info-paquete-detalle">
              <div class="detalle-grid">
                <div><strong>Destino:</strong> {{ paqueteDetalle.nombreDestino }}</div>
                <div><strong>Duracion:</strong> {{ paqueteDetalle.duracionDias }} dias</div>
                <div><strong>Precio venta:</strong> Q. {{ paqueteDetalle.precioVenta | number:'1.2-2' }}</div>
                <div><strong>Costo total servicios:</strong> Q. {{ paqueteDetalle.costoTotal | number:'1.2-2' }}</div>
                <div><strong>Ganancia bruta:</strong> Q. {{ (paqueteDetalle.precioVenta - (paqueteDetalle.costoTotal || 0)) | number:'1.2-2' }}</div>
                <div><strong>Capacidad:</strong> {{ paqueteDetalle.capacidadMaxima }} personas</div>
              </div>
              <h4>Servicios incluidos:</h4>
              <table mat-table [dataSource]="paqueteDetalle.servicios || []" class="tabla-servicios">
                <ng-container matColumnDef="proveedor"><th mat-header-cell *matHeaderCellDef>Proveedor</th><td mat-cell *matCellDef="let s">{{ s.nombreProveedor }}</td></ng-container>
                <ng-container matColumnDef="descripcion"><th mat-header-cell *matHeaderCellDef>Descripcion</th><td mat-cell *matCellDef="let s">{{ s.descripcion }}</td></ng-container>
                <ng-container matColumnDef="costo"><th mat-header-cell *matHeaderCellDef>Costo</th><td mat-cell *matCellDef="let s">Q. {{ s.costoProveedor | number:'1.2-2' }}</td></ng-container>
                <tr mat-header-row *matHeaderRowDef="['proveedor','descripcion','costo']"></tr>
                <tr mat-row *matRowDef="let row; columns: ['proveedor','descripcion','costo'];"></tr>
              </table>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" class="buscador">
            <mat-label>Buscar paquete</mat-label>
            <input matInput (keyup)="filtrar($event)" placeholder="Nombre o destino">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <div *ngIf="cargando" class="cargando-contenedor"><mat-spinner diameter="40"></mat-spinner></div>
          <table mat-table [dataSource]="dataSource" matSort *ngIf="!cargando">
            <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th><td mat-cell *matCellDef="let p">{{ p.nombre }}</td></ng-container>
            <ng-container matColumnDef="nombreDestino"><th mat-header-cell *matHeaderCellDef>Destino</th><td mat-cell *matCellDef="let p">{{ p.nombreDestino }}</td></ng-container>
            <ng-container matColumnDef="duracionDias"><th mat-header-cell *matHeaderCellDef>Dias</th><td mat-cell *matCellDef="let p">{{ p.duracionDias }}</td></ng-container>
            <ng-container matColumnDef="precioVenta"><th mat-header-cell *matHeaderCellDef>Precio</th><td mat-cell *matCellDef="let p">Q. {{ p.precioVenta | number:'1.2-2' }}</td></ng-container>
            <ng-container matColumnDef="capacidadMaxima"><th mat-header-cell *matHeaderCellDef>Capacidad</th><td mat-cell *matCellDef="let p">{{ p.capacidadMaxima }}</td></ng-container>
            <ng-container matColumnDef="activo"><th mat-header-cell *matHeaderCellDef>Estado</th><td mat-cell *matCellDef="let p"><span [class]="p.activo ? 'estado-activo' : 'estado-inactivo'">{{ p.activo ? 'Activo' : 'Inactivo' }}</span></td></ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button color="accent" (click)="verDetalle(p)" matTooltip="Ver detalle"><mat-icon>visibility</mat-icon></button>
                <button mat-icon-button color="primary" (click)="editar(p)" matTooltip="Editar"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="desactivar(p)" *ngIf="p.activo" matTooltip="Desactivar"><mat-icon>block</mat-icon></button>
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
    .span-2 { grid-column: 1 / -1; }
    .servicios-seccion { margin-top: 16px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; }
    .servicios-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .servicios-header h4 { margin: 0; }
    .servicio-fila { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 8px; align-items: center; margin-bottom: 8px; }
    .resumen-costos { display: flex; gap: 24px; padding: 8px 0; color: #333; font-size: 0.9rem; }
    .acciones-formulario { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .buscador { width: 100%; margin-bottom: 8px; }
    .cargando-contenedor { display: flex; justify-content: center; padding: 40px; }
    .estado-activo { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .estado-inactivo { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .detalle-con-imagen { display: flex; gap: 16px; }
    .imagen-destino-paquete { width: 250px; height: 200px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }
    .sin-imagen-paquete { width: 250px; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f5f5f5; border-radius: 8px; color: #bdbdbd; flex-shrink: 0; }
    .info-paquete-detalle { flex: 1; }
    .detalle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .tabla-servicios { width: 100%; }
  `]
})
export class PaquetesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Paquete>([]);
  columnas = ['nombre', 'nombreDestino', 'duracionDias', 'precioVenta', 'capacidadMaxima', 'activo', 'acciones'];
  formulario!: FormGroup;
  mostrarFormulario = false;
  editando: Paquete | null = null;
  paqueteDetalle: Paquete | null = null;
  destinos: Destino[] = [];
  proveedores: Proveedor[] = [];
  cargando = false;
  guardando = false;
  imagenDestinoPaquete = '';

  constructor(
    private fb: FormBuilder,
    private api: PaqueteApiService,
    private destinoApi: DestinoApiService,
    private proveedorApi: ProveedorApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargar();
    this.destinoApi.listar().subscribe(d => this.destinos = d);
    this.proveedorApi.listar().subscribe(p => this.proveedores = p);
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      idDestino: ['', Validators.required],
      duracionDias: ['', [Validators.required, Validators.min(1)]],
      precioVenta: ['', [Validators.required, Validators.min(0)]],
      capacidadMaxima: ['', [Validators.required, Validators.min(1)]],
      descripcion: [''],
      servicios: this.fb.array([])
    });
  }

  get serviciosArray(): FormArray {
    return this.formulario.get('servicios') as FormArray;
  }

  agregarServicio(): void {
    this.serviciosArray.push(this.fb.group({
      idProveedor: ['', Validators.required],
      descripcion: ['', Validators.required],
      costoProveedor: ['', [Validators.required, Validators.min(0)]]
    }));
  }

  quitarServicio(i: number): void { this.serviciosArray.removeAt(i); }

  calcularCostoServicios(): number {
    return this.serviciosArray.controls.reduce((sum, ctrl) => sum + (Number(ctrl.get('costoProveedor')?.value) || 0), 0);
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

  abrirFormulario(): void {
    this.editando = null;
    this.inicializarFormulario();
    this.mostrarFormulario = true;
  }

  editar(p: Paquete): void {
    this.editando = p;
    this.inicializarFormulario();
    this.formulario.patchValue(p);
    this.mostrarFormulario = true;
  }

  verDetalle(p: Paquete): void {
    this.api.obtener(p.id!).subscribe(d => {
      this.paqueteDetalle = d;
      if (d.idDestino) {
        this.destinoApi.obtener(d.idDestino).subscribe(dest => {
          this.imagenDestinoPaquete = dest.imagenUrl || '';
        });
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) return;
    this.guardando = true;
    const datos = this.formulario.value;
    const op = this.editando ? this.api.actualizar(this.editando.id!, datos) : this.api.crear(datos);
    op.subscribe({
      next: () => {
        this.snackBar.open(this.editando ? 'Paquete actualizado.' : 'Paquete registrado.', 'OK', { duration: 3000 });
        this.cancelar();
        this.cargar();
        this.guardando = false;
      },
      error: (e) => { this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 }); this.guardando = false; }
    });
  }

  desactivar(p: Paquete): void {
    if (!confirm(`Desactivar el paquete "${p.nombre}"?`)) return;
    this.api.desactivar(p.id!).subscribe({
      next: () => { this.snackBar.open('Paquete desactivado.', 'OK', { duration: 3000 }); this.cargar(); },
      error: (e) => this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 })
    });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editando = null;
    this.inicializarFormulario();
  }
}