import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReporteApiService } from '../../servicios/api.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule,
    MatSnackBarModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="pagina-contenedor">
      <h2 class="titulo-pagina">Reportes Financieros</h2>

      <mat-card class="filtros-card">
        <mat-card-content>
          <div class="filtros-fila">
            <mat-form-field appearance="outline">
              <mat-label>Fecha Inicio</mat-label>
              <input matInput type="date" [(ngModel)]="fechaInicio">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Fecha Fin</mat-label>
              <input matInput type="date" [(ngModel)]="fechaFin">
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Tipo de Reporte</mat-label>
              <mat-select [(ngModel)]="tipoReporte">
                <mat-option value="ventas">Ventas</mat-option>
                <mat-option value="cancelaciones">Cancelaciones</mat-option>
                <mat-option value="ganancias">Ganancias</mat-option>
                <mat-option value="agente-mas-ventas">Agente con mas ventas</mat-option>
                <mat-option value="agente-mas-ganancias">Agente con mas ganancias</mat-option>
                <mat-option value="paquete-mas-vendido">Paquete mas vendido</mat-option>
                <mat-option value="paquete-menos-vendido">Paquete menos vendido</mat-option>
                <mat-option value="ocupacion-destinos">Ocupacion por destino</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-raised-button color="primary" (click)="generar()" [disabled]="cargando">
              <mat-icon>bar_chart</mat-icon> Generar
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div *ngIf="cargando" class="cargando-contenedor"><mat-spinner diameter="40"></mat-spinner></div>

      <mat-card *ngIf="!cargando && mostrarResultado" class="resultado-card">
        <mat-card-header>
          <mat-card-title>{{ tituloReporte }}</mat-card-title>
          <mat-card-subtitle *ngIf="fechaInicio || fechaFin">{{ fechaInicio || 'Inicio' }} - {{ fechaFin || 'Hoy' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="tipoReporte === 'ganancias' && resumenGanancias" class="resumen-ganancias">
            <div class="tarjeta-metrica azul">
              <p class="metrica-valor">Q. {{ resumenGanancias['totalVentas'] | number:'1.2-2' }}</p>
              <p class="metrica-label">Total Ventas</p>
            </div>
            <div class="tarjeta-metrica naranja">
              <p class="metrica-valor">Q. {{ resumenGanancias['totalCostos'] | number:'1.2-2' }}</p>
              <p class="metrica-label">Total Costos</p>
            </div>
            <div class="tarjeta-metrica verde">
              <p class="metrica-valor">Q. {{ resumenGanancias['gananciaBruta'] | number:'1.2-2' }}</p>
              <p class="metrica-label">Ganancia Bruta</p>
            </div>
            <div class="tarjeta-metrica roja">
              <p class="metrica-valor">Q. {{ resumenGanancias['totalReembolsos'] | number:'1.2-2' }}</p>
              <p class="metrica-label">Total Reembolsos</p>
            </div>
            <div class="tarjeta-metrica morada">
              <p class="metrica-valor">Q. {{ resumenGanancias['gananciaNeta'] | number:'1.2-2' }}</p>
              <p class="metrica-label">Ganancia Neta</p>
            </div>
          </div>

          <div *ngIf="(tipoReporte === 'agente-mas-ventas' || tipoReporte === 'agente-mas-ganancias') && resumenAgente" class="resumen-agente">
            <div class="info-agente">
              <mat-icon>emoji_events</mat-icon>
              <div>
                <h3>{{ resumenAgente['agente'] }}</h3>
                <p *ngIf="tipoReporte === 'agente-mas-ventas'">Reservaciones: <strong>{{ resumenAgente['totalReservaciones'] }}</strong> | Monto: <strong>Q. {{ resumenAgente['totalMonto'] | number:'1.2-2' }}</strong></p>
                <p *ngIf="tipoReporte === 'agente-mas-ganancias'">Ganancia generada: <strong>Q. {{ resumenAgente['gananciaGenerada'] | number:'1.2-2' }}</strong></p>
              </div>
            </div>
          </div>

          <table mat-table [dataSource]="datosTabla" *ngIf="datosTabla.length > 0 && tipoReporte !== 'ganancias' && tipoReporte !== 'agente-mas-ventas' && tipoReporte !== 'agente-mas-ganancias'" class="tabla-reporte">
            <ng-container *ngFor="let col of columnasTabla" [matColumnDef]="col">
              <th mat-header-cell *matHeaderCellDef>{{ col | titlecase }}</th>
              <td mat-cell *matCellDef="let row">
                <span *ngIf="esNumero(row[col])">{{ row[col] | number:'1.2-2' }}</span>
                <span *ngIf="!esNumero(row[col])">{{ row[col] }}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columnasTabla"></tr>
            <tr mat-row *matRowDef="let row; columns: columnasTabla;"></tr>
          </table>

          <div *ngIf="datosTabla.length === 0 && tipoReporte !== 'ganancias' && tipoReporte !== 'agente-mas-ventas' && tipoReporte !== 'agente-mas-ganancias'" class="sin-datos">
            Sin datos para el periodo seleccionado.
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .pagina-contenedor { padding: 8px; }
    .titulo-pagina { margin: 0 0 16px 0; color: #1a237e; }
    .filtros-card { margin-bottom: 16px; }
    .filtros-fila { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .filtros-fila mat-form-field { min-width: 150px; }
    .cargando-contenedor { display: flex; justify-content: center; padding: 40px; }
    .resultado-card { margin-bottom: 16px; }
    .resumen-ganancias { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
    .tarjeta-metrica { padding: 16px 20px; border-radius: 8px; min-width: 150px; }
    .tarjeta-metrica.azul { background: #e3f2fd; }
    .tarjeta-metrica.naranja { background: #fff3e0; }
    .tarjeta-metrica.verde { background: #e8f5e9; }
    .tarjeta-metrica.roja { background: #ffebee; }
    .tarjeta-metrica.morada { background: #ede7f6; }
    .metrica-valor { font-size: 1.3rem; font-weight: 700; margin: 0; }
    .metrica-label { margin: 4px 0 0 0; font-size: 0.8rem; color: #555; }
    .resumen-agente .info-agente { display: flex; align-items: center; gap: 16px; padding: 16px; background: #f9f9f9; border-radius: 8px; }
    .resumen-agente mat-icon { font-size: 48px; width: 48px; height: 48px; color: #f9a825; }
    .resumen-agente h3 { margin: 0 0 4px 0; }
    .tabla-reporte { width: 100%; }
    .sin-datos { padding: 24px; text-align: center; color: #666; }
  `]
})
export class ReportesComponent {
  fechaInicio = '';
  fechaFin = '';
  tipoReporte = 'ventas';
  cargando = false;
  mostrarResultado = false;
  tituloReporte = '';
  datosTabla: any[] = [];
  columnasTabla: string[] = [];
  resumenGanancias: any = null;
  resumenAgente: any = null;

  constructor(private api: ReporteApiService, private snackBar: MatSnackBar) {}

  generar(): void {
    this.cargando = true;
    this.mostrarResultado = false;
    this.datosTabla = [];
    this.resumenGanancias = null;
    this.resumenAgente = null;
    const titulos: Record<string, string> = {
      'ventas': 'Reporte de Ventas', 'cancelaciones': 'Reporte de Cancelaciones',
      'ganancias': 'Reporte de Ganancias', 'agente-mas-ventas': 'Agente con mas Ventas',
      'agente-mas-ganancias': 'Agente con mas Ganancias', 'paquete-mas-vendido': 'Paquete mas Vendido',
      'paquete-menos-vendido': 'Paquete menos Vendido', 'ocupacion-destinos': 'Ocupacion por Destino'
    };
    this.tituloReporte = titulos[this.tipoReporte] || 'Reporte';
    const inicio = this.fechaInicio || undefined;
    const fin = this.fechaFin || undefined;
    const manejarLista = (obs: any) => obs.subscribe({
      next: (datos: any[]) => { this.datosTabla = datos; if (datos.length > 0) this.columnasTabla = Object.keys(datos[0]); this.mostrarResultado = true; this.cargando = false; },
      error: () => { this.snackBar.open('Error al generar reporte.', 'Cerrar', { duration: 4000 }); this.cargando = false; }
    });
    const manejarObjeto = (obs: any, tipo: string) => obs.subscribe({
      next: (datos: any) => { if (tipo === 'ganancias') this.resumenGanancias = datos; else this.resumenAgente = datos; this.mostrarResultado = true; this.cargando = false; },
      error: () => { this.snackBar.open('Error al generar reporte.', 'Cerrar', { duration: 4000 }); this.cargando = false; }
    });
    switch (this.tipoReporte) {
      case 'ventas': manejarLista(this.api.ventas(inicio, fin)); break;
      case 'cancelaciones': manejarLista(this.api.cancelaciones(inicio, fin)); break;
      case 'ganancias': manejarObjeto(this.api.ganancias(inicio, fin), 'ganancias'); break;
      case 'agente-mas-ventas': manejarObjeto(this.api.agenteMasVentas(inicio, fin), 'agente'); break;
      case 'agente-mas-ganancias': manejarObjeto(this.api.agenteMasGanancias(inicio, fin), 'agente'); break;
      case 'paquete-mas-vendido': manejarLista(this.api.paqueteMasVendido(inicio, fin)); break;
      case 'paquete-menos-vendido': manejarLista(this.api.paqueteMenosVendido(inicio, fin)); break;
      case 'ocupacion-destinos': manejarLista(this.api.ocupacionDestinos(inicio, fin)); break;
    }
  }

  esNumero(valor: any): boolean { return typeof valor === 'number'; }
}