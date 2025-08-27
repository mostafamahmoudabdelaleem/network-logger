import { defineConfig } from "tsup";

export default defineConfig({
  name: "prod",
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: false,
  clean: true,
  dts: true,
  minify: true,
  treeshake: "recommended",
  outDir: "dist",
});
