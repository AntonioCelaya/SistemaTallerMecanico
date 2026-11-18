import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportacion estatica: el mismo build sirve para navegador, Capacitor (Android) y Tauri (escritorio).
  output: "export",
  transpilePackages: ["@taller/shared"],
};

export default nextConfig;
