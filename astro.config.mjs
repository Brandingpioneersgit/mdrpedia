// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://mdrpedia.com',

  // Output mode: static (supports on-demand rendering with adapter)
  output: 'static',

  adapter: node({
    mode: 'standalone',
  }),

  integrations: [react()],

  // Image optimization settings
  image: {
    // Use sharp for local image optimization
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
    // Remote image domains that are allowed
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wikipedia.org',
      },
      {
        protocol: 'https',
        hostname: '**.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },

  // Build performance
  vite: {
    build: {
      // Code splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
          },
        },
      },
    },
    // Optimize deps
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
});