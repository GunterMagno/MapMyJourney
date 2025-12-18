# 🗺️ MapMyJourney

## 📖 Descripción del Proyecto

**MapMyJourney** es una aplicación web colaborativa diseñada para planificar viajes, gestionar gastos compartidos y registrar las experiencias de grupo. Combinamos un **backend robusto en Spring Boot** con un **frontend moderno en Angular** para crear una experiencia completa de gestión de viajes.

### ✨ Características Principales

- **Planificación de Viajes**: Crea y organiza viajes colaborativos
- **Gestión de Gastos**: Registra gastos compartidos y calcula quién debe pagar a quién
- **Autenticación Segura**: JWT con tokens de 24 horas y encriptación BCrypt
- **API REST**: 40+ endpoints documentados con OpenAPI/Swagger
- **Base de Datos Relacional**: Diseño optimizado con H2/SQL
- **Interfaz Intuitiva**: Componentes Angular con arquitectura modular
- **Documentación Automática**: Javadoc HTML y PDF generados con GitHub Actions

---

## 📚 Documentación Importante

### 🔗 Enlaces a Documentación

| Sección | Descripción | Enlace |
|---------|-------------|--------|
| **Backend API** | Documentación completa de endpoints y arquitectura | [Backend Docs](/docs/backend/Documentacion.md) |
| **Diseño & CSS** | Arquitectura visual y sistema de diseño | [Guía de Diseño](/docs/design/DOCUMENTACION.md) |
| **Javadoc API** | Documentación automática del código Java subido a GitHub Pages | [API Documentation](https://guntermagno.github.io/MapMyJourney/) |
| **Deploy & CI/CD** | Guía de despliegue y GitHub Actions | [Deploy Guide](/docs/deploy/deploy-instructions.md) |
| **Base de Datos** | Diagrama ER y modelo de datos | [Database Docs](/docs/backend/) |

---

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Spring Boot 3.5.6
- **Lenguaje**: Java 21
- **Base de Datos**: H2 Database
- **Autenticación**: JWT + Spring Security
- **ORM**: JPA/Hibernate
- **Build**: Maven
- **Testing**: JUnit 5, MockMvc

### Frontend
- **Framework**: Angular (Latest)
- **Lenguaje**: TypeScript
- **Estilos**: SCSS
- **Arquitectura**: Componentes Modulares
- **Routing**: Angular Router con SSR

### DevOps
- **CI/CD**: GitHub Actions
- **Documentación**: Javadoc (HTML + PDF)
- **Hosting**: GitHub Pages
- **Control de Versiones**: Git

---

## 🚀 Inicio Rápido

### Requisitos Previos
- Java 21 (Temurin)
- Maven 3.8+
- Node.js 18+ (para frontend)
- Git

### Instalación Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Instalación Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📊 Estado del Proyecto

## Estado de los tests

### ✅ - Test Correctos- [Javadoc Completo](/docs/javadoc-api/) - Documentación automática del código
- [Diagrama ER](/docs/backend/Diagrama%20ER.png) - Modelo de base de datos
- [Modelo de Datos](/docs/backend/Modelo%20de%20datos.txt) - Descripción de entidades

### Configuración del Proyecto
- [pom.xml](/backend/pom.xml) - Dependencias Maven
- [Insomnia Collection](/backend/MapMyJourney_Insomnia.json) - Requests de API para testing

---

## 📝 Licencia

Este proyecto está bajo licencia abierta. Consulta el archivo [LICENSE](/docs/legal/LICENSE) para más detalles.

---

## 👥 Contribuciones

Para contribuir al proyecto, por favor:
1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
