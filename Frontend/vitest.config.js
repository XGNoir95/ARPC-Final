import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig((environment) => mergeConfig(viteConfig(environment), {
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
  },
}))
