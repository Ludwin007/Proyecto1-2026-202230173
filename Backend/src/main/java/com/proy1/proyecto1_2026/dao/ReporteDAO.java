/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.dao;

import com.proy1.proyecto1_2026.util.Conexion;
import java.sql.*;
import java.util.*;

/**
 *
 * @author ludwi
 */

public class ReporteDAO {

    public List<Map<String, Object>> reporteVentas(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT r.numero_reservacion, r.fecha_creacion, r.fecha_viaje, r.costo_total, r.estado, " +
            "p.nombre as paquete, u.nombre_usuario as agente, r.cantidad_pasajeros " +
            "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
            "JOIN usuarios u ON r.id_agente = u.id WHERE r.estado = 'Confirmada' ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");
        sql.append("ORDER BY r.fecha_creacion DESC");
        return ejecutarConsulta(sql.toString());
    }

    public List<Map<String, Object>> reporteCancelaciones(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT r.numero_reservacion, c.fecha_cancelacion, c.monto_reembolsado, c.perdida_agencia, " +
            "p.nombre as paquete FROM cancelaciones c " +
            "JOIN reservaciones r ON c.id_reservacion = r.id " +
            "JOIN paquetes p ON r.id_paquete = p.id WHERE 1=1 ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND c.fecha_cancelacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND c.fecha_cancelacion <= '").append(fechaFin).append("' ");
        sql.append("ORDER BY c.fecha_cancelacion DESC");
        return ejecutarConsulta(sql.toString());
    }

    public Map<String, Object> reporteGanancias(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT IFNULL(SUM(r.costo_total), 0) as total_ventas, " +
            "IFNULL(SUM(costos.costo), 0) as total_costos " +
            "FROM reservaciones r " +
            "LEFT JOIN (SELECT id_paquete, SUM(costo_proveedor) as costo FROM servicios_paquete GROUP BY id_paquete) costos " +
            "ON r.id_paquete = costos.id_paquete WHERE r.estado = 'Confirmada' ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");

        StringBuilder sqlReembolsos = new StringBuilder(
            "SELECT IFNULL(SUM(monto_reembolsado), 0) as reembolsos FROM cancelaciones WHERE 1=1 ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sqlReembolsos.append("AND fecha_cancelacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sqlReembolsos.append("AND fecha_cancelacion <= '").append(fechaFin).append("' ");

        Connection con = Conexion.obtenerConexion();
        Map<String, Object> resultado = new HashMap<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql.toString());
            double totalVentas = 0, totalCostos = 0;
            if (rs.next()) {
                totalVentas = rs.getDouble("total_ventas");
                totalCostos = rs.getDouble("total_costos");
            }
            rs = st.executeQuery(sqlReembolsos.toString());
            double reembolsos = 0;
            if (rs.next()) reembolsos = rs.getDouble("reembolsos");
            double gananciaBruta = totalVentas - totalCostos;
            resultado.put("totalVentas", totalVentas);
            resultado.put("totalCostos", totalCostos);
            resultado.put("gananciaBruta", gananciaBruta);
            resultado.put("totalReembolsos", reembolsos);
            resultado.put("gananciaNeta", gananciaBruta - reembolsos);
        } finally {
            new Conexion().desconectar(con);
        }
        return resultado;
    }

    public Map<String, Object> agenteConMasVentas(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT u.nombre_usuario as agente, COUNT(r.id) as total_reservaciones, " +
            "SUM(r.costo_total) as total_monto " +
            "FROM reservaciones r JOIN usuarios u ON r.id_agente = u.id " +
            "WHERE r.estado = 'Confirmada' ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");
        sql.append("GROUP BY u.id ORDER BY total_reservaciones DESC LIMIT 1");
        Connection con = Conexion.obtenerConexion();
        Map<String, Object> resultado = new HashMap<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql.toString());
            if (rs.next()) {
                resultado.put("agente", rs.getString("agente"));
                resultado.put("totalReservaciones", rs.getInt("total_reservaciones"));
                resultado.put("totalMonto", rs.getDouble("total_monto"));
            }
        } finally {
            new Conexion().desconectar(con);
        }
        return resultado;
    }

    public Map<String, Object> agenteConMasGanancias(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT u.nombre_usuario as agente, " +
            "SUM(r.costo_total - IFNULL(costos.costo, 0)) as ganancia_generada " +
            "FROM reservaciones r JOIN usuarios u ON r.id_agente = u.id " +
            "LEFT JOIN (SELECT id_paquete, SUM(costo_proveedor) as costo FROM servicios_paquete GROUP BY id_paquete) costos " +
            "ON r.id_paquete = costos.id_paquete WHERE r.estado = 'Confirmada' ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");
        sql.append("GROUP BY u.id ORDER BY ganancia_generada DESC LIMIT 1");
        Connection con = Conexion.obtenerConexion();
        Map<String, Object> resultado = new HashMap<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql.toString());
            if (rs.next()) {
                resultado.put("agente", rs.getString("agente"));
                resultado.put("gananciaGenerada", rs.getDouble("ganancia_generada"));
            }
        } finally {
            new Conexion().desconectar(con);
        }
        return resultado;
    }

    public List<Map<String, Object>> paqueteMasVendido(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre as paquete, COUNT(r.id) as veces_vendido, SUM(r.costo_total) as total_generado " +
            "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
            "WHERE r.estado = 'Confirmada' ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");
        sql.append("GROUP BY p.id ORDER BY veces_vendido DESC LIMIT 1");
        return ejecutarConsulta(sql.toString());
    }

    public List<Map<String, Object>> paqueteMenosVendido(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT p.nombre as paquete, COUNT(r.id) as veces_vendido, SUM(r.costo_total) as total_generado " +
            "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
            "WHERE r.estado = 'Confirmada' ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");
        sql.append("GROUP BY p.id ORDER BY veces_vendido ASC LIMIT 1");
        return ejecutarConsulta(sql.toString());
    }

    public List<Map<String, Object>> ocupacionPorDestino(String fechaInicio, String fechaFin) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT d.nombre as destino, d.pais, COUNT(r.id) as total_reservaciones " +
            "FROM reservaciones r JOIN paquetes p ON r.id_paquete = p.id " +
            "JOIN destinos d ON p.id_destino = d.id WHERE 1=1 ");
        if (fechaInicio != null && !fechaInicio.isEmpty()) sql.append("AND r.fecha_creacion >= '").append(fechaInicio).append("' ");
        if (fechaFin != null && !fechaFin.isEmpty()) sql.append("AND r.fecha_creacion <= '").append(fechaFin).append("' ");
        sql.append("GROUP BY d.id ORDER BY total_reservaciones DESC");
        return ejecutarConsulta(sql.toString());
    }

    private List<Map<String, Object>> ejecutarConsulta(String sql) throws SQLException {
        Connection con = Conexion.obtenerConexion();
        List<Map<String, Object>> lista = new ArrayList<>();
        try {
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery(sql);
            ResultSetMetaData meta = rs.getMetaData();
            int columnas = meta.getColumnCount();
            while (rs.next()) {
                Map<String, Object> fila = new LinkedHashMap<>();
                for (int i = 1; i <= columnas; i++) {
                    fila.put(meta.getColumnLabel(i), rs.getObject(i));
                }
                lista.add(fila);
            }
        } finally {
            new Conexion().desconectar(con);
        }
        return lista;
    }
}
