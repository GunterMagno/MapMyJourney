/**
 * Configuración de entorno para producción
 * Usa variables del archivo .env.production
 */

export const environment = {
  production: true,
  apiUrl: process.env['NG_APP_API_URL'] || 'https://mapmyjourney-backend.onrender.com/api'
};
