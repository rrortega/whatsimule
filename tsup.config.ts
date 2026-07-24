import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "whatsapp-simulator": "src/styles/whatsapp-simulator.css",
    "styles/whatsapp-simulator": "src/styles/whatsapp-simulator.css",
  },
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  injectStyle: false,
  external: ["react", "react-dom", "framer-motion", "lucide-react"],
});
