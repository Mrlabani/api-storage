/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      stream: false,
      http: false,
      https: false,
    };
    return config;
  },
};

module.exports = nextConfig;
