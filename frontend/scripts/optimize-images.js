#!/usr/bin/env node

/**
 * FASE 5: Optimización de Imágenes
 * 
 * Script para convertir imágenes JPG/PNG a WebP con múltiples resoluciones
 * 
 * Requisitos:
 * - npm install --save-dev sharp
 * 
 * Uso:
 * - npm run optimize:images
 * - node scripts/optimize-images.js
 * 
 * Entrada: frontend/public/assets/**\/*.{jpg,png}
 * Salida: frontend/public/assets/**\/*.webp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Colores ANSI para logs
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
};

/**
 * Obtener todas las imágenes en un directorio
 */
function getImageFiles(dir) {
  const extensions = ['.jpg', '.jpeg', '.png'];
  const files = [];

  function walk(currentPath) {
    if (!fs.existsSync(currentPath)) return;
    
    const items = fs.readdirSync(currentPath);
    
    items.forEach(item => {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Ignorar directorios específicos
        if (item !== 'node_modules' && item !== '.git' && !item.startsWith('.')) {
          walk(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    });
  }

  walk(dir);
  return files;
}

/**
 * Optimizar una imagen individual
 * Crea versiones en WebP con diferentes tamaños
 */
async function optimizeImage(imagePath) {
  try {
    const filename = path.basename(imagePath, path.extname(imagePath));
    const directory = path.dirname(imagePath);

    // Leer metadatos de la imagen original
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    console.log(
      `${colors.blue}📦 Procesando:${colors.reset} ${path.basename(imagePath)}`
    );
    console.log(`   Dimensiones originales: ${metadata.width}x${metadata.height}px`);

    // Configuración de tamaños (responsive images)
    const sizes = [
      { width: 320, suffix: '320w' },   // Mobile
      { width: 640, suffix: '640w' },   // Tablet small
      { width: 1024, suffix: '1024w' }, // Tablet large
      { width: 1200, suffix: '1200w' }, // Desktop
    ];

    // Generar WebP para cada tamaño
    for (const size of sizes) {
      // Solo procesar si es más pequeño que el original
      if (size.width <= metadata.width) {
        const outputPath = path.join(directory, `${filename}.${size.suffix}.webp`);
        
        await sharp(imagePath)
          .resize(size.width, Math.round((metadata.height * size.width) / metadata.width), {
            fit: 'cover',
            position: 'center',
          })
          .webp({ quality: 80, effort: 6 })
          .toFile(outputPath);

        const stats = fs.statSync(outputPath);
        console.log(
          `   ${colors.green}✓${colors.reset} ${size.suffix}: ${(stats.size / 1024).toFixed(2)}KB`
        );
      }
    }

    // Generar WebP full size
    const fullPath = path.join(directory, `${filename}.webp`);
    await sharp(imagePath)
      .webp({ quality: 85, effort: 6 })
      .toFile(fullPath);

    const fullStats = fs.statSync(fullPath);
    console.log(
      `   ${colors.green}✓${colors.reset} Original: ${(fullStats.size / 1024).toFixed(2)}KB\n`
    );

  } catch (error) {
    console.error(
      `${colors.red}✗ Error procesando ${imagePath}:${colors.reset} ${error.message}`
    );
  }
}

/**
 * Función principal
 */
async function main() {
  const assetsDir = path.join(__dirname, '../public/assets');

  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(
    `${colors.green}🚀 Iniciando optimización de imágenes${colors.reset}`
  );
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);

  // Verificar que sharp esté instalado
  try {
    require('sharp');
  } catch (error) {
    console.error(
      `${colors.red}✗ Error: sharp no está instalado${colors.reset}`
    );
    console.error(
      `${colors.yellow}💡 Instala con: npm install --save-dev sharp${colors.reset}`
    );
    process.exit(1);
  }

  // Verificar que el directorio de assets existe
  if (!fs.existsSync(assetsDir)) {
    console.warn(
      `${colors.yellow}⚠ Directorio ${assetsDir} no encontrado${colors.reset}`
    );
    console.warn(`${colors.yellow}   Crea el directorio public/assets e intenta de nuevo${colors.reset}`);
    process.exit(0);
  }

  const images = getImageFiles(assetsDir);

  if (images.length === 0) {
    console.warn(
      `${colors.yellow}⚠ No se encontraron imágenes JPG/PNG en ${assetsDir}${colors.reset}`
    );
    process.exit(0);
  }

  console.log(`${colors.blue}Encontradas ${images.length} imagen(es)${colors.reset}\n`);

  // Procesar todas las imágenes
  for (const imagePath of images) {
    await optimizeImage(imagePath);
  }

  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}✓ Optimización completada${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(
    `${colors.yellow}💡 Próximos pasos:${colors.reset}`
  );
  console.log(
    `   1. Actualiza los <picture> en tus componentes HTML`
  );
  console.log(
    `   2. Usa srcset="filename.320w.webp 320w, filename.640w.webp 640w, ..."`
  );
  console.log(
    `   3. Añade <source type="image/webp" srcset="..."> en <picture>`
  );
}

// Ejecutar
main().catch(error => {
  console.error(`${colors.red}Error fatal:${colors.reset}`, error);
  process.exit(1);
});
