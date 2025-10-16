import type { NextConfig } from "next";
import path from 'path';


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
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'db5txodeu.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
    domains: [
      'res.cloudinary.com',
      'db5txodeu.cloudinary.com'
    ],
  },
  serverExternalPackages: ['@supabase/supabase-js'],
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
