/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.servlet;

import com.proy1.proyecto1_2026.dao.ClienteDAO;
import com.proy1.proyecto1_2026.dao.PagoDAO;
import com.proy1.proyecto1_2026.dao.PaqueteDAO;
import com.proy1.proyecto1_2026.dao.ReservacionDAO;
import com.proy1.proyecto1_2026.modelo.*;
import com.proy1.proyecto1_2026.util.LectorBody;
import com.proy1.proyecto1_2026.util.Respuesta;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 *
 * @author ludwi
 */

@WebServlet("/api/reservaciones/*")
public class ReservacionServlet extends HttpServlet {

    private final ReservacionDAO dao = new ReservacionDAO();
    private final PaqueteDAO paqueteDAO = new PaqueteDAO();
    private final ClienteDAO clienteDAO = new ClienteDAO();
    private final PagoDAO pagoDAO = new PagoDAO();

    private void setCors(HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Usuario-Id, X-Usuario-Rol");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        res.setStatus(200);
    }

    private Usuario usuarioSesion(HttpServletRequest req) {
        String idHeader = req.getHeader("X-Usuario-Id");
        String rolHeader = req.getHeader("X-Usuario-Rol");
        if (idHeader == null || rolHeader == null) return null;
        try {
            Usuario u = new Usuario();
            u.setId(Integer.parseInt(idHeader));
            u.setIdRol(Integer.parseInt(rolHeader));
            return u;
        } catch (NumberFormatException e) {
            return null;
        }
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
        Usuario u = usuarioSesion(req);
        if (u == null) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            if (ruta == null || ruta.equals("/")) {
                String tipo = req.getParameter("tipo");
                if ("hoy".equals(tipo)) {
                    Respuesta.exito(res, dao.listarDelDia());
                } else {
                    String inicio = req.getParameter("inicio");
                    String fin = req.getParameter("fin");
                    String estado = req.getParameter("estado");
                    Respuesta.exito(res, dao.listarPorIntervalo(inicio, fin, estado));
                }
            } else {
                String[] partes = ruta.substring(1).split("/");
                String identificador = partes[0];
                if (partes.length > 1 && "pagos".equals(partes[1])) {
                    Reservacion r = dao.obtenerPorNumero(identificador);
                    if (r == null) { Respuesta.error(res, 404, "Reservacion no encontrada."); return; }
                    Respuesta.exito(res, pagoDAO.obtenerPorReservacion(r.getId()));
                } else {
                    Reservacion r = dao.obtenerPorNumero(identificador);
                    if (r == null) { Respuesta.error(res, 404, "Reservacion no encontrada."); return; }
                    Respuesta.exito(res, r);
                }
            }
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        Usuario u = usuarioSesion(req);
        if (u == null || u.getIdRol() == 2) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            if (ruta != null && ruta.contains("/pago")) {
                registrarPago(req, res, ruta);
                return;
            }
            if (ruta != null && ruta.contains("/cancelar")) {
                procesarCancelacion(req, res, ruta);
                return;
            }
            String body = LectorBody.leer(req);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            int idPaquete = json.get("idPaquete").getAsInt();
            String fechaStr = json.get("fechaViaje").getAsString();
            JsonArray pasajerosJson = json.getAsJsonArray("pasajeros");
            Paquete paquete = paqueteDAO.obtenerPorId(idPaquete);
            if (paquete == null) { Respuesta.error(res, 400, "Paquete no encontrado."); return; }
            if (!paquete.isActivo()) { Respuesta.error(res, 400, "El paquete no esta activo."); return; }
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            java.util.Date fechaViaje = sdf.parse(fechaStr);
            List<Integer> idsClientes = new ArrayList<>();
            for (int i = 0; i < pasajerosJson.size(); i++) {
                int idCliente = pasajerosJson.get(i).getAsInt();
                Cliente c = clienteDAO.obtenerPorId(idCliente);
                if (c == null) { Respuesta.error(res, 400, "Pasajero con ID " + idCliente + " no encontrado."); return; }
                idsClientes.add(idCliente);
            }
            Reservacion r = new Reservacion();
            r.setFechaViaje(fechaViaje);
            r.setIdPaquete(idPaquete);
            r.setCantidadPasajeros(idsClientes.size());
            r.setIdAgente(u.getId());
            r.setCostoTotal(paquete.getPrecioVenta() * idsClientes.size());
            String numero = dao.crear(r, idsClientes);
            Map<String, Object> resp = new HashMap<>();
            resp.put("mensaje", "Reservacion creada correctamente.");
            resp.put("numeroReservacion", numero);
            resp.put("costoTotal", r.getCostoTotal());
            Respuesta.creado(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }

    private void registrarPago(HttpServletRequest req, HttpServletResponse res, String ruta) throws Exception {
        String[] partes = ruta.substring(1).split("/");
        String numReservacion = partes[0];
        Reservacion r = dao.obtenerPorNumero(numReservacion);
        if (r == null) { Respuesta.error(res, 404, "Reservacion no encontrada."); return; }
        if ("Cancelada".equals(r.getEstado()) || "Completada".equals(r.getEstado())) {
            Respuesta.error(res, 400, "No se puede pagar una reservacion " + r.getEstado() + "."); return;
        }
        String body = LectorBody.leer(req);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
        double monto = json.get("monto").getAsDouble();
        int metodo = json.get("metodoPago").getAsInt();
        String fechaStr = json.get("fechaPago").getAsString();
        if (monto <= 0) { Respuesta.error(res, 400, "El monto debe ser positivo."); return; }
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
        Pago pago = new Pago();
        pago.setIdReservacion(r.getId());
        pago.setMonto(monto);
        pago.setMetodoPago(metodo);
        pago.setFechaPago(sdf.parse(fechaStr));
        pagoDAO.registrar(pago);
        double totalPagado = r.getTotalPagado() + monto;
        boolean confirmada = totalPagado >= r.getCostoTotal();
        if (confirmada) dao.actualizarEstado(r.getId(), "Confirmada");
        Map<String, Object> resp = new HashMap<>();
        resp.put("mensaje", "Pago registrado correctamente.");
        resp.put("totalPagado", totalPagado);
        resp.put("costoTotal", r.getCostoTotal());
        resp.put("confirmada", confirmada);
        Respuesta.exito(res, resp);
    }

    private void procesarCancelacion(HttpServletRequest req, HttpServletResponse res, String ruta) throws Exception {
        String[] partes = ruta.substring(1).split("/");
        String numReservacion = partes[0];
        Reservacion r = dao.obtenerPorNumero(numReservacion);
        if (r == null) { Respuesta.error(res, 404, "Reservacion no encontrada."); return; }
        if (!"Pendiente".equals(r.getEstado()) && !"Confirmada".equals(r.getEstado())) {
            Respuesta.error(res, 400, "Solo se pueden cancelar reservaciones en estado Pendiente o Confirmada."); return;
        }
        long diasParaViaje = (r.getFechaViaje().getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        if (diasParaViaje < 7) { Respuesta.error(res, 400, "No se permite cancelar con menos de 7 dias de anticipacion."); return; }
        double totalPagado = r.getTotalPagado();
        double porcentajeReembolso;
        if (diasParaViaje > 30) porcentajeReembolso = 1.0;
        else if (diasParaViaje >= 15) porcentajeReembolso = 0.70;
        else porcentajeReembolso = 0.40;
        double montoReembolso = totalPagado * porcentajeReembolso;
        double perdida = totalPagado - montoReembolso;
        pagoDAO.registrarCancelacion(r.getId(), montoReembolso, perdida);
        dao.actualizarEstado(r.getId(), "Cancelada");
        Map<String, Object> resp = new HashMap<>();
        resp.put("mensaje", "Reservacion cancelada correctamente.");
        resp.put("montoReembolso", montoReembolso);
        resp.put("perdidaAgencia", perdida);
        resp.put("diasAnticipacion", diasParaViaje);
        Respuesta.exito(res, resp);
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        Usuario u = usuarioSesion(req);
        if (u == null) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            String ruta = req.getPathInfo();
            String[] partes = ruta.substring(1).split("/");
            String numReservacion = partes[0];
            Reservacion r = dao.obtenerPorNumero(numReservacion);
            if (r == null) { Respuesta.error(res, 404, "Reservacion no encontrada."); return; }
            String body = LectorBody.leer(req);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            if (json.has("estado")) {
                dao.actualizarEstado(r.getId(), json.get("estado").getAsString());
            }
            Map<String, String> resp = new HashMap<>();
            resp.put("mensaje", "Reservacion actualizada.");
            Respuesta.exito(res, resp);
        } catch (Exception e) {
            Respuesta.error(res, 500, e.getMessage());
        }
    }
}
