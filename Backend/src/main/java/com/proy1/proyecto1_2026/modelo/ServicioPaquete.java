/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.modelo;

/**
 *
 * @author ludwi
 */

public class ServicioPaquete {
    private int id;
    private int idPaquete;
    private int idProveedor;
    private String nombreProveedor;
    private String descripcion;
    private double costoProveedor;

    public ServicioPaquete() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getIdPaquete() { return idPaquete; }
    public void setIdPaquete(int idPaquete) { this.idPaquete = idPaquete; }
    public int getIdProveedor() { return idProveedor; }
    public void setIdProveedor(int idProveedor) { this.idProveedor = idProveedor; }
    public String getNombreProveedor() { return nombreProveedor; }
    public void setNombreProveedor(String nombreProveedor) { this.nombreProveedor = nombreProveedor; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public double getCostoProveedor() { return costoProveedor; }
    public void setCostoProveedor(double costoProveedor) { this.costoProveedor = costoProveedor; }
}
