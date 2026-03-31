/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.servlet;

import com.proy1.proyecto1_2026.modelo.Usuario;
import com.proy1.proyecto1_2026.util.CargadorDatos;
import com.proy1.proyecto1_2026.util.Respuesta;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.InputStream;

/**
 *
 * @author ludwi
 */

@WebServlet("/api/carga")
@MultipartConfig(maxFileSize = 10485760)
public class CargaServlet extends HttpServlet {

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setStatus(200);
    }

    private boolean esAdmin(HttpServletRequest req) {
        HttpSession s = req.getSession(false);
        if (s == null) return false;
        Usuario u = (Usuario) s.getAttribute("usuario");
        return u != null && u.getIdRol() == 3; 
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
        if (!esAdmin(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
        try {
            Part archivo = req.getPart("archivo");
            if (archivo == null) { Respuesta.error(res, 400, "No se recibio ningun archivo."); return; }
            InputStream stream = archivo.getInputStream();
            CargadorDatos cargador = new CargadorDatos();
            java.util.Map<String, Object> resultado = cargador.procesar(stream);
            Respuesta.exito(res, resultado);
        } catch (Exception e) {
            Respuesta.error(res, 500, "Error al procesar el archivo: " + e.getMessage());
        }
    }
}
