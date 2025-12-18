@echo off
cd /d "c:\Users\alexb\Desktop\Repositorios\MapMyJourney\frontend"
start "Angular Dev Server" npm start
timeout /t 10 /nobreak
echo Servidor debe estar disponible en http://localhost:4200
