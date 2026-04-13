/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.servlet;

import com.proy1.proyecto1_2026.dao.DestinoDAO;
import com.proy1.proyecto1_2026.modelo.Destino;
import com.proy1.proyecto1_2026.modelo.Usuario;
import com.proy1.proyecto1_2026.util.LectorBody;
import com.proy1.proyecto1_2026.util.Respuesta;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author ludwi
 */

@WebServlet("/api/destinos/*")
public class DestinoServlet extends HttpServlet {

    private final DestinoDAO dao = new DestinoDAO();

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
        if (!tieneAcceso(req, 1, 2, 3)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            if (ruta == null || ruta.equals("/")) {
                Respuesta.exito(res, dao.listar());
            } else {
                int id = Integer.parseInt(ruta.substring(1));
                Destino d = dao.obtenerPorId(id);
                if (d == null) Respuesta.error(res, 404, "Destino no encontrado.");
                else Respuesta.exito(res, d);
            }
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!tieneAcceso(req, 2, 3)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String body = LectorBody.leer(req);
            Destino d = Respuesta.getGson().fromJson(body, Destino.class);
            if (d.getNombre() == null || d.getNombre().trim().isEmpty()) { Respuesta.error(res, 400, "Nombre requerido."); return; }
            if (d.getPais() == null || d.getPais().trim().isEmpty()) { Respuesta.error(res, 400, "Pais requerido."); return; }
            if (dao.obtenerPorNombre(d.getNombre()) != null) { Respuesta.error(res, 400, "Ya existe un destino con ese nombre."); return; }
            dao.crear(d);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Destino creado correctamente.");
            Respuesta.creado(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!tieneAcceso(req, 2, 3)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            int id = Integer.parseInt(ruta.substring(1));
            String body = LectorBody.leer(req);
            Destino d = Respuesta.getGson().fromJson(body, Destino.class);
            d.setId(id);
            dao.actualizar(d);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Destino actualizado correctamente.");
            Respuesta.exito(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!tieneAcceso(req, 2, 3)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            int id = Integer.parseInt(ruta.substring(1));
            dao.eliminar(id);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Destino eliminado correctamente.");
            Respuesta.exito(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }
}