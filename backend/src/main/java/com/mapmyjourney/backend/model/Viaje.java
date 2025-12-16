package com.mapmyjourney.backend.model;

/**
 * Representa un viaje con un título asociado.
 * <p>
 * La clase permite comprobar si un título de viaje es válido,
 * es decir, si no está vacío y no supera los 30 caracteres.
 */
public class Viaje {

    /**
     * Título del viaje.
     * Inicializa con un valor por defecto: "Viaje a Benidorm".
     */
    public String titulo = "Viaje a Benidorm";

    /**
     * Constructor de la clase Viaje.
     *
     * @param titulo El título del viaje que se asignará al objeto.
     */
    public Viaje(String titulo) {
        this.titulo = titulo;
    }

    /**
     * Comprobar si el título del viaje es válido.
     * <p>
     * Un título es válido si no está vacío y no excede los 30 caracteres.
     *
     * @param titulo El título a comprobar.
     * @return {@code true} si el título es válido, {@code false} en caso contrario.
     */
    public boolean comprobarNombre(String titulo) {
        return !titulo.isEmpty() && titulo.length() <= 30;
    }
}
