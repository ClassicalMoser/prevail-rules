import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/**/*.ts"],
  format: ["esm"],
  dts: {
    resolve: true,
  },
  bundle: true,
  sourcemap: false,
  clean: true,
  outDir: "dist",
  outExtensions: () => ({
    js: ".js",
    dts: ".d.ts",
  }),
  alias: {
    "@entities": "./src/entities",
    "@functions": "./src/functions",
    "@commands": "./src/commands",
    "@contracts": "./src/contracts",
    "@testing": "./src/testing",
    "@utils": "./src/utils",
    "@validation": "./src/validation",
    "@sampleValues": "./src/sampleValues",
  },
});
