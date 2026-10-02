import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Самодостаточная сборка для Docker-образа: server.js + минимальный набор node_modules
  output: "standalone",
  // Линтер запускается отдельно (npm run lint) и не блокирует сборку образа
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
