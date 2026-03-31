/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.proy1.proyecto1_2026.util;

import com.proy1.proyecto1_2026.dao.*;
import com.proy1.proyecto1_2026.modelo.*;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.*;

/**
 *
 * @author ludwi
 */

public class CargadorDatos {

    private final UsuarioDAO usuarioDAO = new UsuarioDAO();
    private final DestinoDAO destinoDAO = new DestinoDAO();
    private final ProveedorDAO proveedorDAO = new ProveedorDAO();
    private final PaqueteDAO paqueteDAO = new PaqueteDAO();
    private final ClienteDAO clienteDAO = new ClienteDAO();
    private final ReservacionDAO reservacionDAO = new ReservacionDAO();
    private final PagoDAO pagoDAO = new PagoDAO();
    private int procesados = 0;
    private List<String> errores = new ArrayList<>();

    public Map<String, Object> procesar(InputStream entrada) {
        procesados = 0;
        errores = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(entrada, "UTF-8"))) {
            String linea;
            int numeroLinea = 0;
            while ((linea = reader.readLine()) != null) {
                numeroLinea++;
                linea = linea.trim();
                if (linea.isEmpty()) continue;
                procesarLinea(linea, numeroLinea);
            }
        } catch (Exception e) {
            errores.add("Error al leer el archivo: " + e.getMessage());
        }
        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("procesados", procesados);
        resultado.put("errores", errores);
        return resultado;
    }

    private void procesarLinea(String linea, int numeroLinea) {
        try {
            if (linea.startsWith("USUARIO(")) {
                procesarUsuario(extraerArgumentos(linea), numeroLinea);
            } else if (linea.startsWith("DESTINO(")) {
                procesarDestino(extraerArgumentos(linea), numeroLinea);
            } else if (linea.startsWith("PROVEEDOR(")) {
                procesarProveedor(extraerArgumentos(linea), numeroLinea);
            } else if (linea.startsWith("PAQUETE(")) {
                procesarPaquete(extraerArgumentos(linea), numeroLinea);
            } else if (linea.startsWith("SERVICIO_PAQUETE(")) {
                procesarServicioPaquete(extraerArgumentos(linea), numeroLinea);
            } else if (linea.startsWith("CLIENTE(")) {
                procesarCliente(extraerArgumentos(linea), numeroLinea);
            } else if (linea.startsWith("RESERVACION(")) {
                procesarReservacion(extraerArgumentos(linea), numeroLinea);
            } else if (linea.startsWith("PAGO(")) {
                procesarPago(extraerArgumentos(linea), numeroLinea);
            } else {
                errores.add("Linea " + numeroLinea + ": instruccion no reconocida.");
            }
        } catch (Exception e) {
            errores.add("Linea " + numeroLinea + ": " + e.getMessage());
        }
    }

    private List<String> extraerArgumentos(String linea) {
        int inicio = linea.indexOf('(');
        int fin = linea.lastIndexOf(')');
        String contenido = linea.substring(inicio + 1, fin);
        List<String> args = new ArrayList<>();
        Pattern pattern = Pattern.compile("\"([^\"]*)\"|([^,]+)");
        Matcher matcher = pattern.matcher(contenido);
        while (matcher.find()) {
            if (matcher.group(1) != null) {
                args.add(matcher.group(1).trim());
            } else {
                args.add(matcher.group(2).trim());
            }
        }
        return args;
    }

    private void procesarUsuario(List<String> args, int linea) throws Exception {
        if (args.size() < 3) throw new Exception("Formato incorrecto para USUARIO.");
        String nombre = args.get(0);
        String pass = args.get(1);
        int tipo;
        try {
            tipo = Integer.parseInt(args.get(2).trim());
        } catch (NumberFormatException e) {
            throw new Exception("Tipo de usuario invalido en USUARIO.");
        }
        if (pass.length() < 6) throw new Exception("Password debe tener minimo 6 caracteres en USUARIO '" + nombre + "'.");
        if (tipo < 1 || tipo > 3) throw new Exception("Tipo de usuario debe ser 1, 2 o 3 en USUARIO '" + nombre + "'.");
        if (usuarioDAO.existeNombre(nombre)) throw new Exception("Usuario duplicado: '" + nombre + "'.");
        Usuario u = new Usuario();
        u.setNombreUsuario(nombre);
        u.setContrasena(pass);
        u.setIdRol(tipo);
        usuarioDAO.crear(u);
        procesados++;
    }

    private void procesarDestino(List<String> args, int linea) throws Exception {
        if (args.size() < 3) throw new Exception("Formato incorrecto para DESTINO.");
        String nombre = args.get(0);
        String pais = args.get(1);
        String desc = args.get(2);
        if (destinoDAO.obtenerPorNombre(nombre) != null) throw new Exception("Destino duplicado: '" + nombre + "'.");
        Destino d = new Destino();
        d.setNombre(nombre);
        d.setPais(pais);
        d.setDescripcion(desc);
        destinoDAO.crear(d);
        procesados++;
    }

    private void procesarProveedor(List<String> args, int linea) throws Exception {
        if (args.size() < 3) throw new Exception("Formato incorrecto para PROVEEDOR.");
        String nombre = args.get(0);
        int tipo;
        try {
            tipo = Integer.parseInt(args.get(1).trim());
        } catch (NumberFormatException e) {
            throw new Exception("Tipo de proveedor invalido en PROVEEDOR '" + nombre + "'.");
        }
        String pais = args.get(2);
        if (tipo < 1 || tipo > 5) throw new Exception("Tipo proveedor fuera de rango en '" + nombre + "'.");
        if (proveedorDAO.obtenerPorNombre(nombre) != null) throw new Exception("Proveedor duplicado: '" + nombre + "'.");
        Proveedor p = new Proveedor();
        p.setNombre(nombre);
        p.setTipoServicio(tipo);
        p.setPaisOperacion(pais);
        proveedorDAO.crear(p);
        procesados++;
    }

    private void procesarPaquete(List<String> args, int linea) throws Exception {
        if (args.size() < 5) throw new Exception("Formato incorrecto para PAQUETE.");
        String nombre = args.get(0);
        String destNombre = args.get(1);
        int duracion;
        double precio;
        int capacidad;
        try {
            duracion = Integer.parseInt(args.get(2).trim());
            precio = Double.parseDouble(args.get(3).trim());
            capacidad = Integer.parseInt(args.get(4).trim());
        } catch (NumberFormatException e) {
            throw new Exception("Valores numericos incorrectos en PAQUETE '" + nombre + "'.");
        }
        if (duracion <= 0) throw new Exception("Duracion debe ser positiva en PAQUETE '" + nombre + "'.");
        if (precio <= 0) throw new Exception("Precio debe ser positivo en PAQUETE '" + nombre + "'.");
        if (capacidad <= 0) throw new Exception("Capacidad debe ser positiva en PAQUETE '" + nombre + "'.");
        Destino dest = destinoDAO.obtenerPorNombre(destNombre);
        if (dest == null) throw new Exception("Destino '" + destNombre + "' no existe en PAQUETE '" + nombre + "'.");
        if (paqueteDAO.obtenerPorNombre(nombre) != null) throw new Exception("Paquete duplicado: '" + nombre + "'.");
        Paquete p = new Paquete();
        p.setNombre(nombre);
        p.setIdDestino(dest.getId());
        p.setDuracionDias(duracion);
        p.setPrecioVenta(precio);
        p.setCapacidadMaxima(capacidad);
        paqueteDAO.crear(p);
        procesados++;
    }

    private void procesarServicioPaquete(List<String> args, int linea) throws Exception {
        if (args.size() < 4) throw new Exception("Formato incorrecto para SERVICIO_PAQUETE.");
        String nomPaquete = args.get(0);
        String nomProveedor = args.get(1);
        String descripcion = args.get(2);
        double costo;
        try {
            costo = Double.parseDouble(args.get(3).trim());
        } catch (NumberFormatException e) {
            throw new Exception("Costo invalido en SERVICIO_PAQUETE.");
        }
        if (costo < 0) throw new Exception("Costo no puede ser negativo en SERVICIO_PAQUETE.");
        Paquete paquete = paqueteDAO.obtenerPorNombre(nomPaquete);
        if (paquete == null) throw new Exception("Paquete '" + nomPaquete + "' no existe en SERVICIO_PAQUETE.");
        Proveedor proveedor = proveedorDAO.obtenerPorNombre(nomProveedor);
        if (proveedor == null) throw new Exception("Proveedor '" + nomProveedor + "' no existe en SERVICIO_PAQUETE.");
        ServicioPaquete sp = new ServicioPaquete();
        sp.setIdPaquete(paquete.getId());
        sp.setIdProveedor(proveedor.getId());
        sp.setDescripcion(descripcion);
        sp.setCostoProveedor(costo);
        paqueteDAO.agregarServicio(sp);
        procesados++;
    }

    private void procesarCliente(List<String> args, int linea) throws Exception {
        if (args.size() < 6) throw new Exception("Formato incorrecto para CLIENTE.");
        String dpi = args.get(0);
        String nombre = args.get(1);
        String fechaStr = args.get(2);
        String telefono = args.get(3);
        String email = args.get(4);
        String nacionalidad = args.get(5);
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        sdf.setLenient(false);
        java.util.Date fecha;
        try {
            fecha = sdf.parse(fechaStr);
        } catch (Exception e) {
            throw new Exception("Formato de fecha invalido en CLIENTE '" + nombre + "'. Use dd/MM/yyyy.");
        }
        if (clienteDAO.obtenerPorDpi(dpi) != null) throw new Exception("Cliente duplicado con DPI: '" + dpi + "'.");
        Cliente c = new Cliente();
        c.setDpiPasaporte(dpi);
        c.setNombreCompleto(nombre);
        c.setFechaNacimiento(fecha);
        c.setTelefono(telefono);
        c.setCorreo(email);
        c.setNacionalidad(nacionalidad);
        clienteDAO.crear(c);
        procesados++;
    }

    private void procesarReservacion(List<String> args, int linea) throws Exception {
        if (args.size() < 4) throw new Exception("Formato incorrecto para RESERVACION.");
        String nomPaquete = args.get(0);
        String nomUsuario = args.get(1);
        String fechaStr = args.get(2);
        String pasajerosStr = args.get(3);
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        sdf.setLenient(false);
        java.util.Date fechaViaje;
        try {
            fechaViaje = sdf.parse(fechaStr);
        } catch (Exception e) {
            throw new Exception("Formato de fecha invalido en RESERVACION. Use dd/MM/yyyy.");
        }
        Paquete paquete = paqueteDAO.obtenerPorNombre(nomPaquete);
        if (paquete == null) throw new Exception("Paquete '" + nomPaquete + "' no existe en RESERVACION.");
        Usuario agente = null;
        try {
            agente = usuarioDAO.autenticar(nomUsuario, null);
        } catch (Exception ignored) {}
        if (agente == null) {
            List<com.proy1.proyecto1_2026.modelo.Usuario> usuarios = usuarioDAO.listar();
            for (com.proy1.proyecto1_2026.modelo.Usuario u : usuarios) {
                if (u.getNombreUsuario().equals(nomUsuario)) { agente = u; break; }
            }
        }
        if (agente == null) throw new Exception("Usuario agente '" + nomUsuario + "' no existe en RESERVACION.");
        String[] dpis = pasajerosStr.split("\\|");
        List<Integer> idsClientes = new ArrayList<>();
        for (String dpi : dpis) {
            Cliente c = clienteDAO.obtenerPorDpi(dpi.trim());
            if (c == null) throw new Exception("Pasajero con DPI '" + dpi.trim() + "' no existe en RESERVACION.");
            idsClientes.add(c.getId());
        }
        Reservacion r = new Reservacion();
        r.setFechaViaje(fechaViaje);
        r.setIdPaquete(paquete.getId());
        r.setCantidadPasajeros(idsClientes.size());
        r.setIdAgente(agente.getId());
        r.setCostoTotal(paquete.getPrecioVenta() * idsClientes.size());
        reservacionDAO.crear(r, idsClientes);
        procesados++;
    }

    private void procesarPago(List<String> args, int linea) throws Exception {
        if (args.size() < 4) throw new Exception("Formato incorrecto para PAGO.");
        String numReservacion = args.get(0);
        double monto;
        int metodo;
        try {
            monto = Double.parseDouble(args.get(1).trim());
            metodo = Integer.parseInt(args.get(2).trim());
        } catch (NumberFormatException e) {
            throw new Exception("Valores numericos invalidos en PAGO.");
        }
        String fechaStr = args.get(3);
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        sdf.setLenient(false);
        java.util.Date fecha;
        try {
            fecha = sdf.parse(fechaStr);
        } catch (Exception e) {
            throw new Exception("Formato de fecha invalido en PAGO. Use dd/MM/yyyy.");
        }
        if (monto <= 0) throw new Exception("Monto debe ser positivo en PAGO.");
        if (metodo < 1 || metodo > 3) throw new Exception("Metodo de pago invalido en PAGO.");
        com.proy1.proyecto1_2026.modelo.Reservacion res = reservacionDAO.obtenerPorNumero(numReservacion);
        if (res == null) throw new Exception("Reservacion '" + numReservacion + "' no existe en PAGO.");
        Pago p = new Pago();
        p.setIdReservacion(res.getId());
        p.setMonto(monto);
        p.setMetodoPago(metodo);
        p.setFechaPago(fecha);
        pagoDAO.registrar(p);
        double totalPagado = res.getTotalPagado() + monto;
        if (totalPagado >= res.getCostoTotal()) {
            reservacionDAO.actualizarEstado(res.getId(), "Confirmada");
        }
        procesados++;
    }
}
