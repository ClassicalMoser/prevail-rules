import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts"],
  format: ["esm"],
  dts: true,
  bundle: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  outDir: "dist",
  outExtension() {
    return {
      js: ".js",
    };
  },
  esbuildOptions(options) {
    options.alias = {
      "@entities": "./src/entities",
      "@functions": "./src/functions",
      "@commands": "./src/commands",
      "@contracts": "./src/contracts",
      "@testing": "./src/testing",
      "@utils": "./src/utils",
      "@validation": "./src/validation",
      "@sampleValues": "./src/sampleValues",
    };
  },
});

