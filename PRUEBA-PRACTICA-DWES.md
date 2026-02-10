# Prueba Practica DWES

## El porque del endpoint
He creado el endpoint `/trips/{tripId}/notes` para Listar notas del viaje y `/trips/{tripId}/notes` para Registrar nueva nota. Son notas especificas de cada viaje, he creado este endpoint para que los integrantes puedan añadir notas importantes en sus viajes, tambien para llevar esto acabo he creado `Modelo`, `DTO's`, `Repositorio`, `Servicio` y `Controlador`.

## Como he implementado la seguridad.

La seguridad la he implementado utilizando los decoradores **@PreAuthorize** en el Controlador `TripNoteController.java` para que el controlador compruebe que realmente el usuario esta registrado antes de poder hacer nada, tambien aparte hay decoradores **@Size** para que un usuario no intente petar el backend o la base de datos con inyeccion de codigo o añadiendo notas con millones de caracteres para saturar el sistema.

## Capturas o comandos para probarlo.

Aqui tenemos una captura de que el endpoint aparece en el Swagger
![Captura Swagger](<docs/backend/Captura evidencia de que el endpoint sale en el swagger.png>)