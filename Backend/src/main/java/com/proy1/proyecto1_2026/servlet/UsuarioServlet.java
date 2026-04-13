/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.servlet;

import com.proy1.proyecto1_2026.dao.UsuarioDAO;
import com.proy1.proyecto1_2026.modelo.Usuario;
import com.proy1.proyecto1_2026.util.LectorBody;
import com.proy1.proyecto1_2026.util.Respuesta;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author ludwi
 */

@WebServlet("/api/usuarios/*")
public class UsuarioServlet extends HttpServlet {

    private final UsuarioDAO dao = new UsuarioDAO();

    private void setCors(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Usuario-Id, X-Usuario-Rol, Authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
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
        setCors(res);
        if (!esAdmin(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            Respuesta.exito(res, dao.listar());
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        if (!esAdmin(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String body = LectorBody.leer(req);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            String nombre = json.get("nombreUsuario").getAsString();
            String pass = json.get("contrasena").getAsString();
            int rol = json.get("idRol").getAsInt();
            if (pass.length() < 6) { Respuesta.error(res, 400, "Password debe tener minimo 6 caracteres."); return; }
            if (rol < 1 || rol > 3) { Respuesta.error(res, 400, "Rol invalido."); return; }
            if (dao.existeNombre(nombre)) { Respuesta.error(res, 400, "Nombre de usuario ya existe."); return; }
            Usuario u = new Usuario();
            u.setNombreUsuario(nombre);
            u.setContrasena(pass);
            u.setIdRol(rol);
            dao.crear(u);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Usuario creado correctamente.");
            Respuesta.creado(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        if (!esAdmin(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            String[] partes = ruta == null ? new String[]{} : ruta.split("/");
            if (partes.length < 2) { Respuesta.error(res, 400, "ID requerido."); return; }
            int id = Integer.parseInt(partes[1]);
            String body = LectorBody.leer(req);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            if (json.has("activar") && json.get("activar").getAsBoolean()) {
                dao.activar(id);
                Map<String, String> resp = new HashMap<>();
                resp.put("mensaje", "Usuario activado correctamente.");
                Respuesta.exito(res, resp);
            } else {
                int nuevoRol = json.get("idRol").getAsInt();
                dao.cambiarRol(id, nuevoRol);
                Map<String, String> resp = new HashMap<>();
                resp.put("mensaje", "Rol actualizado correctamente.");
                Respuesta.exito(res, resp);
            }
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        if (!esAdmin(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            String[] partes = ruta == null ? new String[]{} : ruta.split("/");
            if (partes.length < 2) { Respuesta.error(res, 400, "ID requerido."); return; }
            int id = Integer.parseInt(partes[1]);
            dao.desactivar(id);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Usuario desactivado correctamente.");
            Respuesta.exito(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }
}