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
import { DestinoApiService } from '../../servicios/api.service';
import { Destino } from '../../modelos/modelos';

@Component({
  selector: 'app-destinos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="pagina-contenedor">
      <div class="pagina-header">
        <h2>Gestion de Destinos</h2>
        <button mat-raised-button color="primary" (click)="abrirFormulario()">
          <mat-icon>add_location</mat-icon> Nuevo Destino
        </button>
      </div>

      <mat-card *ngIf="mostrarFormulario" class="formulario-card">
        <mat-card-header>
          <mat-card-title>{{ editando ? 'Editar Destino' : 'Registrar Destino' }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="guardar()" class="formulario-grid">
            <mat-form-field appearance="outline">
              <mat-label>Nombre del Destino</mat-label>
              <input matInput formControlName="nombre">
              <mat-error *ngIf="formulario.get('nombre')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Pais</mat-label>
              <input matInput formControlName="pais">
              <mat-error *ngIf="formulario.get('pais')?.hasError('required')">Requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="span-2">
              <mat-label>Descripcion General</mat-label>
              <textarea matInput formControlName="descripcion" rows="3"></textarea>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Clima / Mejor Epoca</mat-label>
              <input matInput formControlName="clima">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>URL de Imagen</mat-label>
              <input matInput formControlName="imagenUrl" (input)="previsualizarImagen()">
            </mat-form-field>
            <div *ngIf="urlPrevia" class="previsualizacion span-2">
              <p class="label-previa">Vista previa de la imagen:</p>
              <img [src]="urlPrevia" alt="Vista previa" class="imagen-previa" (error)="errorImagen()">
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

      <mat-card *ngIf="destinoSeleccionado" class="detalle-destino">
        <mat-card-header>
          <mat-card-title>{{ destinoSeleccionado.nombre }}</mat-card-title>
          <mat-card-subtitle>{{ destinoSeleccionado.pais }}</mat-card-subtitle>
          <button mat-icon-button (click)="destinoSeleccionado = null" style="margin-left:auto">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <div class="detalle-contenido">
            <img *ngIf="destinoSeleccionado.imagenUrl" [src]="destinoSeleccionado.imagenUrl"
              [alt]="destinoSeleccionado.nombre" class="imagen-destino" (error)="errorImagenDetalle($event)">
            <div *ngIf="!destinoSeleccionado.imagenUrl" class="sin-imagen">
              <mat-icon>image_not_supported</mat-icon>
              <p>Sin imagen disponible</p>
            </div>
            <div class="info-destino">
              <p><strong>Descripcion:</strong> {{ destinoSeleccionado.descripcion || 'Sin descripcion' }}</p>
              <p><strong>Clima / Mejor epoca:</strong> {{ destinoSeleccionado.clima || 'Sin informacion' }}</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" class="buscador">
            <mat-label>Buscar destino</mat-label>
            <input matInput (keyup)="filtrar($event)" placeholder="Nombre o pais">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <div *ngIf="cargando" class="cargando-contenedor"><mat-spinner diameter="40"></mat-spinner></div>

          <div class="grid-destinos" *ngIf="!cargando">
            <mat-card *ngFor="let d of dataSource.filteredData" class="tarjeta-destino">
              <div class="imagen-contenedor">
                <img *ngIf="d.imagenUrl" [src]="d.imagenUrl" [alt]="d.nombre"
                  class="imagen-tarjeta" (error)="errorImagenTarjeta($event)">
                <div *ngIf="!d.imagenUrl" class="sin-imagen-tarjeta">
                  <mat-icon>place</mat-icon>
                </div>
              </div>
              <mat-card-content>
                <h3 class="nombre-destino">{{ d.nombre }}</h3>
                <p class="pais-destino"><mat-icon style="font-size:14px;vertical-align:middle">flag</mat-icon> {{ d.pais }}</p>
                <p class="descripcion-destino">{{ d.descripcion }}</p>
                <p *ngIf="d.clima" class="clima-destino"><mat-icon style="font-size:14px;vertical-align:middle">wb_sunny</mat-icon> {{ d.clima }}</p>
              </mat-card-content>
              <mat-card-actions>
                <button mat-icon-button color="accent" (click)="verDetalle(d)" matTooltip="Ver imagen completa">
                  <mat-icon>visibility</mat-icon>
                </button>
                <button mat-icon-button color="primary" (click)="editar(d)" matTooltip="Editar">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="eliminar(d)" matTooltip="Eliminar">
                  <mat-icon>delete</mat-icon>
                </button>
              </mat-card-actions>
            </mat-card>
          </div>

          <div *ngIf="!cargando && dataSource.filteredData.length === 0" class="sin-datos">
            No hay destinos registrados.
          </div>

          <mat-paginator [pageSizeOptions]="[6, 12, 24]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .pagina-contenedor { padding: 8px; }
    .pagina-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .pagina-header h2 { margin: 0; color: #1a237e; }
    .formulario-card, .detalle-destino { margin-bottom: 16px; }
    .formulario-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
    .span-2 { grid-column: 1 / -1; }
    .acciones-formulario { grid-column: 1/-1; display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; }
    .buscador { width: 100%; margin-bottom: 16px; }
    .cargando-contenedor { display: flex; justify-content: center; padding: 40px; }
    .previsualizacion { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .label-previa { margin: 0; color: #666; font-size: 0.85rem; }
    .imagen-previa { width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; }
    .grid-destinos { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .tarjeta-destino { overflow: hidden; transition: box-shadow 0.2s; }
    .tarjeta-destino:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .imagen-contenedor { width: 100%; height: 180px; overflow: hidden; }
    .imagen-tarjeta { width: 100%; height: 100%; object-fit: cover; }
    .sin-imagen-tarjeta { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f5f5f5; }
    .sin-imagen-tarjeta mat-icon { font-size: 48px; width: 48px; height: 48px; color: #bdbdbd; }
    .nombre-destino { margin: 0 0 4px 0; font-size: 1.1rem; color: #1a237e; }
    .pais-destino { margin: 0 0 8px 0; color: #666; font-size: 0.85rem; }
    .descripcion-destino { margin: 0 0 8px 0; font-size: 0.85rem; color: #444; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .clima-destino { margin: 0; font-size: 0.8rem; color: #e65100; }
    .detalle-contenido { display: flex; gap: 16px; }
    .imagen-destino { width: 50%; max-height: 300px; object-fit: cover; border-radius: 8px; }
    .sin-imagen { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 50%; background: #f5f5f5; border-radius: 8px; padding: 32px; color: #bdbdbd; }
    .info-destino { flex: 1; }
    .info-destino p { margin: 0 0 12px 0; }
    .sin-datos { padding: 24px; text-align: center; color: #666; }
  `]
})
export class DestinosComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Destino>([]);
  formulario!: FormGroup;
  mostrarFormulario = false;
  editando: Destino | null = null;
  destinoSeleccionado: Destino | null = null;
  cargando = false;
  guardando = false;
  urlPrevia = '';

  constructor(private fb: FormBuilder, private api: DestinoApiService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      nombre: ['', Validators.required],
      pais: ['', Validators.required],
      descripcion: [''],
      clima: [''],
      imagenUrl: ['']
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

  previsualizarImagen(): void {
    this.urlPrevia = this.formulario.get('imagenUrl')?.value || '';
  }

  errorImagen(): void {
    this.urlPrevia = '';
    this.snackBar.open('La URL de la imagen no es valida.', 'Cerrar', { duration: 3000 });
  }

  errorImagenTarjeta(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  errorImagenDetalle(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  abrirFormulario(): void {
    this.editando = null;
    this.urlPrevia = '';
    this.formulario.reset();
    this.mostrarFormulario = true;
  }

  editar(d: Destino): void {
    this.editando = d;
    this.formulario.patchValue(d);
    this.urlPrevia = d.imagenUrl || '';
    this.mostrarFormulario = true;
  }

  verDetalle(d: Destino): void {
    this.destinoSeleccionado = d;
  }

  guardar(): void {
    if (this.formulario.invalid) return;
    this.guardando = true;
    const datos = this.formulario.value;
    const op = this.editando ? this.api.actualizar(this.editando.id!, datos) : this.api.crear(datos);
    op.subscribe({
      next: () => {
        this.snackBar.open(this.editando ? 'Destino actualizado.' : 'Destino registrado.', 'OK', { duration: 3000 });
        this.cancelar();
        this.cargar();
        this.guardando = false;
      },
      error: (e) => {
        this.snackBar.open(e.error?.error || 'Error al guardar.', 'Cerrar', { duration: 4000 });
        this.guardando = false;
      }
    });
  }

  eliminar(d: Destino): void {
    if (!confirm(`Eliminar el destino "${d.nombre}"?`)) return;
    this.api.eliminar(d.id!).subscribe({
      next: () => { this.snackBar.open('Destino eliminado.', 'OK', { duration: 3000 }); this.cargar(); },
      error: (e) => this.snackBar.open(e.error?.error || 'Error al eliminar.', 'Cerrar', { duration: 4000 })
    });
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editando = null;
    this.urlPrevia = '';
    this.formulario.reset();
  }
}