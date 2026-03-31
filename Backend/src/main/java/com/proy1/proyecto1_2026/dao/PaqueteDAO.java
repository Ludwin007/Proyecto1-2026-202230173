/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.dao;

import com.proy1.proyecto1_2026.modelo.Paquete;
import com.proy1.proyecto1_2026.modelo.ServicioPaquete;
import com.proy1.proyecto1_2026.util.Conexion;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ludwi
 */

public class PaqueteDAO {

    private Paquete mapear(ResultSet rs) throws SQLException {
        Paquete p = new Paquete();
        p.setId(rs.getInt("id"));
        p.setNombre(rs.getString("nombre"));
        p.setIdDestino(rs.getInt("id_destino"));
        p.setNombreDestino(rs.getString("destino_nombre"));
        p.setDuracionDias(rs.getInt("duracion_dias"));
        p.setDescripcion(rs.getString("descripcion"));
        p.setPrecioVenta(rs.getDouble("precio_venta"));
        p.setCapacidadMaxima(rs.getInt("capacidad_maxima"));
        p.setActivo(rs.getBoolean("activo"));
        return p;
    }

    public List<Paquete> listar() throws SQLException {
        String sql = "SELECT p.*, d.nombre as destino_nombre FROM paquetes p " +
                     "JOIN destinos d ON p.id_destino = d.id ORDER BY p.nombre";
        Connection con = Conexion.obtenerConexion();
        List<Paquete> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public List<Paquete> listarActivos() throws SQLException {
        String sql = "SELECT p.*, d.nombre as destino_nombre FROM paquetes p " +
                     "JOIN destinos d ON p.id_destino = d.id WHERE p.activo = 1 ORDER BY p.nombre";
        Connection con = Conexion.obtenerConexion();
        List<Paquete> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public List<Paquete> listarPorDestino(int idDestino) throws SQLException {
        String sql = "SELECT p.*, d.nombre as destino_nombre FROM paquetes p " +
                     "JOIN destinos d ON p.id_destino = d.id WHERE p.id_destino = ? AND p.activo = 1";
        Connection con = Conexion.obtenerConexion();
        List<Paquete> lista = new ArrayList<>();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idDestino);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public Paquete obtenerPorId(int id) throws SQLException {
        String sql = "SELECT p.*, d.nombre as destino_nombre FROM paquetes p " +
                     "JOIN destinos d ON p.id_destino = d.id WHERE p.id = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Paquete p = mapear(rs);
                p.setServicios(obtenerServicios(id));
                double costo = p.getServicios().stream().mapToDouble(ServicioPaquete::getCostoProveedor).sum();
                p.setCostoTotal(costo);
                return p;
            }
            return null;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public Paquete obtenerPorNombre(String nombre) throws SQLException {
        String sql = "SELECT p.*, d.nombre as destino_nombre FROM paquetes p " +
                     "JOIN destinos d ON p.id_destino = d.id WHERE p.nombre = ?";
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

    public List<ServicioPaquete> obtenerServicios(int idPaquete) throws SQLException {
        String sql = "SELECT sp.*, pr.nombre as nombre_proveedor FROM servicios_paquete sp " +
                     "JOIN proveedores pr ON sp.id_proveedor = pr.id WHERE sp.id_paquete = ?";
        Connection con = Conexion.obtenerConexion();
        List<ServicioPaquete> lista = new ArrayList<>();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idPaquete);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                ServicioPaquete sp = new ServicioPaquete();
                sp.setId(rs.getInt("id"));
                sp.setIdPaquete(rs.getInt("id_paquete"));
                sp.setIdProveedor(rs.getInt("id_proveedor"));
                sp.setNombreProveedor(rs.getString("nombre_proveedor"));
                sp.setDescripcion(rs.getString("descripcion"));
                sp.setCostoProveedor(rs.getDouble("costo_proveedor"));
                lista.add(sp);
            }
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public int crear(Paquete p) throws SQLException {
        String sql = "INSERT INTO paquetes (nombre, id_destino, duracion_dias, descripcion, precio_venta, capacidad_maxima, activo) " +
                     "VALUES (?, ?, ?, ?, ?, ?, 1)";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, p.getNombre());
            ps.setInt(2, p.getIdDestino());
            ps.setInt(3, p.getDuracionDias());
            ps.setString(4, p.getDescripcion());
            ps.setDouble(5, p.getPrecioVenta());
            ps.setInt(6, p.getCapacidadMaxima());
            ps.executeUpdate();
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
            return -1;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean agregarServicio(ServicioPaquete sp) throws SQLException {
        String sql = "INSERT INTO servicios_paquete (id_paquete, id_proveedor, descripcion, costo_proveedor) VALUES (?, ?, ?, ?)";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, sp.getIdPaquete());
            ps.setInt(2, sp.getIdProveedor());
            ps.setString(3, sp.getDescripcion());
            ps.setDouble(4, sp.getCostoProveedor());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean actualizar(Paquete p) throws SQLException {
        String sql = "UPDATE paquetes SET nombre=?, id_destino=?, duracion_dias=?, descripcion=?, precio_venta=?, capacidad_maxima=? WHERE id=?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, p.getNombre());
            ps.setInt(2, p.getIdDestino());
            ps.setInt(3, p.getDuracionDias());
            ps.setString(4, p.getDescripcion());
            ps.setDouble(5, p.getPrecioVenta());
            ps.setInt(6, p.getCapacidadMaxima());
            ps.setInt(7, p.getId());
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean desactivar(int id) throws SQLException {
        String sql = "UPDATE paquetes SET activo = 0 WHERE id = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public int contarReservacionesPorPaquete(int idPaquete) throws SQLException {
        String sql = "SELECT COUNT(*) FROM reservaciones WHERE id_paquete = ? AND estado IN ('Pendiente','Confirmada') " +
                     "AND fecha_viaje >= CURDATE()";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idPaquete);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1);
            return 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }
}