package com.mapmyjourney.backend.model;

public class Viaje {
    public String titulo = "Viaje a Benidorm";

    public Viaje(String titulo) {
        this.titulo = titulo;
    }

    public boolean comprobarNombre(String titulo) {
        return !titulo.isEmpty() && titulo.length() <= 30;
    }
}