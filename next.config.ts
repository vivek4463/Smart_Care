import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for Turbopack root finding in IDE
  // experimental: { 
  //   turbopack: { root: '.' } 
  // }
};

export default nextConfig;
