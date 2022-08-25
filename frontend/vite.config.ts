import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
//import eslintPlugin from 'vite-plugin-eslint';
import path from 'path';
const resolve = path.resolve;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
        //reactivityTransform: true
    }),
    //eslintPlugin()
    ],
  server: {
    proxy: {
        '/dev' : {
            target: 'http://localhost:8000',
            changeOrigin: true
        }
    }
  },
  resolve: {
    /*
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    */
    alias: [{find: '@', replacement: resolve(__dirname, './src')}]
  },
});