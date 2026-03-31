/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.modelo;
import java.util.Date;

/**
 *
 * @author ludwi
 */

public class Pago {
    private int id;
    private int idReservacion;
    private String numeroReservacion;
    private double monto;
    private int metodoPago;
    private String metodoPagoNombre;
    private Date fechaPago;

    public Pago() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getIdReservacion() { return idReservacion; }
    public void setIdReservacion(int idReservacion) { this.idReservacion = idReservacion; }
    public String getNumeroReservacion() { return numeroReservacion; }
    public void setNumeroReservacion(String numeroReservacion) { this.numeroReservacion = numeroReservacion; }
    public double getMonto() { return monto; }
    public void setMonto(double monto) { this.monto = monto; }
    public int getMetodoPago() { return metodoPago; }
    public void setMetodoPago(int metodoPago) { this.metodoPago = metodoPago; }
    public String getMetodoPagoNombre() { return metodoPagoNombre; }
    public void setMetodoPagoNombre(String metodoPagoNombre) { this.metodoPagoNombre = metodoPagoNombre; }
    public Date getFechaPago() { return fechaPago; }
    public void setFechaPago(Date fechaPago) { this.fechaPago = fechaPago; }
}
