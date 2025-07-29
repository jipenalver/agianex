import vueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: {
      // Explicitly define environment variables for production builds
      __VITE_SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL),
      __VITE_SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      __VITE_SUPABASE_SERVICE_ROLE__: JSON.stringify(env.VITE_SUPABASE_SERVICE_ROLE),
      __VITE_GOOGLE_MAPS_API_KEY__: JSON.stringify(env.VITE_GOOGLE_MAPS_API_KEY),
    },
    // Ensure environment variables are available in all modes
    envPrefix: 'VITE_',
  }
})
