#!/usr/bin/env node

/**
 * Build Configuration Script
 * Handles different build environments and optimizations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environments = {
  production: {
    NODE_ENV: 'production',
    VITE_APP_ENV: 'production',
    VITE_BUILD_MODE: 'production',
    VITE_API_BASE_URL: 'https://api.production.example.com',
    VITE_API_TIMEOUT: '10000',
    VITE_ENABLE_ANALYTICS: 'true',
    VITE_ENABLE_ERROR_REPORTING: 'true',
    VITE_ENABLE_DEBUG_LOGS: 'false',
    VITE_ENABLE_SERVICE_WORKER: 'true',
    VITE_ENABLE_COMPRESSION: 'true'
  },
  staging: {
    NODE_ENV: 'production',
    VITE_APP_ENV: 'staging',
    VITE_BUILD_MODE: 'staging',
    VITE_API_BASE_URL: 'https://api.staging.example.com',
    VITE_API_TIMEOUT: '15000',
    VITE_ENABLE_ANALYTICS: 'true',
    VITE_ENABLE_ERROR_REPORTING: 'true',
    VITE_ENABLE_DEBUG_LOGS: 'true',
    VITE_ENABLE_SERVICE_WORKER: 'false',
    VITE_ENABLE_COMPRESSION: 'false'
  },
  development: {
    NODE_ENV: 'development',
    VITE_APP_ENV: 'development',
    VITE_BUILD_MODE: 'development',
    VITE_API_BASE_URL: 'http://localhost:3000',
    VITE_API_TIMEOUT: '30000',
    VITE_ENABLE_ANALYTICS: 'false',
    VITE_ENABLE_ERROR_REPORTING: 'false',
    VITE_ENABLE_DEBUG_LOGS: 'true',
    VITE_ENABLE_SERVICE_WORKER: 'false',
    VITE_ENABLE_COMPRESSION: 'false'
  }
};

function createEnvFile(environment) {
  const envConfig = environments[environment];
  if (!envConfig) {
    console.error(`Unknown environment: ${environment}`);
    process.exit(1);
  }

  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const envFilePath = path.join(process.cwd(), `.env.${environment}`);
  fs.writeFileSync(envFilePath, envContent);
  console.log(`Created ${envFilePath}`);
}

function setupBuildEnvironment() {
  const environment = process.argv[2] || 'development';
  
  console.log(`Setting up build environment: ${environment}`);
  createEnvFile(environment);
  
  // Create all environment files
  Object.keys(environments).forEach(env => {
    createEnvFile(env);
  });
  
  console.log('Build environment setup complete!');
}

// Always run when called directly
setupBuildEnvironment();

export { environments, createEnvFile, setupBuildEnvironment }; 