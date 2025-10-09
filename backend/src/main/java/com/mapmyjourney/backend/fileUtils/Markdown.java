package com.mapmyjourney.backend.fileUtils;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Markdown implements TestWatcher {

    private static final Path mdFilePath = Paths.get("report.md");

    // Inicializamos el archivo Markdown al cargar la clase
    static {
        try (FileWriter writer = new FileWriter(mdFilePath.toFile())) {
            writer.write("# Resultados de las Pruebas\n\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Método para escribir en el archivo Markdown
    private void writeToMarkdown(String content) {
        try (FileWriter writer = new FileWriter(mdFilePath.toFile(), true)) {
            writer.write(content + "\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    // Guardar mensajes en context store para tests exitosos
    public static void saveMessage(ExtensionContext context, String message) {
        context.getStore(ExtensionContext.Namespace.GLOBAL).put("mensaje", message);
    }

    @Override
    public void testSuccessful(ExtensionContext context) {
        String testName = context.getDisplayName();
        String mensaje = context.getStore(ExtensionContext.Namespace.GLOBAL)
                .get("mensaje", String.class);
        writeToMarkdown("✅ " + testName + " -> " + mensaje);
    }

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        String testName = context.getDisplayName();
        String mensaje = (cause != null) ? cause.getMessage() : "Test fallido (sin mensaje)";
        writeToMarkdown("❌ " + testName + " -> " + mensaje);
    }

    @Override
    public void testAborted(ExtensionContext context, Throwable cause) {
        String testName = context.getDisplayName();
        writeToMarkdown("⚠️ " + testName + " -> Test abortado");
    }
}