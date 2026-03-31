/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.dao;

import com.proy1.proyecto1_2026.modelo.Destino;
import com.proy1.proyecto1_2026.util.Conexion;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ludwi
 */

public class DestinoDAO {

    private Destino mapear(ResultSet rs) throws SQLException {
        Destino d = new Destino();
        d.setId(rs.getInt("id"));
        d.setNombre(rs.getString("nombre"));
        d.setPais(rs.getString("pais"));
        d.setDescripcion(rs.getString("descripcion"));
        d.setClima(rs.getString("clima"));
        d.setImagenUrl(rs.getString("imagen_url"));
        return d;
    }

    public List<Destino> listar() throws SQLException {
        String sql = "SELECT * FROM destinos ORDER BY nombre";
        Connection con = Conexion.obtenerConexion();
        List<Destino> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public Destino obtenerPorId(int id) throws SQLException {
        String sql = "SELECT * FROM destinos WHERE id = ?";
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

    public Destino obtenerPorNombre(String nombre) throws SQLException {
        String sql = "SELECT * FROM destinos WHERE nombre = ?";
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

    public boolean crear(Destino d) throws SQLException {
        String sql = "INSERT INTO destinos (nombre, pais, descripcion, clima, imagen_url) VALUES (?, ?, ?, ?, ?)";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, d.getNombre());
            ps.setString(2, d.getPais());
            ps.setString(3, d.getDescripcion());
            ps.setString(4, d.getClima());
            ps.setString(5, d.getImagenUrl());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean actualizar(Destino d) throws SQLException {
        String sql = "UPDATE destinos SET nombre=?, pais=?, descripcion=?, clima=?, imagen_url=? WHERE id=?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, d.getNombre());
            ps.setString(2, d.getPais());
            ps.setString(3, d.getDescripcion());
            ps.setString(4, d.getClima());
            ps.setString(5, d.getImagenUrl());
            ps.setInt(6, d.getId());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean eliminar(int id) throws SQLException {
        String sql = "DELETE FROM destinos WHERE id = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }
}
