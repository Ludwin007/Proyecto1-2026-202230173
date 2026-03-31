/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.dao;
import com.proy1.proyecto1_2026.modelo.Usuario;
import com.proy1.proyecto1_2026.util.Conexion;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ludwi
 */

public class UsuarioDAO {

    public Usuario autenticar(String nombre, String contrasena) throws SQLException {
        String sql = "SELECT u.id, u.nombre_usuario, u.id_rol, r.nombre, u.activo " +
                     "FROM usuarios u JOIN roles r ON u.id_rol = r.id " +
                     "WHERE u.nombre_usuario = ? AND u.contrasena = ? AND u.activo = 1";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, nombre);
            ps.setString(2, contrasena);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Usuario u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setNombreUsuario(rs.getString("nombre_usuario"));
                u.setIdRol(rs.getInt("id_rol"));
                u.setNombreRol(rs.getString("nombre"));
                u.setActivo(rs.getBoolean("activo"));
                return u;
            }
            return null;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean crear(Usuario u) throws SQLException {
        String sql = "INSERT INTO usuarios (nombre_usuario, contrasena, id_rol, activo) VALUES (?, ?, ?, 1)";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, u.getNombreUsuario());
            ps.setString(2, u.getContrasena());
            ps.setInt(3, u.getIdRol());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public List<Usuario> listar() throws SQLException {
        String sql = "SELECT u.id, u.nombre_usuario, u.id_rol, r.nombre, u.activo " +
                     "FROM usuarios u JOIN roles r ON u.id_rol = r.id ORDER BY u.nombre_usuario";
        Connection con = Conexion.obtenerConexion();
        List<Usuario> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) {
                Usuario u = new Usuario();
                u.setId(rs.getInt("id"));
                u.setNombreUsuario(rs.getString("nombre_usuario"));
                u.setIdRol(rs.getInt("id_rol"));
                u.setNombreRol(rs.getString("nombre"));
                u.setActivo(rs.getBoolean("activo"));
                lista.add(u);
            }
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public boolean cambiarRol(int idUsuario, int nuevoRol) throws SQLException {
        String sql = "UPDATE usuarios SET id_rol = ? WHERE id = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, nuevoRol);
            ps.setInt(2, idUsuario);
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean desactivar(int idUsuario) throws SQLException {
        String sql = "UPDATE usuarios SET activo = 0 WHERE id = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idUsuario);
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean existeNombre(String nombre) throws SQLException {
        String sql = "SELECT id FROM usuarios WHERE nombre_usuario = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, nombre);
            return ps.executeQuery().next();
        } finally {
           new Conexion().desconectar(con);
        }
    }
}
