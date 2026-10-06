import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  allowedDevOrigins: ['*.e2b.app'],
  transpilePackages: ['@boul/ui', '@boul/domain'],
};
export default nextConfig;
