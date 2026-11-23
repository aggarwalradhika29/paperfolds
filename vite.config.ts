import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the same build works at /, /paperfolds/ or /paperfolds/<branch>/.
export default defineConfig({ plugins: [react()], base: "./" });
