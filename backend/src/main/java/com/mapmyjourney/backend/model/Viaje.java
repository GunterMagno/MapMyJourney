package org.example.model;

public class Viaje {
    public String titulo = "Viaje a Benidorm";

    public Viaje(String titulo) {
        this.titulo = titulo;
    }

    public boolean comprobarNombre(String titulo) {
        if (titulo.isEmpty() || titulo.length() < 30) {
            return false;
        } else return true;
    }
}