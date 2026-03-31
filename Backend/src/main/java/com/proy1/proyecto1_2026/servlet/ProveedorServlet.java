/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/JSP_Servlet/Servlet.java to edit this template
 */
package com.proy1.proyecto1_2026.servlet;

import com.proy1.proyecto1_2026.dao.ProveedorDAO;
import com.proy1.proyecto1_2026.modelo.Proveedor;
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

@WebServlet("/api/proveedores/*")
public class ProveedorServlet extends HttpServlet {

    private final ProveedorDAO dao = new ProveedorDAO();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setStatus(200);
    }

    private boolean tieneAcceso(HttpServletRequest req, int... roles) {
        HttpSession s = req.getSession(false);
        if (s == null) return false;
        Usuario u = (Usuario) s.getAttribute("usuario");
        if (u == null) return false;
        for (int rol : roles) if (u.getIdRol() == rol) return true;
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
                Proveedor p = dao.obtenerPorId(id);
                if (p == null) Respuesta.error(res, 404, "Proveedor no encontrado.");
                else Respuesta.exito(res, p);
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
            Proveedor p = Respuesta.getGson().fromJson(body, Proveedor.class);
            if (p.getNombre() == null || p.getNombre().trim().isEmpty()) { Respuesta.error(res, 400, "Nombre requerido."); return; }
            if (dao.obtenerPorNombre(p.getNombre()) != null) { Respuesta.error(res, 400, "Ya existe un proveedor con ese nombre."); return; }
            dao.crear(p);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Proveedor registrado correctamente.");
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
            Proveedor p = Respuesta.getGson().fromJson(body, Proveedor.class);
            p.setId(id);
            dao.actualizar(p);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Proveedor actualizado correctamente.");
            Respuesta.exito(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }
}