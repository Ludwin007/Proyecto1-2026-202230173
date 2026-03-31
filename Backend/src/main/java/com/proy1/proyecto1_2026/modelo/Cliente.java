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

public class Cliente {
    private int id;
    private String dpiPasaporte;
    private String nombreCompleto;
    private Date fechaNacimiento;
    private String telefono;
    private String correo;
    private String nacionalidad;

    public Cliente() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getDpiPasaporte() { return dpiPasaporte; }
    public void setDpiPasaporte(String dpiPasaporte) { this.dpiPasaporte = dpiPasaporte; }
    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
    public Date getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(Date fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }
    public String getNacionalidad() { return nacionalidad; }
    public void setNacionalidad(String nacionalidad) { this.nacionalidad = nacionalidad; }
}
