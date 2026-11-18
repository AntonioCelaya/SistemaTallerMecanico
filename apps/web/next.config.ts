import { networkInterfaces } from "node:os";
import type { NextConfig } from "next";

// IPs de esta PC en la red local, para que el servidor de desarrollo acepte
// conexiones desde celulares y otras computadoras del taller.
const ipsLocales = Object.values(networkInterfaces())
  .flat()
  .filter((red) => red && red.family === "IPv4" && !red.internal)
  .map((red) => red!.address);

const nextConfig: NextConfig = {
  // Exportacion estatica: el mismo build sirve para navegador, Capacitor (Android) y Tauri (escritorio).
  output: "export",
  transpilePackages: ["@taller/shared"],
  // "*.ts.net" cubre el nombre de la PC dentro de la red privada Tailscale.
  allowedDevOrigins: [...ipsLocales, "*.ts.net"],
};

export default nextConfig;
