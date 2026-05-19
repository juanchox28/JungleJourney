import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { execSync } from "child_process";
import fs from "fs";

const isReplit = process.env.REPL_ID !== undefined;
const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  plugins: [
    react(),
    ...(isReplit && isDev
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then((m) =>
            m.default()
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer()
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner()
          ),
        ]
      : []),
    {
      name: "version-plugin",
      generateBundle() {
        try {
          const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
          const gitCommit = execSync("git rev-parse HEAD", {
            encoding: "utf8",
          }).trim();
          const gitBranch = execSync("git rev-parse --abbrev-ref HEAD", {
            encoding: "utf8",
          }).trim();

          const versionData = {
            version: packageJson.version,
            commit: gitCommit,
            branch: gitBranch,
            buildTime: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
          };

          this.emitFile({
            type: "asset",
            fileName: "version.json",
            source: JSON.stringify(versionData, null, 2),
          });
        } catch (error) {
          const fallbackData = {
            version: "unknown",
            commit: "unknown",
            branch: "unknown",
            buildTime: new Date().toISOString(),
            environment: process.env.NODE_ENV || "development",
          };
          this.emitFile({
            type: "asset",
            fileName: "version.json",
            source: JSON.stringify(fallbackData, null, 2),
          });
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
