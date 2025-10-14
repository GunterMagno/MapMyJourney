package com.mapmyjourney.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal para iniciar la aplicación Spring Boot.
 * <p>
 * La anotación {@link SpringBootApplication} marca esta clase como el punto de entrada para la aplicación,
 * permitiendo que Spring Boot configure automáticamente el contexto de la aplicación y arranque el servidor.
 */
@SpringBootApplication
public class BackendApplication {

    /**
     * Método principal que arranca la aplicación Spring Boot.
     *
     * @param args Los argumentos de línea de comando, que pueden ser utilizados para pasar configuraciones al iniciar la aplicación.
     */
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
