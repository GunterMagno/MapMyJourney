package com.mapmyjourney.backend.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ViajeTest {

    @Test
    void validarTitulo(){
        String titulo = System.getenv("TITULO_VIAJE");

        if (titulo == null){
            titulo = "";
        }

        Viaje v = new Viaje(titulo);
        boolean resultado = v.comprobarNombre(titulo);

        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String fechaHora = ahora.format(formato);

        if (titulo.isEmpty() || titulo.length() > 30) {
            assertFalse(resultado,  "[" + fechaHora + "] " + "✅Test de Viaje correctos");
        } else {
            assertTrue(resultado, "[" + fechaHora + "] " + "❌Test de Viaje fallido -> El nombre no puede estar vacío o ser mayor a 30 caracteres.");
        }
    }
}
