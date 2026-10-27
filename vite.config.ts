import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Web-Hosting unter Unterpfad (GitHub Pages) vs. App (Capacitor): Basis-Pfad per Umgebungsvariable
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
