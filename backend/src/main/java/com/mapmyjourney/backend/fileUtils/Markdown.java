package com.mapmyjourney.backend.fileUtils;

import org.junit.jupiter.api.extension.ExtensionContext;
import org.junit.jupiter.api.extension.TestWatcher;

import java.io.*;
import java.nio.file.*;

public class Markdown implements TestWatcher {

    private static final Path mdFilePath = Paths.get("report.md");

    static {
        try (FileWriter writer = new FileWriter(mdFilePath.toFile())) {
            writer.write("# Resultados de las Pruebas\n\n");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void logTestResult(ExtensionContext context) {
        String testName = context.getDisplayName();
        //String markdownContent = Como saco el mensaje que tengo puesto en el test

        try (FileWriter writer = new FileWriter(mdFilePath.toFile(), true)) {
          //  writer.write(markdownContent);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void testSuccessful(ExtensionContext context) {
        logTestResult(context);
    }

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        logTestResult(context);
    }

    @Override
    public void testAborted(ExtensionContext context, Throwable cause) {
        logTestResult(context);
    }

}
