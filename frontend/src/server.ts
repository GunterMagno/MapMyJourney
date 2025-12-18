import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

// Try multiple possible locations for the build output
const possibleBuildDirs = [
  join(import.meta.dirname, '../browser'),           // SSR build output
  join(import.meta.dirname, '../../dist/frontend'),   // SSR build output location 2
  join(import.meta.dirname, '../dist'),              // Alternative dist location
];

let browserDistFolder = possibleBuildDirs[0];
for (const dir of possibleBuildDirs) {
  if (existsSync(dir)) {
    browserDistFolder = dir;
    console.log(`Using build folder: ${browserDistFolder}`);
    break;
  }
}

const app = express();

// Only serve static if build folder exists
if (existsSync(browserDistFolder)) {
  app.use(express.static(browserDistFolder, { maxAge: '1y' }));
  app.use((req, res) => {
    res.sendFile(join(browserDistFolder, 'index.html'));
  });
} else {
  // Fallback for development - serve index.html for any route
  // In dev mode, Vite/Angular CLI handles the actual rendering from memory
  // Just send index.html for all routes to enable client-side SPA routing
  const fallbackPaths = [
    join(import.meta.dirname, '.angular/vite-root/frontend/index.html'),
    join(import.meta.dirname, '.angular/cache/frontend/index.html'),
    join(import.meta.dirname, './index.html'),
  ];
  
  let indexPath = null;
  for (const path of fallbackPaths) {
    if (existsSync(path)) {
      indexPath = path;
      break;
    }
  }
  
  app.use((req, res) => {
    if (indexPath && existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Development mode: index.html not found. Tried: ' + fallbackPaths.join(', '));
    }
  });
}

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
