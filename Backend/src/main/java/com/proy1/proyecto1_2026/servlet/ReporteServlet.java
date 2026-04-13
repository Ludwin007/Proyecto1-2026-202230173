/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.servlet;

import com.proy1.proyecto1_2026.dao.ReporteDAO;
import com.proy1.proyecto1_2026.modelo.Usuario;
import com.proy1.proyecto1_2026.util.Respuesta;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

/**
 *
 * @author ludwi
 */

@WebServlet("/api/reportes/*")
public class ReporteServlet extends HttpServlet {

    private final ReporteDAO dao = new ReporteDAO();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setStatus(200);
    }

    private boolean esAdmin(HttpServletRequest req) {
    String rol = req.getHeader("X-Usuario-Rol");
    return "3".equals(rol);
}

    private boolean tieneAcceso(HttpServletRequest req, int... roles) {
    String rolHeader = req.getHeader("X-Usuario-Rol");
    if (rolHeader == null) return false;
    try {
        int rol = Integer.parseInt(rolHeader);
        for (int r : roles) if (r == rol) return true;
    } catch (NumberFormatException e) {
        return false;
    }
    return false;
}

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!esAdmin(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            String inicio = req.getParameter("inicio");
            String fin = req.getParameter("fin");
            if (ruta == null) { Respuesta.error(res, 400, "Tipo de reporte requerido."); return; }
            switch (ruta) {
                case "/ventas":
                    Respuesta.exito(res, dao.reporteVentas(inicio, fin));
                    break;
                case "/cancelaciones":
                    Respuesta.exito(res, dao.reporteCancelaciones(inicio, fin));
                    break;
                case "/ganancias":
                    Respuesta.exito(res, dao.reporteGanancias(inicio, fin));
                    break;
                case "/agente-mas-ventas":
                    Respuesta.exito(res, dao.agenteConMasVentas(inicio, fin));
                    break;
                case "/agente-mas-ganancias":
                    Respuesta.exito(res, dao.agenteConMasGanancias(inicio, fin));
                    break;
                case "/paquete-mas-vendido":
                    Respuesta.exito(res, dao.paqueteMasVendido(inicio, fin));
                    break;
                case "/paquete-menos-vendido":
                    Respuesta.exito(res, dao.paqueteMenosVendido(inicio, fin));
                    break;
                case "/ocupacion-destinos":
                    Respuesta.exito(res, dao.ocupacionPorDestino(inicio, fin));
                    break;
                default:
                    Respuesta.error(res, 404, "Tipo de reporte no reconocido.");
            }
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }
}
