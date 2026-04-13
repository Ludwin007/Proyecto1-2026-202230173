import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { ReservacionApiService, ClienteApiService, PaqueteApiService } from '../../servicios/api.service';
import { AuthService } from '../../servicios/auth.service';
import { Reservacion, Cliente, Paquete, Pago } from '../../modelos/modelos';

@Component({
  selector: 'app-reservaciones',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="pagina-contenedor">
      <div class="pagina-header">
        <h2>Gestion de Reservaciones</h2>
        <button mat-raised-button color="primary" (click)="nuevaReservacion()">
          <mat-icon>add</mat-icon> Nueva Reservacion
        </button>
      </div>

      <mat-card *ngIf="mostrarFormulario" class="formulario-card">
        <mat-card-header><mat-card-title>Nueva Reservacion</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="guardar()">
            <div class="formulario-grid">
              <mat-form-field appearance="outline">
                <mat-label>Paquete Turistico</mat-label>
                <mat-select formControlName="idPaquete" (selectionChange)="onPaqueteChange($event.value)">
                  <mat-option *ngFor="let p of paquetes" [value]="p.id">{{ p.nombre }} - Q. {{ p.precioVenta | number:'1.2-2' }}</mat-option>
                </mat-select>
                <mat-error *ngIf="formulario.get('idPaquete')?.hasError('required')">Requerido</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Fecha de Viaje</mat-label>
                <input matInput type="date" formControlName="fechaViaje">
                <mat-error *ngIf="formulario.get('fechaViaje')?.hasError('required')">Requerido</mat-error>
              </mat-form-field>
            </div>

            <div class="busqueda-pasajero">
              <h4>Agregar Pasajeros</h4>
              <div class="buscar-fila">
                <mat-form-field appearance="outline">
                  <mat-label>Buscar por Nombre</mat-label>
                  <input matInput [(ngModel)]="textoBusqueda" [ngModelOptions]="{standalone:true}" (keyup)="buscarCliente()">
                  <mat-icon matSuffix>search</mat-icon>
                </mat-form-field>
                <button mat-stroked-button type="button" (click)="mostrarFormNuevoCliente = !mostrarFormNuevoCliente">
                  <mat-icon>person_add</mat-icon> Nuevo cliente
                </button>
              </div>

              <mat-card *ngIf="mostrarFormNuevoCliente" style="margin:8px 0">
                <mat-card-content>
                  <form [formGroup]="formCliente" class="formulario-grid">
                    <mat-form-field appearance="outline"><mat-label>DPI</mat-label><input matInput formControlName="dpiPasaporte"></mat-form-field>
                    <mat-form-field appearance="outline"><mat-label>Nombre Completo</mat-label><input matInput formControlName="nombreCompleto"></mat-form-field>
                    <mat-form-field appearance="outline"><mat-label>Fecha Nacimiento</mat-label><input matInput type="date" formControlName="fechaNacimiento"></mat-form-field>
                    <mat-form-field appearance="outline"><mat-label>Telefono</mat-label><input matInput formControlName="telefono"></mat-form-field>
                    <mat-form-field appearance="outline"><mat-label>Correo</mat-label><input matInput formControlName="correo"></mat-form-field>
                    <mat-form-field appearance="outline"><mat-label>Nacionalidad</mat-label><input matInput formControlName="nacionalidad"></mat-form-field>
                    <div class="acciones-formulario">
                      <button mat-button type="button" (click)="mostrarFormNuevoCliente = false">Cancelar</button>
                      <button mat-raised-button color="accent" type="button" (click)="guardarNuevoCliente()">Registrar y Agregar</button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>

              <div *ngIf="resultadosBusqueda.length > 0" style="margin-top:8px">
                <div *ngFor="let c of resultadosBusqueda" class="resultado-item" (click)="agregarPasajero(c)">
                  <mat-icon>person</mat-icon>
                  <span>{{ c.nombreCompleto }} - {{ c.dpiPasaporte }}</span>
                  <mat-icon color="primary">add_circle</mat-icon>
                </div>
              </div>

              <div *ngIf="pasajerosSeleccionados.length > 0" style="margin-top:12px">
                <h5 style="margin:0 0 8px 0">Pasajeros agregados ({{ pasajerosSeleccionados.length }}):</h5>
                <span *ngFor="let p of pasajerosSeleccionados; let i = index" class="pasajero-chip">
                  {{ p.nombreCompleto }}
                  <button mat-icon-button (click)="quitarPasajero(i)" style="width:20px;height:20px;line-height:20px">
                    <mat-icon style="font-size:14px">close</mat-icon>
                  </button>
                </span>
              </div>
            </div>

            <div *ngIf="paqueteSeleccionado && pasajerosSeleccionados.length > 0" class="resumen-reservacion">
              <h4>Resumen</h4>
              <p>Paquete: <strong>{{ paqueteSeleccionado.nombre }}</strong></p>
              <p>Pasajeros: <strong>{{ pasajerosSeleccionados.length }}</strong></p>
              <p>Precio por persona: <strong>Q. {{ paqueteSeleccionado.precioVenta | number:'1.2-2' }}</strong></p>
              <p class="costo-total">Costo Total: <strong>Q. {{ paqueteSeleccionado.precioVenta * pasajerosSeleccionados.length | number:'1.2-2' }}</strong></p>
            </div>

            <div class="acciones-formulario" style="margin-top:16px">
              <button mat-button type="button" (click)="cancelarFormulario()">Cancelar</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="guardando || pasajerosSeleccionados.length === 0">
                {{ guardando ? 'Registrando...' : 'Confirmar Reservacion' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="reservacionActual" class="detalle-reservacion">
        <mat-card-header>
          <mat-card-title>{{ reservacionActual.numeroReservacion }}</mat-card-title>
          <mat-card-subtitle><span [class]="'estado-' + reservacionActual.estado?.toLowerCase()">{{ reservacionActual.estado }}</span></mat-card-subtitle>
          <button mat-icon-button (click)="reservacionActual = null" style="margin-left:auto"><mat-icon>close</mat-icon></button>
        </mat-card-header>
        <mat-card-content>
          <div class="detalle-grid">
            <div><strong>Paquete:</strong> {{ reservacionActual.nombrePaquete }}</div>
            <div><strong>Fecha Viaje:</strong> {{ reservacionActual.fechaViaje | date:'dd/MM/yyyy' }}</div>
            <div><strong>Pasajeros:</strong> {{ reservacionActual.cantidadPasajeros }}</div>
            <div><strong>Agente:</strong> {{ reservacionActual.nombreAgente }}</div>
            <div><strong>Costo Total:</strong> Q. {{ reservacionActual.costoTotal | number:'1.2-2' }}</div>
            <div><strong>Total Pagado:</strong> Q. {{ reservacionActual.totalPagado | number:'1.2-2' }}</div>
            <div><strong>Saldo Pendiente:</strong>
              <span [style.color]="saldoPendiente > 0 ? '#e65100' : '#2e7d32'">
                Q. {{ saldoPendiente | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <div *ngIf="reservacionActual.estado === 'Pendiente' || reservacionActual.estado === 'Confirmada'" style="margin-top:8px">
            <button mat-raised-button color="primary" (click)="mostrarFormPago = !mostrarFormPago" *ngIf="saldoPendiente > 0">
              <mat-icon>payment</mat-icon> Registrar Pago
            </button>
            <button mat-raised-button color="warn" (click)="cancelarReservacion()" style="margin-left:8px">
              <mat-icon>cancel</mat-icon> Cancelar Reservacion
            </button>
          </div>

          <mat-card *ngIf="mostrarFormPago" style="margin-top:12px">
            <mat-card-content>
              <div class="info-saldo">
                <mat-icon style="color:#e65100">info</mat-icon>
                <span>Saldo pendiente: <strong>Q. {{ saldoPendiente | number:'1.2-2' }}</strong></span>
              </div>
              <form [formGroup]="formPago" (ngSubmit)="registrarPago()" class="formulario-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Monto (Q.) - Maximo Q. {{ saldoPendiente | number:'1.2-2' }}</mat-label>
                  <input matInput type="number" formControlName="monto" [max]="saldoPendiente" min="0.01">
                  <mat-error *ngIf="formPago.get('monto')?.hasError('required')">Requerido</mat-error>
                  <mat-error *ngIf="formPago.get('monto')?.hasError('max')">El monto no puede superar el saldo pendiente</mat-error>
                  <mat-error *ngIf="formPago.get('monto')?.hasError('min')">El monto debe ser mayor a 0</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Metodo de Pago</mat-label>
                  <mat-select formControlName="metodoPago">
                    <mat-option [value]="1">Efectivo</mat-option>
                    <mat-option [value]="2">Tarjeta</mat-option>
                    <mat-option [value]="3">Transferencia</mat-option>
                  </mat-select>
                  <mat-error *ngIf="formPago.get('metodoPago')?.hasError('required')">Requerido</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Fecha de Pago</mat-label>
                  <input matInput type="date" formControlName="fechaPago">
                  <mat-error *ngIf="formPago.get('fechaPago')?.hasError('required')">Requerido</mat-error>
                </mat-form-field>
                <div class="acciones-formulario">
                  <button mat-button type="button" (click)="mostrarFormPago = false">Cancelar</button>
                  <button mat-raised-button color="primary" type="submit" [disabled]="formPago.invalid">Registrar Pago</button>
                </div>
              </form>
            </mat-card-content>
          </mat-card>

          <h4 style="margin-top:16px">Historial de Pagos</h4>
          <div *ngIf="pagosActuales.length === 0" class="sin-datos">Sin pagos registrados.</div>
          <table mat-table [dataSource]="pagosActuales" *ngIf="pagosActuales.length > 0" class="tabla-pagos">
            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let p">{{ p.fechaPago | date:'dd/MM/yyyy' }}</td>
            </ng-container>
            <ng-container matColumnDef="monto">
              <th mat-header-cell *matHeaderCellDef>Monto Pagado</th>
              <td mat-cell *matCellDef="let p"><strong style="color:#2e7d32">Q. {{ p.monto | number:'1.2-2' }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="metodo">
              <th mat-header-cell *matHeaderCellDef>Metodo</th>
              <td mat-cell *matCellDef="let p">{{ p.metodoPagoNombre }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="['fecha','monto','metodo']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['fecha','monto','metodo'];"></tr>
          </table>

          <div *ngIf="pagosActuales.length > 0" class="resumen-pagos">
            <div class="resumen-item">
              <span>Total pagado:</span>
              <strong style="color:#2e7d32">Q. {{ reservacionActual.totalPagado | number:'1.2-2' }}</strong>
            </div>
            <div class="resumen-item">
              <span>Costo total:</span>
              <strong>Q. {{ reservacionActual.costoTotal | number:'1.2-2' }}</strong>
            </div>
            <div class="resumen-item">
              <span>Saldo pendiente:</span>
              <strong [style.color]="saldoPendiente > 0 ? '#e65100' : '#2e7d32'">Q. {{ saldoPendiente | number:'1.2-2' }}</strong>
            </div>
          </div>

          <div *ngIf="cancelacionInfo" class="cancelacion-info">
            <h4>Informacion de Cancelacion</h4>
            <div class="detalle-grid">
              <div><strong>Monto Reembolsado:</strong> <span style="color:#2e7d32">Q. {{ cancelacionInfo.montoReembolso | number:'1.2-2' }}</span></div>
              <div><strong>Perdida Agencia:</strong> <span style="color:#c62828">Q. {{ cancelacionInfo.perdidaAgencia | number:'1.2-2' }}</span></div>
              <div><strong>Dias de Anticipacion:</strong> {{ cancelacionInfo.diasAnticipacion }} dias</div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <div class="filtros-fila">
            <mat-form-field appearance="outline">
              <mat-label>Desde</mat-label>
              <input matInput type="date" [(ngModel)]="filtroInicio" (change)="cargar()">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Hasta</mat-label>
              <input matInput type="date" [(ngModel)]="filtroFin" (change)="cargar()">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filtroEstado" (selectionChange)="cargar()">
                <mat-option value="">Todos</mat-option>
                <mat-option value="Pendiente">Pendiente</mat-option>
                <mat-option value="Confirmada">Confirmada</mat-option>
                <mat-option value="Cancelada">Cancelada</mat-option>
                <mat-option value="Completada">Completada</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-stroked-button (click)="verDelDia()"><mat-icon>today</mat-icon> Solo hoy</button>
          </div>
          <div *ngIf="cargando" class="cargando-contenedor"><mat-spinner diameter="40"></mat-spinner></div>
          <table mat-table [dataSource]="dataSource" matSort *ngIf="!cargando">
            <ng-container matColumnDef="numeroReservacion"><th mat-header-cell *matHeaderCellDef mat-sort-header>No.</th><td mat-cell *matCellDef="let r">{{ r.numeroReservacion }}</td></ng-container>
            <ng-container matColumnDef="nombrePaquete"><th mat-header-cell *matHeaderCellDef>Paquete</th><td mat-cell *matCellDef="let r">{{ r.nombrePaquete }}</td></ng-container>
            <ng-container matColumnDef="fechaViaje"><th mat-header-cell *matHeaderCellDef>Fecha Viaje</th><td mat-cell *matCellDef="let r">{{ r.fechaViaje | date:'dd/MM/yyyy' }}</td></ng-container>
            <ng-container matColumnDef="cantidadPasajeros"><th mat-header-cell *matHeaderCellDef>Pasajeros</th><td mat-cell *matCellDef="let r">{{ r.cantidadPasajeros }}</td></ng-container>
            <ng-container matColumnDef="costoTotal"><th mat-header-cell *matHeaderCellDef>Costo</th><td mat-cell *matCellDef="let r">Q. {{ r.costoTotal | number:'1.2-2' }}</td></ng-container>
            <ng-container matColumnDef="estado"><th mat-header-cell *matHeaderCellDef>Estado</th><td mat-cell *matCellDef="let r"><span [class]="'estado-' + r.estado?.toLowerCase()">{{ r.estado }}</span></td></ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let r">
                <button mat-icon-button color="primary" (click)="verDetalle(r.numeroReservacion!)" matTooltip="Ver detalle"><mat-icon>visibility</mat-icon></button>
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
    .formulario-card, .detalle-reservacion { margin-bottom: 16px; }
    .formulario-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; }
    .acciones-formulario { grid-column: 1/-1; display: flex; justify-content: flex-end; gap: 8px; }
    .busqueda-pasajero { margin-top: 16px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; }
    .busqueda-pasajero h4 { margin: 0 0 12px 0; }
    .buscar-fila { display: flex; gap: 12px; align-items: center; }
    .buscar-fila mat-form-field { flex: 1; }
    .resultado-item { display: flex; align-items: center; gap: 8px; padding: 8px; cursor: pointer; border-radius: 4px; }
    .resultado-item:hover { background: #f5f5f5; }
    .pasajero-chip { display: inline-flex; align-items: center; gap: 4px; background: #e3f2fd; padding: 4px 10px; border-radius: 20px; margin: 4px; }
    .resumen-reservacion { background: #f3f4f6; border-radius: 8px; padding: 16px; margin-top: 16px; }
    .resumen-reservacion h4 { margin: 0 0 8px 0; }
    .resumen-reservacion p { margin: 4px 0; }
    .costo-total { font-size: 1.1rem; color: #1a237e; }
    .filtros-fila { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 8px; }
    .filtros-fila mat-form-field { min-width: 140px; }
    .cargando-contenedor { display: flex; justify-content: center; padding: 40px; }
    .detalle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
    .sin-datos { padding: 16px; color: #666; text-align: center; }
    .tabla-pagos { width: 100%; margin-bottom: 8px; }
    .resumen-pagos { display: flex; gap: 24px; padding: 12px; background: #f5f5f5; border-radius: 8px; margin-top: 8px; }
    .resumen-item { display: flex; flex-direction: column; gap: 4px; }
    .resumen-item span { font-size: 0.8rem; color: #666; }
    .info-saldo { display: flex; align-items: center; gap: 8px; background: #fff3e0; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; }
    .cancelacion-info { margin-top: 16px; background: #ffebee; border-radius: 8px; padding: 16px; border-left: 4px solid #c62828; }
    .cancelacion-info h4 { margin: 0 0 12px 0; color: #c62828; }
    .estado-confirmada { background: #e8f5e9; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .estado-pendiente { background: #fff3e0; color: #e65100; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .estado-cancelada { background: #ffebee; color: #c62828; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
    .estado-completada { background: #e3f2fd; color: #1565c0; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; }
  `]
})
export class ReservacionesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<Reservacion>([]);
  columnas = ['numeroReservacion', 'nombrePaquete', 'fechaViaje', 'cantidadPasajeros', 'costoTotal', 'estado', 'acciones'];
  formulario!: FormGroup;
  formCliente!: FormGroup;
  formPago!: FormGroup;
  mostrarFormulario = false;
  mostrarFormNuevoCliente = false;
  mostrarFormPago = false;
  reservacionActual: Reservacion | null = null;
  pagosActuales: Pago[] = [];
  cancelacionInfo: any = null;
  paquetes: Paquete[] = [];
  paqueteSeleccionado: Paquete | null = null;
  pasajerosSeleccionados: Cliente[] = [];
  resultadosBusqueda: Cliente[] = [];
  textoBusqueda = '';
  filtroInicio = '';
  filtroFin = '';
  filtroEstado = '';
  cargando = false;
  guardando = false;
  saldoPendiente = 0;

  constructor(
    private fb: FormBuilder,
    private api: ReservacionApiService,
    private clienteApi: ClienteApiService,
    private paqueteApi: PaqueteApiService,
    private auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.inicializarFormularios();
    this.cargar();
    this.paqueteApi.listarActivos().subscribe(p => this.paquetes = p);
  }

  inicializarFormularios(): void {
    this.formulario = this.fb.group({
      idPaquete: ['', Validators.required],
      fechaViaje: ['', Validators.required]
    });
    this.formCliente = this.fb.group({
      dpiPasaporte: ['', Validators.required],
      nombreCompleto: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      telefono: [''], correo: [''], nacionalidad: ['']
    });
    this.formPago = this.fb.group({
      monto: ['', [Validators.required, Validators.min(0.01)]],
      metodoPago: ['', Validators.required],
      fechaPago: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  cargar(): void {
    this.cargando = true;
    this.api.listar(this.filtroInicio, this.filtroFin, this.filtroEstado).subscribe({
      next: datos => {
        this.dataSource.data = datos;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  verDelDia(): void {
    this.cargando = true;
    this.api.listarDelDia().subscribe({
      next: datos => { this.dataSource.data = datos; this.cargando = false; },
      error: () => this.cargando = false
    });
  }

  nuevaReservacion(): void {
    this.inicializarFormularios();
    this.pasajerosSeleccionados = [];
    this.mostrarFormulario = true;
  }

  onPaqueteChange(id: number): void {
    this.paqueteSeleccionado = this.paquetes.find(p => p.id === id) || null;
  }

  buscarCliente(): void {
    if (this.textoBusqueda.length < 2) { this.resultadosBusqueda = []; return; }
    this.clienteApi.buscarPorNombre(this.textoBusqueda).subscribe(r => {
      this.resultadosBusqueda = r.filter(c => !this.pasajerosSeleccionados.find(p => p.id === c.id));
    });
  }

  agregarPasajero(c: Cliente): void {
    if (!this.pasajerosSeleccionados.find(p => p.id === c.id)) this.pasajerosSeleccionados.push(c);
    this.resultadosBusqueda = [];
    this.textoBusqueda = '';
  }

  quitarPasajero(i: number): void { this.pasajerosSeleccionados.splice(i, 1); }

  guardarNuevoCliente(): void {
    if (this.formCliente.invalid) return;
    this.clienteApi.crear(this.formCliente.value).subscribe({
      next: () => {
        this.clienteApi.buscarPorNombre(this.formCliente.value.nombreCompleto).subscribe(r => {
          if (r.length > 0) this.agregarPasajero(r[0]);
        });
        this.mostrarFormNuevoCliente = false;
        this.formCliente.reset();
        this.snackBar.open('Cliente registrado.', 'OK', { duration: 3000 });
      },
      error: (e) => this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 })
    });
  }

  guardar(): void {
    if (this.formulario.invalid || this.pasajerosSeleccionados.length === 0) return;
    this.guardando = true;
    const datos = { ...this.formulario.value, pasajeros: this.pasajerosSeleccionados.map(p => p.id) };
    this.api.crear(datos).subscribe({
      next: (r) => {
        this.snackBar.open(`Reservacion ${r.numeroReservacion} creada. Costo: Q. ${r.costoTotal}`, 'OK', { duration: 5000 });
        this.cancelarFormulario();
        this.cargar();
        this.guardando = false;
      },
      error: (e) => { this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 }); this.guardando = false; }
    });
  }

  verDetalle(numero: string): void {
    this.cancelacionInfo = null;
    this.api.obtener(numero).subscribe(r => {
      this.reservacionActual = r;
      this.saldoPendiente = (r.costoTotal || 0) - (r.totalPagado || 0);
      this.actualizarValidadorMonto();
      this.api.historialPagos(numero).subscribe(p => this.pagosActuales = p);
    });
  }

  actualizarValidadorMonto(): void {
    this.formPago = this.fb.group({
      monto: ['', [Validators.required, Validators.min(0.01), Validators.max(this.saldoPendiente)]],
      metodoPago: ['', Validators.required],
      fechaPago: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  registrarPago(): void {
    if (this.formPago.invalid || !this.reservacionActual) return;
    const monto = Number(this.formPago.value.monto);
    if (monto > this.saldoPendiente) {
      this.snackBar.open(`El monto no puede superar el saldo pendiente de Q. ${this.saldoPendiente.toFixed(2)}`, 'Cerrar', { duration: 4000 });
      return;
    }
    this.api.registrarPago(this.reservacionActual.numeroReservacion!, this.formPago.value).subscribe({
      next: (r) => {
        this.snackBar.open(r.confirmada ? 'Pago registrado. Reservacion CONFIRMADA.' : 'Pago registrado correctamente.', 'OK', { duration: 4000 });
        this.mostrarFormPago = false;
        this.verDetalle(this.reservacionActual!.numeroReservacion!);
        this.cargar();
      },
      error: (e) => this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 })
    });
  }

  cancelarReservacion(): void {
    if (!this.reservacionActual || !confirm('Confirmar cancelacion?')) return;
    this.api.cancelar(this.reservacionActual.numeroReservacion!).subscribe({
      next: (r) => {
        this.cancelacionInfo = r;
        this.snackBar.open(`Cancelada. Reembolso: Q. ${r.montoReembolso}`, 'OK', { duration: 5000 });
        this.verDetalle(this.reservacionActual!.numeroReservacion!);
        this.cargar();
      },
      error: (e) => this.snackBar.open(e.error?.error || 'Error.', 'Cerrar', { duration: 4000 })
    });
  }

  cancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.pasajerosSeleccionados = [];
    this.paqueteSeleccionado = null;
    this.inicializarFormularios();
  }
}