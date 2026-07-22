import type { NextConfig } from "next";

const isDocker = process.env.DOCKER_BUILD === "true";

const nextConfig: NextConfig = {
  output: isDocker ? "standalone" : undefined,
};

export default nextConfig;
