/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.servlet;

import com.proy1.proyecto1_2026.dao.ClienteDAO;
import com.proy1.proyecto1_2026.dao.ReservacionDAO;
import com.proy1.proyecto1_2026.modelo.Cliente;
import com.proy1.proyecto1_2026.modelo.Usuario;
import com.proy1.proyecto1_2026.util.LectorBody;
import com.proy1.proyecto1_2026.util.Respuesta;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author ludwi
 */

@WebServlet("/api/clientes/*")
public class ClienteServlet extends HttpServlet {

    private final ClienteDAO dao = new ClienteDAO();
    private final ReservacionDAO reservacionDAO = new ReservacionDAO();

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setStatus(200);
    }

    private boolean tieneAcceso(HttpServletRequest req) {
        HttpSession s = req.getSession(false);
        if (s == null) return false;
        Usuario u = (Usuario) s.getAttribute("usuario");
        return u != null;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!tieneAcceso(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            if (ruta == null || ruta.equals("/")) {
                String dpi = req.getParameter("dpi");
                String nombre = req.getParameter("nombre");
                if (dpi != null && !dpi.isEmpty()) {
                    Cliente c = dao.obtenerPorDpi(dpi);
                    if (c == null) Respuesta.error(res, 404, "Cliente no encontrado.");
                    else Respuesta.exito(res, c);
                } else if (nombre != null && !nombre.isEmpty()) {
                    Respuesta.exito(res, dao.buscarPorNombre(nombre));
                } else {
                    Respuesta.exito(res, dao.listar());
                }
            } else {
                String[] partes = ruta.substring(1).split("/");
                int id = Integer.parseInt(partes[0]);
                if (partes.length > 1 && "reservaciones".equals(partes[1])) {
                    Respuesta.exito(res, reservacionDAO.obtenerPorCliente(id));
                } else {
                    Cliente c = dao.obtenerPorId(id);
                    if (c == null) Respuesta.error(res, 404, "Cliente no encontrado.");
                    else Respuesta.exito(res, c);
                }
            }
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!tieneAcceso(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String body = LectorBody.leer(req);
            com.google.gson.JsonObject json = com.google.gson.JsonParser.parseString(body).getAsJsonObject();
            String dpi = json.get("dpiPasaporte").getAsString();
            String nombre = json.get("nombreCompleto").getAsString();
            String fechaStr = json.get("fechaNacimiento").getAsString();
            String telefono = json.has("telefono") ? json.get("telefono").getAsString() : "";
            String correo = json.has("correo") ? json.get("correo").getAsString() : "";
            String nacionalidad = json.has("nacionalidad") ? json.get("nacionalidad").getAsString() : "";
            if (dao.obtenerPorDpi(dpi) != null) { Respuesta.error(res, 400, "Ya existe un cliente con ese DPI."); return; }
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            java.util.Date fecha = sdf.parse(fechaStr);
            Cliente c = new Cliente();
            c.setDpiPasaporte(dpi);
            c.setNombreCompleto(nombre);
            c.setFechaNacimiento(fecha);
            c.setTelefono(telefono);
            c.setCorreo(correo);
            c.setNacionalidad(nacionalidad);
            dao.crear(c);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Cliente registrado correctamente.");
            Respuesta.creado(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!tieneAcceso(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            int id = Integer.parseInt(ruta.substring(1));
            String body = LectorBody.leer(req);
            com.google.gson.JsonObject json = com.google.gson.JsonParser.parseString(body).getAsJsonObject();
            Cliente c = dao.obtenerPorId(id);
            if (c == null) { Respuesta.error(res, 404, "Cliente no encontrado."); return; }
            if (json.has("nombreCompleto")) c.setNombreCompleto(json.get("nombreCompleto").getAsString());
            if (json.has("telefono")) c.setTelefono(json.get("telefono").getAsString());
            if (json.has("correo")) c.setCorreo(json.get("correo").getAsString());
            if (json.has("nacionalidad")) c.setNacionalidad(json.get("nacionalidad").getAsString());
            if (json.has("fechaNacimiento")) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                c.setFechaNacimiento(sdf.parse(json.get("fechaNacimiento").getAsString()));
            }
            dao.actualizar(c);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Cliente actualizado correctamente.");
            Respuesta.exito(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }
}
