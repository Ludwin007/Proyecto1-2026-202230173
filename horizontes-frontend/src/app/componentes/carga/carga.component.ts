import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CargaApiService } from '../../servicios/api.service';
import { ResultadoCarga } from '../../modelos/modelos';

@Component({
  selector: 'app-carga',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  template: `
    <div class="pagina-contenedor">
      <h2 class="titulo-pagina">Carga Inicial de Datos</h2>

      <mat-card class="instrucciones-card">
        <mat-card-header><mat-card-title>Instrucciones</mat-card-title></mat-card-header>
        <mat-card-content>
          <p>Seleccione un archivo .txt con codificacion UTF-8. Cada linea debe contener una instruccion valida:</p>
          <div class="instrucciones-grid">
            <div class="instruccion-item"><code>USUARIO("nombre","pass",tipo)</code><span>Registra un usuario</span></div>
            <div class="instruccion-item"><code>DESTINO("nombre","pais","desc")</code><span>Registra un destino</span></div>
            <div class="instruccion-item"><code>PROVEEDOR("nombre",tipo,"pais")</code><span>Registra un proveedor</span></div>
            <div class="instruccion-item"><code>PAQUETE("nombre","destino",dias,precio,cap)</code><span>Registra un paquete</span></div>
            <div class="instruccion-item"><code>SERVICIO_PAQUETE("paquete","proveedor","desc",costo)</code><span>Agrega servicio</span></div>
            <div class="instruccion-item"><code>CLIENTE("dpi","nombre","dd/mm/yyyy","tel","mail","nac")</code><span>Registra cliente</span></div>
            <div class="instruccion-item"><code>RESERVACION("paquete",usuario,"dd/mm/yyyy","dpi1|dpi2")</code><span>Registra reservacion</span></div>
            <div class="instruccion-item"><code>PAGO("RES-XXXXX",monto,metodo,"dd/mm/yyyy")</code><span>Registra pago</span></div>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="upload-card">
        <mat-card-content>
          <div class="zona-upload" (dragover)="$event.preventDefault()" (drop)="onDrop($event)" [class.tiene-archivo]="archivoSeleccionado">
            <mat-icon class="upload-icono">{{ archivoSeleccionado ? 'description' : 'upload_file' }}</mat-icon>
            <p *ngIf="!archivoSeleccionado">Arrastre su archivo .txt aqui o haga clic para seleccionar</p>
            <p *ngIf="archivoSeleccionado" class="nombre-archivo">{{ archivoSeleccionado.name }}</p>
            <input type="file" accept=".txt" #inputArchivo (change)="onArchivoSeleccionado($event)" style="display:none">
            <button mat-stroked-button type="button" (click)="inputArchivo.click()">
              <mat-icon>folder_open</mat-icon> Seleccionar Archivo
            </button>
          </div>
          <mat-progress-bar *ngIf="procesando" mode="indeterminate" style="margin-top:16px"></mat-progress-bar>
          <div class="acciones-carga" *ngIf="archivoSeleccionado && !procesando">
            <button mat-button (click)="limpiar()">Cancelar</button>
            <button mat-raised-button color="primary" (click)="procesar()">
              <mat-icon>play_arrow</mat-icon> Procesar Archivo
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card *ngIf="resultado" class="resultado-card">
        <mat-card-header><mat-card-title>Resultado de la Carga</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="resumen-resultado">
            <div class="metrica-resultado verde">
              <mat-icon>check_circle</mat-icon>
              <div><p class="metrica-num">{{ resultado.procesados }}</p><p class="metrica-lbl">Registros procesados</p></div>
            </div>
            <div class="metrica-resultado roja">
              <mat-icon>error</mat-icon>
              <div><p class="metrica-num">{{ resultado.errores.length }}</p><p class="metrica-lbl">Errores encontrados</p></div>
            </div>
          </div>
          <div *ngIf="resultado.errores.length > 0" class="lista-errores">
            <h4>Detalle de Errores:</h4>
            <div *ngFor="let e of resultado.errores" class="error-item">
              <mat-icon>warning</mat-icon><span>{{ e }}</span>
            </div>
          </div>
          <div *ngIf="resultado.errores.length === 0" class="exito-mensaje">
            <mat-icon>celebration</mat-icon><p>Carga completada sin errores.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .pagina-contenedor { padding: 8px; }
    .titulo-pagina { margin: 0 0 16px 0; color: #1a237e; }
    .instrucciones-card, .upload-card, .resultado-card { margin-bottom: 16px; }
    .instrucciones-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
    .instruccion-item { display: flex; flex-direction: column; background: #f5f5f5; padding: 8px; border-radius: 4px; }
    .instruccion-item code { font-family: monospace; font-size: 0.8rem; color: #1565c0; }
    .instruccion-item span { font-size: 0.75rem; color: #666; margin-top: 4px; }
    .zona-upload { border: 2px dashed #ccc; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.2s; }
    .zona-upload:hover { border-color: #3949ab; background: #f3f4ff; }
    .zona-upload.tiene-archivo { border-color: #2e7d32; background: #f1f8e9; }
    .upload-icono { font-size: 56px; width: 56px; height: 56px; color: #9e9e9e; margin-bottom: 8px; }
    .zona-upload.tiene-archivo .upload-icono { color: #2e7d32; }
    .nombre-archivo { font-weight: 600; color: #2e7d32; }
    .acciones-carga { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .resumen-resultado { display: flex; gap: 16px; margin-bottom: 16px; }
    .metrica-resultado { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-radius: 8px; }
    .metrica-resultado.verde { background: #e8f5e9; }
    .metrica-resultado.roja { background: #ffebee; }
    .metrica-resultado.verde mat-icon { color: #2e7d32; font-size: 36px; width: 36px; height: 36px; }
    .metrica-resultado.roja mat-icon { color: #c62828; font-size: 36px; width: 36px; height: 36px; }
    .metrica-num { font-size: 2rem; font-weight: 700; margin: 0; }
    .metrica-lbl { margin: 0; font-size: 0.8rem; color: #555; }
    .lista-errores h4 { color: #c62828; margin: 0 0 8px 0; }
    .error-item { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f5f5f5; }
    .error-item mat-icon { color: #f57c00; font-size: 18px; flex-shrink: 0; }
    .error-item span { font-size: 0.875rem; color: #333; }
    .exito-mensaje { display: flex; align-items: center; gap: 12px; color: #2e7d32; padding: 16px; }
    .exito-mensaje mat-icon { font-size: 36px; }
    .exito-mensaje p { font-size: 1.1rem; margin: 0; }
  `]
})
export class CargaComponent {
  archivoSeleccionado: File | null = null;
  procesando = false;
  resultado: ResultadoCarga | null = null;

  constructor(private api: CargaApiService, private snackBar: MatSnackBar) {}

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) { this.archivoSeleccionado = input.files[0]; this.resultado = null; }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const archivo = event.dataTransfer?.files[0];
    if (archivo && archivo.name.endsWith('.txt')) { this.archivoSeleccionado = archivo; this.resultado = null; }
  }

  procesar(): void {
    if (!this.archivoSeleccionado) return;
    this.procesando = true;
    this.api.cargarArchivo(this.archivoSeleccionado).subscribe({
      next: (r) => {
        this.resultado = r;
        this.procesando = false;
        this.snackBar.open(`Carga completada: ${r.procesados} registros, ${r.errores.length} errores.`, 'OK', { duration: 5000 });
      },
      error: () => { this.procesando = false; this.snackBar.open('Error al procesar el archivo.', 'Cerrar', { duration: 4000 }); }
    });
  }

  limpiar(): void { this.archivoSeleccionado = null; this.resultado = null; }
}