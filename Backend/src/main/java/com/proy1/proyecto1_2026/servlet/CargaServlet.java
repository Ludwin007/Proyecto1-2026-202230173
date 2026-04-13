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

    private void setCors(HttpServletResponse res) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:4200");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Usuario-Id, X-Usuario-Rol, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "3600");
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

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException, ServletException {
    setCors(res);
    if (!esAdmin(req)) { Respuesta.error(res, 403, "Acceso denegado."); return; }
    try {
        Part archivo = req.getPart("archivo");
        if (archivo == null) { 
            Respuesta.error(res, 400, "No se recibio ningun archivo."); 
            return; 
        }
        System.out.println("Archivo recibido: " + archivo.getSubmittedFileName());
        System.out.println("Tamano: " + archivo.getSize());
        InputStream stream = archivo.getInputStream();
        CargadorDatos cargador = new CargadorDatos();
        java.util.Map<String, Object> resultado = cargador.procesar(stream);
        System.out.println("Procesados: " + resultado.get("procesados"));
        System.out.println("Errores: " + resultado.get("errores"));
        Respuesta.exito(res, resultado);
    } catch (Exception e) {
        System.err.println("ERROR EN CARGA: " + e.getMessage());
        e.printStackTrace();
        Respuesta.error(res, 500, "Error al procesar el archivo: " + e.getMessage());
    }
}
}

