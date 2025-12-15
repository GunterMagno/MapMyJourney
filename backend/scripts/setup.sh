#!/bin/bash

set -e

echo ""
echo "MapMyJourney Backend - Setup Automatico"
echo "========================================"
echo ""

# Verificar Java
echo "Verificando Java..."
if ! command -v java &> /dev/null; then
    echo "Error: Java no esta instalado."
    echo "Descarga e instala Java 21+ desde: https://www.oracle.com/java/technologies/downloads/#java21"
    exit 1
fi
echo "OK: Java encontrado"
echo ""

# Verificar Maven
echo "Verificando Maven..."
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven no esta instalado."
    echo "Descarga e instala Maven 3.8+ desde: https://maven.apache.org/download.cgi"
    exit 1
fi
echo "OK: Maven encontrado"
echo ""

# Compilar
echo "Compilando proyecto..."
mvn clean compile
if [ $? -ne 0 ]; then
    echo "Error: Fallo en compilacion"
    exit 1
fi
echo "OK: Compilacion completada"
echo ""

# Tests
echo "Ejecutando tests (29 tests)..."
mvn test
if [ $? -ne 0 ]; then
    echo "Advertencia: Algunos tests fallaron, pero continuando..."
else
    echo "OK: Todos los tests pasaron"
fi
echo ""
0
# Empaquetar
echo "Empaquetando aplicacion..."
mvn package -DskipTests
if [ $? -ne 0 ]; then
    echo "Error: Fallo en empaquetado"
    exit 1
fi
echo "OK: Aplicacion empaquetada: target/backend-1.0.0.jar"
echo ""

# Listo
echo "Setup completado exitosamente!"
echo ""
echo "Proximos pasos:"
echo "  1. Iniciar servidor:"
echo "     mvn spring-boot:run"
echo ""
echo "  2. O con JAR compilado:"
echo "     java -jar target/backend-1.0.0.jar"
echo ""
echo "  3. Acceder a Swagger UI:"
echo "     http://localhost:8080/api/swagger-ui.html"
echo ""
echo "  4. H2 Database Console:"
echo "     http://localhost:8080/api/h2-console"
echo "     JDBC URL: jdbc:h2:mem:mapmyjourney"
echo "     Usuario: sa"
echo "     Contraseña: (dejar vacia)"
echo ""
