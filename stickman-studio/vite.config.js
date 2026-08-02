import { defineConfig } from 'vite';

// Projeto 100% local, sem backend. base './' facilita rodar o build por arquivo.
export default defineConfig({
  base: './',
  server: {
    port: 5180,
    open: true,
  },
});
