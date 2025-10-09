import type { NextConfig } from "next";
import path from 'path';

// Carregar .env.local manualmente ANTES de tudo
require('./env-loader');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'zag-card.vercel.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
