/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
              protocol: 'http',
              hostname: 'localhost',
              port: '9000',
              pathname: '/surfvault/**',
            },
            {
              protocol: 'http',
              hostname: 'host.docker.internal',
              port: '9000',
              pathname: '/surfvault/**',
            },
          ],
    }
};

export default nextConfig;
