package com.mapmyjourney.backend.model;

// import com.mapmyjourney.backend.fileUtils.Markdown;
// import org.junit.jupiter.api.extension.ExtendWith;

/**
 * Clase de prueba para la clase {@link Viaje}.
 * <p>
 * Utiliza JUnit para comprobar si los títulos de los viajes son válidos.
 */
// @ExtendWith(Markdown.class)
public class ViajeTest {

    /**
     * Test que valida el título de un viaje.
     * <p>
     * - Si el título está vacío o supera los 30 caracteres, se espera que falle.
     * - Si es válido, se espera que pase.
     * <p>
     * Usa la variable de entorno "TITULO_VIAJE". Si no existe, se pone un título largo por defecto.
     */
    // Test comentado - clase Viaje no existe en este proyecto
    /*
    @Test
    void validarTitulo() {
        String titulo = System.getenv("TITULO_VIAJE");
        if (titulo == null) titulo = "Viaje a Benidorm";

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
    */
}
