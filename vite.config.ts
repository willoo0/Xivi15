
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "js-dos": path.resolve(__dirname, "node_modules/js-dos/dist/js-dos.js")
    }
  },
  optimizeDeps: {
    include: ['js-dos']
  },
  server: {
    host: '0.0.0.0',
    port: 5000
  }
});
