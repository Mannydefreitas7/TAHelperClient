import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";
import tailwind from "tailwindcss"
import autoprefixer from "autoprefixer"
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env': {}
  },
  server: {
    port: 9000
  },
  envDir: "./src/environments",
  resolve: {
    alias: {
      "@/boot/msal": path.resolve(__dirname, "src/boot/msal"),
      "@/stores": path.resolve(__dirname, "src/stores"),
      "@/assets": path.resolve(__dirname, "src/assets"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/lib": path.resolve(__dirname, "src/lib"),
      "@/services": path.resolve(__dirname, "src/services"),
      "@/api": path.resolve(__dirname, "src/api"),
      "@/mixins": path.resolve(__dirname, "src/mixins")
    }
  },
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [vue(), basicSsl()],
})
