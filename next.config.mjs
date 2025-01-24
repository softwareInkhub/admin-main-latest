/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true
    },
    images: {
      domains: ['cdn.shopify.com'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cdn.shopify.com',
          pathname: '**',
        },
      ],
    },
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        "undici": false,  // Disable undici
      };
      return config;
    },
  }
  
  export default nextConfig