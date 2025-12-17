# Documentación del Proyecto MapMyJourney

Este directorio contiene toda la documentación del proyecto tanto generada automáticamente como documentación estática.

## Estructura de Carpetas

```
docs/
├── backend/                 # Documentación del backend (Entities, DTOs, endpoints)
│   ├── Documentacion.md    # Guía completa del backend
│   ├── Modelo de datos.txt # Descripción de entidades
│   └── Diagrama ER.png     # Diagrama entidad-relación
│
├── design/                 # Guía de diseño y arquitectura CSS
│   └── DOCUMENTACION.md    # Documentación de estilos y componentes
│
├── deploy/                 # Guía de despliegue e instrucciones
│   └── deploy-instructions.md # Instrucciones de GitHub Actions y CI/CD
│
├── javadoc-api/            # Documentación automática del código Java (GENERADA)
│   ├── index.html          # Entrada principal del Javadoc
│   ├── com/                # Código fuente documentado
│   ├── resources/          # Recursos utilizados por Javadoc
│   ├── script-dir/         # Scripts de búsqueda y navegación
│   ├── pdf/                # Documentación en formato PDF
│   └── *.html, *.js, *.css # Archivos de documentación generados
│
├── legal/                  # Información legal y licencias
│   ├── LICENSE             # Licencia principal
│   ├── jquery.md           # Licencia jQuery
│   └── jqueryUI.md         # Licencia jQuery UI
│
└── .nojekyll               # Archivo para desactivar Jekyll en GitHub Pages
```

## Actualización de Documentación

### Javadoc (Automático)
La documentación del Javadoc se genera automáticamente mediante GitHub Actions:
1. Se ejecuta `mvn clean javadoc:javadoc` en el backend
2. Los archivos HTML se convierten a PDF con `wkhtmltopdf`
3. Todo se copia a `docs/javadoc-api/`

**Nota**: Los archivos en `docs/javadoc-api/` son generados automáticamente y NO deben ser editados manualmente.

### Documentación Manual
Las siguientes carpetas contienen documentación estática que puede ser editada:
- `docs/backend/` - Documentación de la arquitectura del backend
- `docs/design/` - Guía de diseño y estilos CSS
- `docs/deploy/` - Instrucciones de despliegue
- `docs/legal/` - Información legal

## Acceso a la Documentación

### Local
- **Javadoc**: Abre `docs/javadoc-api/index.html` en tu navegador
- **Otros documentos**: Abre los archivos `.md` en tu editor

### En GitHub Pages
- **Sitio principal**: Por definir
- **Javadoc**: https://GunterMagno.github.io/MapMyJourney/