/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.dao;

import com.proy1.proyecto1_2026.modelo.Proveedor;
import com.proy1.proyecto1_2026.util.Conexion;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ludwi
 */

public class ProveedorDAO {

    private static final String[] TIPOS = {"", "Aerolinea", "Hotel", "Tour", "Traslado", "Otro"};

    private Proveedor mapear(ResultSet rs) throws SQLException {
        Proveedor p = new Proveedor();
        p.setId(rs.getInt("id"));
        p.setNombre(rs.getString("nombre"));
        p.setTipoServicio(rs.getInt("tipo_servicio"));
        int tipo = rs.getInt("tipo_servicio");
        p.setTipoNombre(tipo >= 1 && tipo <= 5 ? TIPOS[tipo] : "Otro");
        p.setPaisOperacion(rs.getString("pais_operacion"));
        p.setContacto(rs.getString("contacto"));
        return p;
    }

    public List<Proveedor> listar() throws SQLException {
        String sql = "SELECT * FROM proveedores ORDER BY nombre";
        Connection con = Conexion.obtenerConexion();
        List<Proveedor> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public Proveedor obtenerPorId(int id) throws SQLException {
        String sql = "SELECT * FROM proveedores WHERE id = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
            return null;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public Proveedor obtenerPorNombre(String nombre) throws SQLException {
        String sql = "SELECT * FROM proveedores WHERE nombre = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, nombre);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
            return null;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean crear(Proveedor p) throws SQLException {
        String sql = "INSERT INTO proveedores (nombre, tipo_servicio, pais_operacion, contacto) VALUES (?, ?, ?, ?)";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, p.getNombre());
            ps.setInt(2, p.getTipoServicio());
            ps.setString(3, p.getPaisOperacion());
            ps.setString(4, p.getContacto());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean actualizar(Proveedor p) throws SQLException {
        String sql = "UPDATE proveedores SET nombre=?, tipo_servicio=?, pais_operacion=?, contacto=? WHERE id=?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, p.getNombre());
            ps.setInt(2, p.getTipoServicio());
            ps.setString(3, p.getPaisOperacion());
            ps.setString(4, p.getContacto());
            ps.setInt(5, p.getId());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }
}