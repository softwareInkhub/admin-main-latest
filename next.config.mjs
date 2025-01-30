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
  async headers() {
    return [
      {
        source: '/(.*)', // Apply to all routes
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' blob: https://www.recaptcha.net https://identitytoolkit.googleapis.com https://firestore.googleapis.com https://www.pinterest.com https://in.pinterest.com; img-src 'self' data: https://www.recaptcha.net https://www.google.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.recaptcha.net; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
}

export default nextConfig