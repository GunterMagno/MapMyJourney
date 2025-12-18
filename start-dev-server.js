#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const frontendDir = path.join(__dirname, 'frontend');

console.log('🚀 Iniciando servidor Angular en background...\n');

const server = spawn('npm', ['start'], {
  cwd: frontendDir,
  detached: true,
  stdio: 'pipe'  // Ignorar stdio
});

server.unref();  // Permitir que el proceso padre termine

console.log(`✅ Servidor iniciado con PID: ${server.pid}`);
console.log('\n⏳ Esperando que el servidor esté listo (10 segundos)...\n');

setTimeout(() => {
  console.log('✅ Servidor debería estar disponible en http://localhost:4200\n');
  console.log('Para detenerlo, ejecuta: taskkill /F /IM node.exe');
  process.exit(0);
}, 10000);
