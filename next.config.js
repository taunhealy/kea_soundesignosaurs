/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.devtool = false;
    }
    config.watchOptions = {
      poll: 500,
      aggregateTimeout: 150,
    };
    config.output = {
      ...config.output,
      chunkLoadTimeout: 3000,
    };
    return config;
  },
};

export default nextConfig;
