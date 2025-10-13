package com.mapmyjourney.backend.fileUtils;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class Markdown implements TestWatcher {

    private static final Path mdFilePath = Paths.get("report.md");
    private static final ThreadLocal<String> mensajeThread = new ThreadLocal<>();

    static {
        // Crear encabezado solo si no existe
        if (!Files.exists(mdFilePath)) {
            try (FileWriter writer = new FileWriter(mdFilePath.toFile())) {
                writer.write("# Resultados de las Pruebas\n\n");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static void saveMessage(String mensaje) {
        mensajeThread.set(mensaje);
    }

    private void appendToMarkdown(String content) {
        try (FileWriter writer = new FileWriter(mdFilePath.toFile(), true)) {
            writer.write(content + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

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

    @Override
    public void testSuccessful(ExtensionContext context) {
        String mensaje = mensajeThread.get();
        String testName = context.getDisplayName();
        appendToMarkdown("\n" + testName + " -> " + mensaje);
        mensajeThread.remove();
        updateCounter();
    }

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        String mensaje = mensajeThread.get();
        String testName = context.getDisplayName();
        appendToMarkdown("\n" + testName + " -> " + mensaje);
        mensajeThread.remove();
        updateCounter();
    }

}
