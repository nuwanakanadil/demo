import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      axios: "axios/dist/browser/axios.cjs",
    },
  },
});