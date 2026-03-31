/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.modelo;
import java.util.Date;
import java.util.List;

/**
 *
 * @author ludwi
 */

public class Reservacion {
    private int id;
    private String numeroReservacion;
    private Date fechaCreacion;
    private Date fechaViaje;
    private int idPaquete;
    private String nombrePaquete;
    private int cantidadPasajeros;
    private int idAgente;
    private String nombreAgente;
    private double costoTotal;
    private String estado;
    private List<Cliente> pasajeros;
    private double totalPagado;

    public Reservacion() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNumeroReservacion() { return numeroReservacion; }
    public void setNumeroReservacion(String numeroReservacion) { this.numeroReservacion = numeroReservacion; }
    public Date getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(Date fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public Date getFechaViaje() { return fechaViaje; }
    public void setFechaViaje(Date fechaViaje) { this.fechaViaje = fechaViaje; }
    public int getIdPaquete() { return idPaquete; }
    public void setIdPaquete(int idPaquete) { this.idPaquete = idPaquete; }
    public String getNombrePaquete() { return nombrePaquete; }
    public void setNombrePaquete(String nombrePaquete) { this.nombrePaquete = nombrePaquete; }
    public int getCantidadPasajeros() { return cantidadPasajeros; }
    public void setCantidadPasajeros(int cantidadPasajeros) { this.cantidadPasajeros = cantidadPasajeros; }
    public int getIdAgente() { return idAgente; }
    public void setIdAgente(int idAgente) { this.idAgente = idAgente; }
    public String getNombreAgente() { return nombreAgente; }
    public void setNombreAgente(String nombreAgente) { this.nombreAgente = nombreAgente; }
    public double getCostoTotal() { return costoTotal; }
    public void setCostoTotal(double costoTotal) { this.costoTotal = costoTotal; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public List<Cliente> getPasajeros() { return pasajeros; }
    public void setPasajeros(List<Cliente> pasajeros) { this.pasajeros = pasajeros; }
    public double getTotalPagado() { return totalPagado; }
    public void setTotalPagado(double totalPagado) { this.totalPagado = totalPagado; }
}