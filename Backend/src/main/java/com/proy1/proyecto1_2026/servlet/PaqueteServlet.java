/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.servlet;

import com.proy1.proyecto1_2026.dao.DestinoDAO;
import com.proy1.proyecto1_2026.dao.PaqueteDAO;
import com.proy1.proyecto1_2026.dao.ProveedorDAO;
import com.proy1.proyecto1_2026.modelo.*;
import com.proy1.proyecto1_2026.util.LectorBody;
import com.proy1.proyecto1_2026.util.Respuesta;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * @author ludwi
 */

@WebServlet("/api/paquetes/*")
public class PaqueteServlet extends HttpServlet {

    private final PaqueteDAO dao = new PaqueteDAO();
    private final DestinoDAO destinoDAO = new DestinoDAO();
    private final ProveedorDAO proveedorDAO = new ProveedorDAO();

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
                String destino = req.getParameter("destino");
                if (destino != null && !destino.isEmpty()) {
                    Respuesta.exito(res, dao.listarPorDestino(Integer.parseInt(destino)));
                } else {
                    boolean soloActivos = "true".equals(req.getParameter("activos"));
                    if (soloActivos) Respuesta.exito(res, dao.listarActivos());
                    else Respuesta.exito(res, dao.listar());
                }
            } else if (ruta.startsWith("/alerta")) {
                revisarAlertas(res);
            } else {
                int id = Integer.parseInt(ruta.substring(1));
                Paquete p = dao.obtenerPorId(id);
                if (p == null) Respuesta.error(res, 404, "Paquete no encontrado.");
                else Respuesta.exito(res, p);
            }
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    private void revisarAlertas(HttpServletResponse res) throws Exception {
        List<Paquete> paquetes = dao.listarActivos();
        java.util.List<Map<String, Object>> alertas = new java.util.ArrayList<>();
        for (Paquete p : paquetes) {
            int reservaciones = dao.contarReservacionesPorPaquete(p.getId());
            double porcentaje = p.getCapacidadMaxima() > 0 ? (reservaciones * 100.0 / p.getCapacidadMaxima()) : 0;
            if (porcentaje >= 80) {
                Map<String, Object> alerta = new HashMap<>();
                alerta.put("paquete", p.getNombre());
                alerta.put("capacidadMaxima", p.getCapacidadMaxima());
                alerta.put("reservacionesActivas", reservaciones);
                alerta.put("porcentaje", Math.round(porcentaje));
                alertas.add(alerta);
            }
        }
        Respuesta.exito(res, alertas);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!tieneAcceso(req, 2, 3)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            if (ruta != null && ruta.contains("/servicio")) {
                agregarServicio(req, res, ruta);
                return;
            }
            String body = LectorBody.leer(req);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            String nombre = json.get("nombre").getAsString();
            int idDestino = json.get("idDestino").getAsInt();
            int duracion = json.get("duracionDias").getAsInt();
            double precio = json.get("precioVenta").getAsDouble();
            int capacidad = json.get("capacidadMaxima").getAsInt();
            String descripcion = json.has("descripcion") ? json.get("descripcion").getAsString() : "";
            if (dao.obtenerPorNombre(nombre) != null) { Respuesta.error(res, 400, "Ya existe un paquete con ese nombre."); return; }
            Destino dest = destinoDAO.obtenerPorId(idDestino);
            if (dest == null) { Respuesta.error(res, 400, "Destino no encontrado."); return; }
            Paquete p = new Paquete();
            p.setNombre(nombre);
            p.setIdDestino(idDestino);
            p.setDuracionDias(duracion);
            p.setPrecioVenta(precio);
            p.setCapacidadMaxima(capacidad);
            p.setDescripcion(descripcion);
            int idNuevo = dao.crear(p);
            if (json.has("servicios")) {
                JsonArray servicios = json.getAsJsonArray("servicios");
                for (JsonElement el : servicios) {
                    JsonObject srv = el.getAsJsonObject();
                    ServicioPaquete sp = new ServicioPaquete();
                    sp.setIdPaquete(idNuevo);
                    sp.setIdProveedor(srv.get("idProveedor").getAsInt());
                    sp.setDescripcion(srv.get("descripcion").getAsString());
                    sp.setCostoProveedor(srv.get("costoProveedor").getAsDouble());
                    dao.agregarServicio(sp);
                }
            }
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Paquete creado correctamente.");
            resp.put("id", idNuevo);
            Respuesta.creado(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    private void agregarServicio(HttpServletRequest req, HttpServletResponse res, String ruta) throws Exception {
        String[] partes = ruta.split("/");
        int idPaquete = Integer.parseInt(partes[1]);
        String body = LectorBody.leer(req);
        ServicioPaquete sp = Respuesta.getGson().fromJson(body, ServicioPaquete.class);
        sp.setIdPaquete(idPaquete);
        dao.agregarServicio(sp);
        Map<String, String> resp = new HashMap<>();
        resp.put("mensaje", "Servicio agregado al paquete.");
        Respuesta.creado(res, resp);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        if (!tieneAcceso(req, 2, 3)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            String[] partes = ruta.substring(1).split("/");
            int id = Integer.parseInt(partes[0]);
            if (partes.length > 1 && "desactivar".equals(partes[1])) {
                dao.desactivar(id);
                Map<String, String> resp = new HashMap<>();
                resp.put("mensaje", "Paquete desactivado.");
                Respuesta.exito(res, resp);
                return;
            }
            String body = LectorBody.leer(req);
            Paquete p = Respuesta.getGson().fromJson(body, Paquete.class);
            p.setId(id);
            dao.actualizar(p);
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Paquete actualizado correctamente.");
            Respuesta.exito(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }
}
