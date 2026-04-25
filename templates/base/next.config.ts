import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  serverExternalPackages: ['@0gfoundation/0g-ts-sdk', '@0glabs/0g-serving-broker'],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
