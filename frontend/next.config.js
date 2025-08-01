const path = require('path');
const { IgnorePlugin } = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: {},
  },
  
  // Disable TypeScript checking during build (we'll handle it separately)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build (we'll handle it separately)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Custom webpack configuration
  webpack: (config, { isServer, webpack }) => {
    // Exclude backend directory from being processed by Next.js
    config.plugins.push(
      new IgnorePlugin({
        resourceRegExp: /^@?backend\//,
      })
    );
    
    // Add a rule to exclude backend files
    config.module.rules.push({
      test: /\/backend\//,
      use: 'null-loader',
    });
    
    // Add support for SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });
    
    // Configure fallbacks for client-side only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/modules': path.resolve(__dirname, 'src/modules'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
    };

    return config;
  },
  
  // Rewrite API routes to point to the backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*', // Proxy API requests to the backend
      },
      {
        source: '/api/graphql',
        destination: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
      },
    ];
  },
};

module.exports = nextConfig;
