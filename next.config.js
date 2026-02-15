/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Add empty turbopack config to silence the warning
    // Most apps work fine with Turbopack with no configuration
    turbopack: {},
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
        };
        return config;
    },
};

module.exports = nextConfig;
