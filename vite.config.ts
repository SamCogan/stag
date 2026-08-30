import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("/node_modules/@firebase/") ||
            id.includes("/node_modules/firebase/")
          ) {
            return "firebase";
          }
          if (
            id.includes("/node_modules/react/") ||
            id.includes("/node_modules/react-dom/") ||
            id.includes("/node_modules/scheduler/")
          ) {
            return "react";
          }
          if (id.includes("/node_modules/")) {
            return "vendor";
          }
          return;
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
