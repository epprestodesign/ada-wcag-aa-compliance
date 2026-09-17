import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Mobile prototype — a lightweight "device frame" showcase that embeds the
// existing booking prototype (already responsive) in a 390px-wide iframe, so the
// components render their MOBILE layouts (media queries are viewport-based, and
// an iframe has its own viewport). No library or prototype code is duplicated.
//
// Deps (vue, plugin-vue) resolve up the tree to the repo's node_modules — this
// folder has none of its own, exactly like ../prototype.
const repoRoot = fileURLToPath(new URL('../', import.meta.url))

export default defineConfig({
  // Read .env from the repo root (see ../prototype/vite.config.js).
  envDir: repoRoot,
  plugins: [vue()],
  server: {
    port: 5174,
    fs: { allow: [repoRoot] },
  },
})
