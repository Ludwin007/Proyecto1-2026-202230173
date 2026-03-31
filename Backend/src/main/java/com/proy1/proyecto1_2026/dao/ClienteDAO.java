/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.dao;

import com.proy1.proyecto1_2026.modelo.Cliente;
import com.proy1.proyecto1_2026.util.Conexion;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ludwi
 */

public class ClienteDAO {

    private Cliente mapear(ResultSet rs) throws SQLException {
        Cliente c = new Cliente();
        c.setId(rs.getInt("id"));
        c.setDpiPasaporte(rs.getString("dpi_pasaporte"));
        c.setNombreCompleto(rs.getString("nombre_completo"));
        c.setFechaNacimiento(rs.getDate("fecha_nacimiento"));
        c.setTelefono(rs.getString("telefono"));
        c.setCorreo(rs.getString("correo"));
        c.setNacionalidad(rs.getString("nacionalidad"));
        return c;
    }

    public List<Cliente> listar() throws SQLException {
        String sql = "SELECT * FROM clientes ORDER BY nombre_completo";
        Connection con = Conexion.obtenerConexion();
        List<Cliente> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public Cliente obtenerPorId(int id) throws SQLException {
        String sql = "SELECT * FROM clientes WHERE id = ?";
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

    public Cliente obtenerPorDpi(String dpi) throws SQLException {
        String sql = "SELECT * FROM clientes WHERE dpi_pasaporte = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, dpi);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
            return null;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean crear(Cliente c) throws SQLException {
        String sql = "INSERT INTO clientes (dpi_pasaporte, nombre_completo, fecha_nacimiento, telefono, correo, nacionalidad) " +
                     "VALUES (?, ?, ?, ?, ?, ?)";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, c.getDpiPasaporte());
            ps.setString(2, c.getNombreCompleto());
            ps.setDate(3, new java.sql.Date(c.getFechaNacimiento().getTime()));
            ps.setString(4, c.getTelefono());
            ps.setString(5, c.getCorreo());
            ps.setString(6, c.getNacionalidad());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean actualizar(Cliente c) throws SQLException {
        String sql = "UPDATE clientes SET nombre_completo=?, fecha_nacimiento=?, telefono=?, correo=?, nacionalidad=? WHERE id=?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, c.getNombreCompleto());
            ps.setDate(2, new java.sql.Date(c.getFechaNacimiento().getTime()));
            ps.setString(3, c.getTelefono());
            ps.setString(4, c.getCorreo());
            ps.setString(5, c.getNacionalidad());
            ps.setInt(6, c.getId());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public List<Cliente> buscarPorNombre(String nombre) throws SQLException {
        String sql = "SELECT * FROM clientes WHERE nombre_completo LIKE ? ORDER BY nombre_completo";
        Connection con = Conexion.obtenerConexion();
        List<Cliente> lista = new ArrayList<>();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, "%" + nombre + "%");
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }
}