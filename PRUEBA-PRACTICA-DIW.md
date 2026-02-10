# Documentación de Diseño

## Arquitectura

### ¿Por qué has colocado tus variables en la capa Settings y tus estilos en Components?

He puesto las variables en `Settings` porque es la primera capa donde se definen configuraciones globales como colores, espaciados, fuentes y demas cosas, estas variables se usan luego en toda la aplicación. Los estilos de los componentes van en `Components` porque es donde se maquetan elementos concretos de la interfaz como botones o tarjetas.

### ¿Qué pasaría si importaras Components antes que Settings en el manifiesto?

Si importo `Components` antes que `Settings` los estilos de los componentes no podrían usar las variables porque todavía no estarían definidas por lo que el navegador daría errores o usaría valores por defecto que traen ya por defecto haciendo feo todo el diseño visual.


## Metodología

### Explica una ventaja real que te haya aportado usar BEM en este examen frente a usar selectores de etiqueta anidados (ej: div > button).

La ventaja principal de usar **BEM** es que puedo identificar rápidamente a qué pertenece cada clase sin tener que revisar el HTML completo. Por ejemplo, con `note-card__footer` sé que es el footer del componente `note-card`, mientras que con selectores anidados como `div > button` tendría que buscar en el HTML para saber a que botón se esta refiriendo, además, BEM evita problemas de especificidad y hace el código más reutilizable, porque con los selectores anidados también depende de la estructura HTML y si se cambia hay que cambiarlo tambien en el CSS.