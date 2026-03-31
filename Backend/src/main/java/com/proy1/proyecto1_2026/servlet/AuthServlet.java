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

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {

    private final UsuarioDAO dao = new UsuarioDAO();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setStatus(200);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String ruta = req.getPathInfo();
        if ("/login".equals(ruta)) {
            login(req, res);
        } else if ("/logout".equals(ruta)) {
            logout(req, res);
        } else {
            Respuesta.error(res, 404, "Ruta no encontrada.");
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String ruta = req.getPathInfo();
        if ("/sesion".equals(ruta)) {
            verificarSesion(req, res);
        } else {
            Respuesta.error(res, 404, "Ruta no encontrada.");
        }
    }

    private void login(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            String body = LectorBody.leer(req);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            String nombre = json.get("usuario").getAsString();
            String contrasena = json.get("contrasena").getAsString();
            Usuario usuario = dao.autenticar(nombre, contrasena);
            if (usuario == null) {
                Respuesta.error(res, 401, "Credenciales incorrectas.");
                return;
            }
            HttpSession sesion = req.getSession(true);
            sesion.setAttribute("usuario", usuario);
            sesion.setMaxInactiveInterval(3600);
            Map<String, Object> datos = new HashMap<>();
            datos.put("id", usuario.getId());
            datos.put("nombreUsuario", usuario.getNombreUsuario());
            datos.put("idRol", usuario.getIdRol());
            datos.put("nombreRol", usuario.getNombreRol());
            Respuesta.exito(res, datos);
        } catch (Exception e) {
            Respuesta.error(res, 500, "Error al procesar la solicitud: " + e.getMessage());
        }
    }

    private void logout(HttpServletRequest req, HttpServletResponse res) throws IOException {
        HttpSession sesion = req.getSession(false);
        if (sesion != null) sesion.invalidate();
        Map<String, String> datos = new HashMap<>();
        datos.put("mensaje", "Sesion cerrada correctamente.");
        Respuesta.exito(res, datos);
    }

    private void verificarSesion(HttpServletRequest req, HttpServletResponse res) throws IOException {
        HttpSession sesion = req.getSession(false);
        if (sesion == null || sesion.getAttribute("usuario") == null) {
            Respuesta.error(res, 401, "No hay sesion activa.");
            return;
        }
        Usuario usuario = (Usuario) sesion.getAttribute("usuario");
        Map<String, Object> datos = new HashMap<>();
        datos.put("id", usuario.getId());
        datos.put("nombreUsuario", usuario.getNombreUsuario());
        datos.put("idRol", usuario.getIdRol());
        datos.put("nombreRol", usuario.getNombreRol());
        Respuesta.exito(res, datos);
    }
}