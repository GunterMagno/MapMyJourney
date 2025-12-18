#!/usr/bin/env node

/**
 * Script de pruebas automatizadas para MapMyJourney Frontend
 * Verifica que todas las 3 FASES funcionan correctamente
 */

const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4200,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        path: path,
        success: res.statusCode === 200
      }));
    });

    req.on('error', reject);
    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 PRUEBAS AUTOMATIZADAS - MapMyJourney Frontend\n');
  console.log('Verificando que el servidor esté disponible en localhost:4200...\n');

  const routes = [
    '/demo',           // FASE 1
    '/auth/login',     // FASE 3
    '/auth/signup',    // FASE 3
    '/trips',          // FASE 2
    '/style-guide',    // Utilidad
    '/'                // Redirige a /demo
  ];

  const results = [];

  for (const route of routes) {
    try {
      const result = await makeRequest(route);
      results.push(result);
      const icon = result.success ? '✅' : '❌';
      console.log(`${icon} ${route.padEnd(20)} - Status: ${result.status}`);
    } catch (error) {
      results.push({ path: route, success: false, error: error.message });
      console.log(`❌ ${route.padEnd(20)} - Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\n📊 RESUMEN: ${passed}/${total} rutas funcionan correctamente\n`);

  if (passed === total) {
    console.log('✅ TODAS LAS PRUEBAS PASARON\n');
    console.log('Próximos pasos:');
    console.log('1. Abrir http://localhost:4200/demo en el navegador');
    console.log('2. Probar Modal: clic en "Abrir Modal", ESC para cerrar');
    console.log('3. Probar Tooltips: hover sobre los botones');
    console.log('4. Probar Tabs: clic en las pestañas');
    console.log('5. Probar Toast: clic en botones de notificaciones');
    console.log('6. Navegar a /auth/signup para probar formularios');
  } else {
    console.log('⚠️ ALGUNAS RUTAS FALLARON - Verifica que npm start esté ejecutándose\n');
    process.exit(1);
  }
}

runTests().catch(console.error);
