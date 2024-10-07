/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home', // Redirect '/' to '/landing'
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
