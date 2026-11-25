import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Le preview Arena est servi sous https://<port>-<sandbox>.e2b.app :
// on ecoute sur toutes les interfaces et on autorise les hotes proxies.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
  },
});
