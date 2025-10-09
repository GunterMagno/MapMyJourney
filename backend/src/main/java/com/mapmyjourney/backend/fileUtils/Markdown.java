package org.example.fileUtils;

import org.junit.jupiter.api.extension.TestWatcher;

import java.nio.file.Path;
import java.nio.file.Paths;

public class Markdown implements TestWatcher {

    private static final Path mdFilePath = Paths.get("report.md");


}
