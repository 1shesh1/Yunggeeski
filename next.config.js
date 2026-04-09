/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/course', destination: '/workflow', permanent: true },
      { source: '/course/access', destination: '/workflow/access', permanent: true },
    ];
  },
};

module.exports = nextConfig;
