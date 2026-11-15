import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const web = new URL("../web/", import.meta.url).pathname;

/**
 * The screens are the web app's own pages: these aliases mirror the ones its
 * client build declares. The web's `#` imports resolve from its package.json.
 */
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@web/": web,
      "@generated": `${web}.adonisjs/client`,
      "~/": `${web}app/core/ui/`,
      "config/ssr": `${web}config/ssr.ts`,
    },
    // Providers set up here and hooks used in the web's pages must share one copy.
    dedupe: [
      "react",
      "react-dom",
      "react-i18next",
      "i18next",
      "@inertiajs/react",
      "@adonisjs/inertia",
      "adonis-inertia-modal",
    ],
  },
});
