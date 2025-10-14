package com.mapmyjourney.backend.model;

import com.mapmyjourney.backend.fileUtils.Markdown;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Clase de prueba para la clase {@link Viaje}.
 * <p>
 * Utiliza JUnit para comprobar si los títulos de los viajes son válidos.
 * También guarda mensajes del resultado del test usando la clase {@link Markdown}.
 */
@ExtendWith(Markdown.class)
public class ViajeTest {

    /**
     * Test que valida el título de un viaje.
     * <p>
     * - Si el título está vacío o supera los 30 caracteres, se espera que falle.
     * - Si es válido, se espera que pase.
     * <p>
     * El resultado del test se guarda en un archivo usando {@link Markdown#saveMessage(String)}.
     * <p>
     * Usa la variable de entorno "TITULO_VIAJE". Si no existe, se pone un título largo por defecto.
     */
    @Test
    void validarTitulo() {
        String titulo = System.getenv("TITULO_VIAJE");
        if (titulo == null) titulo = "Viaje a Benidormooooooooooooooooooooo";

        Viaje v = new Viaje(titulo);
        boolean resultado = v.comprobarNombre(titulo);

        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formato = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String fechaHora = ahora.format(formato);

        String mensaje;
        if (titulo.isEmpty() || titulo.length() > 30) {
            mensaje = "[" + fechaHora + "] ❌ El nombre no puede estar vacío o superar los 30 caracteres.";
            assertFalse(resultado, mensaje);
        } else {
            mensaje = "[" + fechaHora + "] ✅ Test de Viaje correctos";
            assertTrue(resultado, mensaje);
        }

        Markdown.saveMessage(mensaje);
    }
}
