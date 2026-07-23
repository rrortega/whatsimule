import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/styles/whatsapp-simulator.css"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  injectStyle: false,
  external: ["react", "react-dom", "framer-motion", "lucide-react"],
});
