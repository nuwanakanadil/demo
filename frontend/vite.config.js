import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // ✅ forces browser axios build (fixes "agent" runtime crash)
      axios: "axios/dist/browser/axios.cjs",
    },
  },
});
