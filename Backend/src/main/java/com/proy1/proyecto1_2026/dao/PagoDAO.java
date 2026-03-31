/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.dao;

import com.proy1.proyecto1_2026.modelo.Pago;
import com.proy1.proyecto1_2026.util.Conexion;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author ludwi
 */

public class PagoDAO {
private static final String[] METODOS = {"", "Efectivo", "Tarjeta", "Transferencia"};

    private Pago mapear(ResultSet rs) throws SQLException {
        Pago p = new Pago();
        p.setId(rs.getInt("id"));
        p.setIdReservacion(rs.getInt("id_reservacion"));
        p.setMonto(rs.getDouble("monto"));
        p.setMetodoPago(rs.getInt("metodo_pago"));
        int metodo = rs.getInt("metodo_pago");
        p.setMetodoPagoNombre(metodo >= 1 && metodo <= 3 ? METODOS[metodo] : "Otro");
        p.setFechaPago(rs.getDate("fecha_pago"));
        return p;
    }

    public boolean registrar(Pago pago) throws SQLException {
        String sql = "INSERT INTO pagos (id_reservacion, monto, metodo_pago, fecha_pago) VALUES (?, ?, ?, ?)";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, pago.getIdReservacion());
            ps.setDouble(2, pago.getMonto());
            ps.setInt(3, pago.getMetodoPago());
            ps.setDate(4, new java.sql.Date(pago.getFechaPago().getTime()));
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public List<Pago> obtenerPorReservacion(int idReservacion) throws SQLException {
        String sql = "SELECT * FROM pagos WHERE id_reservacion = ? ORDER BY fecha_pago";
        Connection con = Conexion.obtenerConexion();
        List<Pago> lista = new ArrayList<>();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idReservacion);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public boolean registrarCancelacion(int idReservacion, double montoReembolso, double perdida) throws SQLException {
        String sql = "INSERT INTO cancelaciones (id_reservacion, fecha_cancelacion, monto_reembolsado, perdida_agencia) " +
                     "VALUES (?, CURDATE(), ?, ?)";
        Connection con = Conexion.obtenerConexion();
        try {
            PreparedStatement ps = con.prepareStatement(sql);
            ps.setInt(1, idReservacion);
            ps.setDouble(2, montoReembolso);
            ps.setDouble(3, perdida);
            return ps.executeUpdate() > 0;
        } finally {
            new Conexion().desconectar(con);
        }
    }

    public List<Object[]> obtenerReporteCancelaciones(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT r.numero_reservacion, c.fecha_cancelacion, c.monto_reembolsado, c.perdida_agencia, " +
            "p.nombre as paquete_nombre FROM cancelaciones c " +
            "JOIN reservaciones r ON c.id_reservacion = r.id " +
            "JOIN paquetes p ON r.id_paquete = p.id WHERE 1=1 ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND c.fecha_cancelacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND c.fecha_cancelacion <= '").append(fechaFin).append("' ");
        sql.append("ORDER BY c.fecha_cancelacion DESC");
        Connection con = Conexion.obtenerConexion();
        List<Object[]> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql.toString());
            while (rs.next()) {
                Object[] fila = {
                    rs.getString("numero_reservacion"),
                    rs.getDate("fecha_cancelacion").toString(),
                    rs.getDouble("monto_reembolsado"),
                    rs.getDouble("perdida_agencia"),
                    rs.getString("paquete_nombre")
                };
                lista.add(fila);
            }
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }

    public double[] obtenerTotalesGanancias(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sqlVentas = new StringBuilder(
            "SELECT IFNULL(SUM(r.costo_total), 0) as total_ventas, " +
            "IFNULL(SUM(p2.costo_total_servicios), 0) as total_costos " +
            "FROM reservaciones r " +
            "JOIN (SELECT sp.id_paquete, SUM(sp.costo_proveedor) as costo_total_servicios " +
            "      FROM servicios_paquete sp GROUP BY sp.id_paquete) p2 ON r.id_paquete = p2.id_paquete " +
            "WHERE r.estado = 'Confirmada' ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sqlVentas.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sqlVentas.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");

        StringBuilder sqlReembolsos = new StringBuilder(
            "SELECT IFNULL(SUM(c.monto_reembolsado), 0) as total_reembolsos FROM cancelaciones c WHERE 1=1 ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sqlReembolsos.append("AND c.fecha_cancelacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sqlReembolsos.append("AND c.fecha_cancelacion <= '").append(fechaFin).append("' ");

        Connection con = Conexion.obtenerConexion();
        try {
            double totalVentas = 0, totalCostos = 0, totalReembolsos = 0;
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sqlVentas.toString());
            if (rs.next()) {
                totalVentas = rs.getDouble("total_ventas");
                totalCostos = rs.getDouble("total_costos");
            }
            rs = st.executeQuery(sqlReembolsos.toString());
            if (rs.next()) totalReembolsos = rs.getDouble("total_reembolsos");
            double gananciaBruta = totalVentas - totalCostos;
            double gananciaNeta = gananciaBruta - totalReembolsos;
            return new double[]{gananciaBruta, totalReembolsos, gananciaNeta};
        } finally {
            new Conexion().desconectar(con);
        }
    }
}
