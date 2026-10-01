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
      // The brands page is now the landing page; the workflow/course page moved
      // from / to /workflow; the custom-charts storefront was retired.
      { source: '/brands', destination: '/', permanent: true },
      { source: '/brands/thanks', destination: '/thanks', permanent: true },
      { source: '/charts', destination: '/', permanent: true },
      { source: '/checkout/:tier', destination: '/', permanent: true },
      { source: '/course', destination: '/workflow', permanent: true },
      { source: '/course/access', destination: '/workflow/access', permanent: true },
    ];
  },
};

module.exports = nextConfig;
