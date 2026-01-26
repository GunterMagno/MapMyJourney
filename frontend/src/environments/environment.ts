/**
 * Configuración de entorno para desarrollo
 * Usa variables del archivo .env
 */

export const environment = {
  production: false,
  apiUrl: process.env['NG_APP_API_URL'] || 'http://localhost:8080/api'
};
