@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo MapMyJourney Backend - Setup Automatico
echo ========================================
echo.

REM Verificar Java
echo Verificando Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo Error: Java no esta instalado.
    echo Descarga e instala Java 21+ desde: https://www.oracle.com/java/technologies/downloads/#java21
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1') do set JAVA_VERSION=%%i
echo OK: Java encontrado: %JAVA_VERSION:~0,30%...
echo.

REM Verificar Maven
echo Verificando Maven...
where mvn >nul 2>&1
if errorlevel 1 (
    echo Error: Maven no esta instalado.
    echo Descarga e instala Maven 3.8+ desde: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo OK: Maven encontrado
echo.

REM Compilar
echo Compilando proyecto...
call mvn clean compile
if errorlevel 1 (
    echo Error: Fallo en compilacion
    pause
    exit /b 1
)
echo OK: Compilacion completada
echo.

REM Tests
echo Ejecutando tests (29 tests)...
call mvn test
if errorlevel 1 (
    echo Advertencia: Algunos tests fallaron, pero continuando...
) else (
    echo OK: Todos los tests pasaron
)
echo.

REM Empaquetar
echo Empaquetando aplicacion...
call mvn package -DskipTests
if errorlevel 1 (
    echo Error: Fallo en empaquetado
    pause
    exit /b 1
)
echo OK: Aplicacion empaquetada: target\backend-1.0.0.jar
echo.

REM Listo
echo Setup completado exitosamente!
echo.
echo Proximos pasos:
echo   1. Iniciar servidor:
echo      mvn spring-boot:run
echo.
echo   2. O con JAR compilado:
echo      java -jar target\backend-1.0.0.jar
echo.
echo   3. Acceder a Swagger UI:
echo      http://localhost:8080/swagger-ui.html
echo.
echo   4. H2 Database Console:
echo      http://localhost:8080/h2-console
echo      JDBC URL: jdbc:h2:mem:mapmyjourney
echo      Usuario: sa
echo      Contraseña: (dejar vacia)
echo.
pause
