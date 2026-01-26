# Instrucciones de Despliegue en Render

## Configuración Realizada

### 1. **Frontend - Static Site**
- Se despliega como sitio estático desde `frontend/dist/frontend/browser`
- Build: `npm install && npm run build`
- Configurado para Angular con rutas dinámicas (SPA)

### 2. **Backend - Docker Service**
- Se despliega como servicio Docker desde `backend/Dockerfile`
- Usa perfil de producción: `spring.profiles.active=prod`
- Base de datos H2 persistente en `/data`

---

## Configuración de URLs

### Variables de Entorno Configuradas

**Development (localhost):**
```
Frontend: http://localhost:4200
Backend: http://localhost:8080/api
```

**Production (Render):**
```
Frontend: https://mapmyjourney.onrender.com
Backend: https://mapmyjourney-backend.onrender.com/api
```

### Archivos Configurados

#### 1. `frontend/src/environments/environment.ts` (Desarrollo)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

#### 2. `frontend/src/environments/environment.prod.ts` (Producción)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://mapmyjourney-backend.onrender.com/api'
};
```

#### 3. `backend/src/main/resources/application-prod.properties`
```properties
server.port=10000
server.servlet.context-path=/api
spring.datasource.url=jdbc:h2:file:/data/mapmyjourney;MODE=MySQL;AUTO_SERVER=TRUE
spring.web.cors.allowed-origins=https://mapmyjourney.onrender.com
```

---

## Requisitos Necesarios

### 1. **Backend Dockerfile**
Copia este contenido a `backend/Dockerfile`:
```dockerfile
FROM eclipse-temurin:21-jdk-alpine as builder
WORKDIR /workspace
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .
COPY src src
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN mkdir -p /data
COPY --from=builder /workspace/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 10000
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 2. **Frontend angular.json - Build Configuration**
Asegúrate de que el build output esté en `dist/frontend/browser`:
```json
{
  "projects": {
    "frontend": {
      "architect": {
        "build": {
          "outputPath": "dist/frontend/browser"
        }
      }
    }
  }
}
```

---

## Paso a Paso para Desplegar

1. **Crear Dockerfile del Backend** (ver arriba)

2. **Conectar en Render:**
   - Ve a https://dashboard.render.com
   - Selecciona "Blueprint" y apunta a tu repositorio GitHub
   - Render automáticamente leerá `render.yaml` y creará los servicios

3. **Configurar URLs:**
   - Después de desplegar, anota las URLs de Render
   - Actualiza `environment.prod.ts` con la URL correcta del backend

4. **Test de Conexión:**
   - Frontend debería estar en: `https://mapmyjourney.onrender.com`
   - Backend debería estar en: `https://mapmyjourney-backend.onrender.com/api`

---

## Solución de Problemas

### El frontend no se conecta al backend
1. Verifica que la URL en `environment.prod.ts` sea correcta
2. Revisa la configuración CORS en `application-prod.properties`
3. Comprueba que el backend esté en ejecución: visita `/api/health`

### El frontend muestra página en blanco
1. Verifica que el build completo se haya ejecutado correctamente
2. Revisa los logs en Render: "Logs" > "Build Logs"
3. Asegúrate de que `angular.json` tenga el output path correcto

### Base de datos H2 no persiste
1. El disco debe estar montado en `/data` (ya configurado en `render.yaml`)
2. La URL de conexión debe usar `file:/data/mapmyjourney`

---

## Cambios Realizados en el Repositorio

- ✅ `.env.production` - Variables de entorno para producción
- ✅ `frontend/src/environments/environment.ts` - URL localhost
- ✅ `frontend/src/environments/environment.prod.ts` - URL producción
- ✅ `backend/src/main/resources/application-prod.properties` - Config de servidor
- ✅ `render.yaml` - Configuración de despliegue en Render
