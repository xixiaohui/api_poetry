import type { NextConfig } from "next";

const isDocker = process.env.DOCKER_BUILD === "true";

const nextConfig: NextConfig = {
  output: isDocker ? "standalone" : undefined,
  // @napi-rs/canvas is a native module and must not be bundled by webpack/turbopack.
  serverExternalPackages: ["@napi-rs/canvas"],
};

export default nextConfig;
