/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.dao;

import com.proy1.proyecto1_2026.modelo.Cliente;
import com.proy1.proyecto1_2026.modelo.Reservacion;
import com.proy1.proyecto1_2026.util.Conexion;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ludwi
 */

public class ReservacionDAO {

    private Reservacion mapear(ResultSet rs) throws SQLException {
        Reservacion r = new Reservacion();
        r.setId(rs.getInt("id"));
        r.setNumeroReservacion(rs.getString("numero_reservacion"));
        r.setFechaCreacion(rs.getDate("fecha_creacion"));
        r.setFechaViaje(rs.getDate("fecha_viaje"));
        r.setIdPaquete(rs.getInt("id_paquete"));
        r.setNombrePaquete(rs.getString("paquete_nombre"));
        r.setCantidadPasajeros(rs.getInt("cantidad_pasajeros"));
        r.setIdAgente(rs.getInt("id_agente"));
        r.setNombreAgente(rs.getString("agente_nombre"));
        r.setCostoTotal(rs.getDouble("costo_total"));
        r.setEstado(rs.getString("estado"));
        return r;
    }

    private String generarNumero(Connection con) throws SQLException {
        String sql = "SELECT IFNULL(MAX(CAST(SUBSTRING(numero_reservacion, 5) AS UNSIGNED)), 0) + 1 AS num FROM reservaciones";
        Statement st = con.createStatement();
        ResultSet rs = st.executeQuery(sql);
        rs.next();
        int num = rs.getInt("num");
        return String.format("RES-%05d", num);
    }

    public String crear(Reservacion r, List<Integer> idsClientes) throws SQLException {
        Connection con = Conexion.obtenerConexion();
        try {
            con.setAutoCommit(false);
            String numero = generarNumero(con);
            String sql = "INSERT INTO reservaciones (numero_reservacion, fecha_creacion, fecha_viaje, id_paquete, " +
                         "cantidad_pasajeros, id_agente, costo_total, estado) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, 'Pendiente')";
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, numero);
            ps.setDate(2, new java.sql.Date(r.getFechaViaje().getTime()));
            ps.setInt(3, r.getIdPaquete());
            ps.setInt(4, r.getCantidadPasajeros());
            ps.setInt(5, r.getIdAgente());
            ps.setDouble(6, r.getCostoTotal());
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            int idReservacion = keys.getInt(1);
            String sqlPasajero = "INSERT INTO reservacion_pasajeros (id_reservacion, id_cliente) VALUES (?, ?)";
            PreparedStatement psPasajero = con.prepareStatement(sqlPasajero);
            for (int idCliente : idsClientes) {
                psPasajero.setInt(1, idReservacion);
                psPasajero.setInt(2, idCliente);
                psPasajero.addBatch();
            }
            psPasajero.executeBatch();
            con.commit();
            return numero;
        } catch (SQLException e) {
            con.rollback();
            throw e;
        } finally {
            con.setAutoCommit(true);
            new Conexion().desconectar(con);
        }
    }

    public List<Reservacion> listar() throws SQLException {
        String sql = "SELECT r.*, p.nombre as paquete_nombre, u.nombre_usuario as agente_nombre " +
                     "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
                     "JOIN usuarios u ON r.id_agente = u.id ORDER BY r.fecha_creacion DESC";
        Connection con = Conexion.obtenerConexion();
        List<Reservacion> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public List<Reservacion> listarDelDia() throws SQLException {
        String sql = "SELECT r.*, p.nombre as paquete_nombre, u.nombre_usuario as agente_nombre " +
                     "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
                     "JOIN usuarios u ON r.id_agente = u.id WHERE r.fecha_creacion = CURDATE() ORDER BY r.id DESC";
        Connection con = Conexion.obtenerConexion();
        List<Reservacion> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public Reservacion obtenerPorNumero(String numero) throws SQLException {
        String sql = "SELECT r.*, p.nombre as paquete_nombre, u.nombre_usuario as agente_nombre " +
                     "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
                     "JOIN usuarios u ON r.id_agente = u.id WHERE r.numero_reservacion = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, numero);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Reservacion r = mapear(rs);
                r.setPasajeros(obtenerPasajeros(r.getId()));
                r.setTotalPagado(obtenerTotalPagado(r.getId()));
                return r;
            }
            return null;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public Reservacion obtenerPorId(int id) throws SQLException {
        String sql = "SELECT r.*, p.nombre as paquete_nombre, u.nombre_usuario as agente_nombre " +
                     "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
                     "JOIN usuarios u ON r.id_agente = u.id WHERE r.id = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Reservacion r = mapear(rs);
                r.setPasajeros(obtenerPasajeros(id));
                r.setTotalPagado(obtenerTotalPagado(id));
                return r;
            }
            return null;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public List<Reservacion> obtenerPorCliente(int idCliente) throws SQLException {
        String sql = "SELECT r.*, p.nombre as paquete_nombre, u.nombre_usuario as agente_nombre " +
                     "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
                     "JOIN usuarios u ON r.id_agente = u.id " +
                     "JOIN reservacion_pasajeros rp ON r.id = rp.id_reservacion " +
                     "WHERE rp.id_cliente = ? ORDER BY r.fecha_creacion DESC";
        Connection con = Conexion.obtenerConexion();
        List<Reservacion> lista = new ArrayList<>();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idCliente);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public List<Cliente> obtenerPasajeros(int idReservacion) throws SQLException {
        String sql = "SELECT c.* FROM clientes c " +
                     "JOIN reservacion_pasajeros rp ON c.id = rp.id_cliente " +
                     "WHERE rp.id_reservacion = ?";
        Connection con = Conexion.obtenerConexion();
        List<Cliente> lista = new ArrayList<>();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idReservacion);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Cliente c = new Cliente();
                c.setId(rs.getInt("id"));
                c.setDpiPasaporte(rs.getString("dpi_pasaporte"));
                c.setNombreCompleto(rs.getString("nombre_completo"));
                c.setTelefono(rs.getString("telefono"));
                c.setCorreo(rs.getString("correo"));
                c.setNacionalidad(rs.getString("nacionalidad"));
                lista.add(c);
            }
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public double obtenerTotalPagado(int idReservacion) throws SQLException {
        String sql = "SELECT IFNULL(SUM(monto), 0) as total FROM pagos WHERE id_reservacion = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idReservacion);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getDouble("total");
            return 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public boolean actualizarEstado(int idReservacion, String estado) throws SQLException {
        String sql = "UPDATE reservaciones SET estado = ? WHERE id = ?";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setString(1, estado);
            ps.setInt(2, idReservacion);
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public List<Reservacion> listarPorIntervalo(String fechaInicio, String fechaFin, String estado) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT r.*, p.nombre as paquete_nombre, u.nombre_usuario as agente_nombre " +
            "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
            "JOIN usuarios u ON r.id_agente = u.id WHERE 1=1 ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");
        if (estado != null && !estado.isEmpty()) sql.append("AND r.estado = '").append(estado).append("' ");
        sql.append("ORDER BY r.fecha_creacion DESC");
        Connection con = Conexion.obtenerConexion();
        List<Reservacion> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql.toString());
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }
}
