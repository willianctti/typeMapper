/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Minimize issues with Tailwind
    optimizeCss: true,
  },
};

export default nextConfig; 