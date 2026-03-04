import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  /* uncomment this for production
  esbuild: {
    drop: ["console", "debugger"],
  },
  */
});
