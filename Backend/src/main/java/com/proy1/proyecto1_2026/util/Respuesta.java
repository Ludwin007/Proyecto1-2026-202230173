/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.util;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

/**
 *
 * @author ludwi
 */

public class Respuesta {

    private static final Gson gson = new GsonBuilder().setDateFormat("dd/MM/yyyy").create();
    public static void enviar(HttpServletResponse res, int codigo, Object datos) throws IOException {
        res.setStatus(codigo);
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        PrintWriter out = res.getWriter();
        out.print(gson.toJson(datos));
        out.flush();
    }

    public static void exito(HttpServletResponse res, Object datos) throws IOException {
        enviar(res, 200, datos);
    }

    public static void creado(HttpServletResponse res, Object datos) throws IOException {
        enviar(res, 201, datos);
    }

    public static void error(HttpServletResponse res, int codigo, String mensaje) throws IOException {
        Map<String, String> mapa = new HashMap<>();
        mapa.put("error", mensaje);
        enviar(res, codigo, mapa);
    }

    public static <T> T parsear(String json, Class<T> tipo) {
        return gson.fromJson(json, tipo);
    }

    public static Gson getGson() {
        return gson;
    }
}