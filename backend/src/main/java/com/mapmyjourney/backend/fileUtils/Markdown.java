package com.mapmyjourney.backend.fileUtils;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

/**
 * Clase para manejar la escritura de los resultados de las pruebas en un archivo Markdown.
 * Implementa la interfaz {@link TestWatcher} para registrar los resultados de los tests.
 * <p>
 * Los resultados de las pruebas (exitosos o fallidos) se escriben en un archivo llamado {@code report.md}.
 * También se actualiza un contador de pruebas realizadas, correctas y fallidas al final del archivo.
 */
public class Markdown implements TestWatcher {

    /**
     * Ruta del archivo Markdown donde se guardarán los resultados de las pruebas.
     */
    private static final Path mdFilePath = Paths.get("report.md");

    /**
     * Almacena el mensaje del test actual de manera local por hilo.
     * Utilizado para guardar el mensaje correspondiente de cada prueba.
     */
    private static final ThreadLocal<String> mensajeThread = new ThreadLocal<>();

    static {
        // Crear encabezado solo si el archivo no existe
        if (!Files.exists(mdFilePath)) {
            try (FileWriter writer = new FileWriter(mdFilePath.toFile())) {
                writer.write("# Resultados de las Pruebas\n\n");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Guarda un mensaje para la prueba actual.
     *
     * @param mensaje El mensaje que se guardará.
     */
    public static void saveMessage(String mensaje) {
        mensajeThread.set(mensaje);
    }

    /**
     * Agrega contenido al final del archivo Markdown.
     *
     * @param content El contenido que se añadirá al archivo.
     */
    private void appendToMarkdown(String content) {
        try (FileWriter writer = new FileWriter(mdFilePath.toFile(), true)) {
            writer.write(content + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Actualiza el contador de pruebas en el archivo Markdown.
     * Reescribe el archivo con el contador de pruebas y mantiene los mensajes anteriores intactos.
     */
    private void updateCounter() {
        try {
            List<String> lines = Files.readAllLines(mdFilePath);
            long total = lines.stream().filter(l -> l.startsWith("[") && (l.contains("✅") || l.contains("❌"))).count();
            long correctos = lines.stream().filter(l -> l.startsWith("[") && l.contains("✅")).count();
            long fallidos = lines.stream().filter(l -> l.startsWith("[") && l.contains("❌")).count();

            String contador = "Test realizados hasta ahora: " + total + ", " + correctos + " correctos, " + fallidos + " fallidos";

            // Reescribir archivo con contador arriba y mensajes intactos
            try (FileWriter writer = new FileWriter(mdFilePath.toFile())) {
                writer.write("# Resultados de las Pruebas\n\n");
                writer.write(contador + "\n\n");
                for (String l : lines) {
                    if (!l.startsWith("Test realizados hasta ahora") && !l.startsWith("#")) {
                        writer.write(l + "\n");
                    }
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Método que se ejecuta cuando un test es exitoso.
     * <p>
     * Registra el resultado exitoso en el archivo Markdown y actualiza el contador de pruebas.
     *
     * @param context El contexto de la prueba que contiene el nombre del test.
     */
    @Override
    public void testSuccessful(ExtensionContext context) {
        String mensaje = mensajeThread.get();
        String testName = context.getDisplayName();
        appendToMarkdown("\n" + testName + " -> " + mensaje);
        mensajeThread.remove();
        updateCounter();
    }

    /**
     * Método que se ejecuta cuando un test falla.
     * <p>
     * Registra el resultado fallido en el archivo Markdown y actualiza el contador de pruebas.
     *
     * @param context El contexto de la prueba que contiene el nombre del test.
     * @param cause   El motivo del fallo de la prueba.
     */
    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        String mensaje = mensajeThread.get();
        String testName = context.getDisplayName();
        appendToMarkdown("\n" + testName + " -> " + mensaje);
        mensajeThread.remove();
        updateCounter();
    }
}
