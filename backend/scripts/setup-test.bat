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
    exit /b 1
)
echo OK: Java encontrado
echo.

REM Verificar Maven
echo Verificando Maven...
where mvn >nul 2>&1
if errorlevel 1 (
    echo Error: Maven no esta instalado.
    exit /b 1
)
echo OK: Maven encontrado
echo.

REM Compilar
echo Compilando proyecto...
call mvn clean compile -q
if errorlevel 1 (
    echo Error: Fallo en compilacion
    exit /b 1
)
echo OK: Compilacion completada
echo.

REM Tests
echo Ejecutando tests (29 tests)...
call mvn test -q
if errorlevel 1 (
    echo Advertencia: Algunos tests fallaron, continuando...
) else (
    echo OK: Todos los tests pasaron!
)
echo.

REM Package
echo Empaquetando aplicacion...
call mvn package -DskipTests -q
if errorlevel 1 (
    echo Error: Fallo en empaquetamiento
    exit /b 1
)
echo OK: JAR compilado exitosamente
echo.

echo ========================================
echo SETUP COMPLETADO CON EXITO
echo ========================================
echo.
echo Pasos siguientes:
echo   Ejecutar servidor: mvn spring-boot:run
echo   Swagger: http://localhost:8080/api/swagger-ui.html
echo   H2 Console: http://localhost:8080/api/h2-console
echo.
