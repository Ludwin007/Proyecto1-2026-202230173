export interface Usuario {
  id: number;
  nombreUsuario: string;
  contrasena?: string;
  idRol: number;
  nombreRol?: string;
  activo?: boolean;
}

export interface Destino {
  id?: number;
  nombre: string;
  pais: string;
  descripcion?: string;
  clima?: string;
  imagenUrl?: string;
}

export interface Proveedor {
  id?: number;
  nombre: string;
  tipoServicio: number;
  tipoNombre?: string;
  paisOperacion?: string;
  contacto?: string;
}

export interface ServicioPaquete {
  id?: number;
  idPaquete?: number;
  idProveedor: number;
  nombreProveedor?: string;
  descripcion: string;
  costoProveedor: number;
}

export interface Paquete {
  id?: number;
  nombre: string;
  idDestino: number;
  nombreDestino?: string;
  duracionDias: number;
  descripcion?: string;
  precioVenta: number;
  capacidadMaxima: number;
  activo?: boolean;
  servicios?: ServicioPaquete[];
  costoTotal?: number;
}

export interface Cliente {
  id?: number;
  dpiPasaporte: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  telefono?: string;
  correo?: string;
  nacionalidad?: string;
}

export interface Reservacion {
  id?: number;
  numeroReservacion?: string;
  fechaCreacion?: string;
  fechaViaje: string;
  idPaquete: number;
  nombrePaquete?: string;
  cantidadPasajeros?: number;
  idAgente?: number;
  nombreAgente?: string;
  costoTotal?: number;
  estado?: string;
  pasajeros?: Cliente[];
  totalPagado?: number;
}

export interface Pago {
  id?: number;
  idReservacion?: number;
  numeroReservacion?: string;
  monto: number;
  metodoPago: number;
  metodoPagoNombre?: string;
  fechaPago: string;
}

export interface SesionUsuario {
  id: number;
  nombreUsuario: string;
  idRol: number;
  nombreRol: string;
}

export interface ResultadoCarga {
  procesados: number;
  errores: string[];
}