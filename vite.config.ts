import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, Plugin } from "vite";

import commonjs from "@rollup/plugin-commonjs";

export const updateCommonjsPlugin = (): Plugin => {
  const commonJs22 = commonjs({
    include: [/node_modules/],
    extensions: [".js", ".cjs"],
    strictRequires: true,
  });

  return {
    name: "new-common-js",
    options(rawOptions) {
      const plugins = Array.isArray(rawOptions.plugins)
        ? [...rawOptions.plugins]
        : rawOptions.plugins
        ? [rawOptions.plugins]
        : [];

      const index = plugins.findIndex(
        // @ts-ignore
        (plugin) => plugin && plugin.name === "commonjs"
      );
      if (index !== -1) {
        plugins.splice(index, 1, commonJs22);
      }

      const nextConfig = { ...rawOptions, plugins };
      // @ts-ignore
      return commonJs22.options.call(this, nextConfig);
    },
  };
};

export default defineConfig({
  plugins: [react(), updateCommonjsPlugin()],
  base: "/stat-viewer/",
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
