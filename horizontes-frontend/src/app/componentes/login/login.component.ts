import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="login-contenedor">
      <mat-card class="login-tarjeta">
        <mat-card-header>
          <div class="login-logo">
            <mat-icon class="logo-icono">flight_takeoff</mat-icon>
            <h1>Horizontes Sin Limites</h1>
            <p class="subtitulo">Sistema de Gestion de Viajes</p>
          </div>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="formulario" (ngSubmit)="ingresar()">
            <mat-form-field appearance="outline" class="campo-completo">
              <mat-label>Usuario</mat-label>
              <input matInput formControlName="usuario" placeholder="Ingrese su usuario" autocomplete="username">
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="formulario.get('usuario')?.hasError('required')">El usuario es requerido</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="campo-completo">
              <mat-label>Contrasena</mat-label>
              <input matInput [type]="mostrarPass ? 'text' : 'password'" formControlName="contrasena" autocomplete="current-password">
              <button mat-icon-button matSuffix type="button" (click)="mostrarPass = !mostrarPass">
                <mat-icon>{{ mostrarPass ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="formulario.get('contrasena')?.hasError('required')">La contrasena es requerida</mat-error>
            </mat-form-field>
            <div *ngIf="error" class="mensaje-error">{{ error }}</div>
            <button mat-raised-button color="primary" type="submit" class="btn-ingresar" [disabled]="cargando">
              <mat-spinner *ngIf="cargando" diameter="20" class="spinner-btn"></mat-spinner>
              <span *ngIf="!cargando">Ingresar</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-contenedor {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
    }
    .login-tarjeta {
      width: 400px;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }
    .login-logo {
      text-align: center;
      width: 100%;
      margin-bottom: 24px;
    }
    .logo-icono {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: #3949ab;
    }
    h1 {
      margin: 8px 0 4px 0;
      font-size: 1.4rem;
      color: #1a237e;
    }
    .subtitulo {
      margin: 0;
      color: #666;
      font-size: 0.85rem;
    }
    .campo-completo {
      width: 100%;
      margin-bottom: 8px;
    }
    .btn-ingresar {
      width: 100%;
      height: 44px;
      margin-top: 8px;
      font-size: 1rem;
    }
    .mensaje-error {
      background: #ffebee;
      color: #c62828;
      padding: 8px 12px;
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 0.875rem;
    }
    .spinner-btn {
      display: inline-block;
    }
  `]
})
export class LoginComponent {
  formulario: FormGroup;
  cargando = false;
  error = '';
  mostrarPass = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.formulario = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
    if (this.auth.estaLogueado()) this.router.navigate(['/dashboard']);
  }

  ingresar(): void {
    if (this.formulario.invalid) return;
    this.cargando = true;
    this.error = '';
    const { usuario, contrasena } = this.formulario.value;
    this.auth.login(usuario, contrasena).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.error = 'Usuario o contrasena incorrectos.';
        this.cargando = false;
      }
    });
  }
}