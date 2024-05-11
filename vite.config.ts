import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vueReactivityTransform from "@vue-macros/reactivity-transform/vite"
import vueJsx from "@vitejs/plugin-vue-jsx"
import { createViteLicensePlugin } from "rollup-license-plugin"
import licensesGzip from "./plugins/licenses-gzip"
import UnoCSS from "unocss/vite"
import pagesPlugin from "vite-plugin-pages"

export default defineConfig(async () => ({
  plugins: [
    pagesPlugin({
      dirs: ["app/pages"],
      extensions: ["vue", "tsx"]
    }),
    vue(),
    vueReactivityTransform(),
    vueJsx(),
    UnoCSS(),
    createViteLicensePlugin({
      licenseOverrides: {
        "@vicons/carbon@0.12.0": "Apache-2.0"
      }
    }),
    licensesGzip()
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src/**"]
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      "~": fileURLToPath(new URL("./app", import.meta.url))
    }
  }
}))
