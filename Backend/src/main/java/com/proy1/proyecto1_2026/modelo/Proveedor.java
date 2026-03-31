/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.modelo;

/**
 *
 * @author ludwi
 */

public class Proveedor {
    private int id;
    private String nombre;
    private int tipoServicio;
    private String tipoNombre;
    private String paisOperacion;
    private String contacto;

    public Proveedor() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public int getTipoServicio() { return tipoServicio; }
    public void setTipoServicio(int tipoServicio) { this.tipoServicio = tipoServicio; }
    public String getTipoNombre() { return tipoNombre; }
    public void setTipoNombre(String tipoNombre) { this.tipoNombre = tipoNombre; }
    public String getPaisOperacion() { return paisOperacion; }
    public void setPaisOperacion(String paisOperacion) { this.paisOperacion = paisOperacion; }
    public String getContacto() { return contacto; }
    public void setContacto(String contacto) { this.contacto = contacto; }
}
