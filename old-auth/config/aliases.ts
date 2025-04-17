import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { register } from 'tsconfig-paths';

// Derive __dirname from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

register({
  baseUrl: resolve(__dirname, '../'),
  paths: {
    '@/*': ['../*'] 
  }
}) 