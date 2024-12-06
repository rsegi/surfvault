/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
            {
              protocol: 'http', // Change to 'https' if you're using HTTPS for Minio
              hostname: 'localhost',
              port: '9000', // The Minio instance port
              pathname: '/surfvault/**', // Matches the prefix of your Minio URL path
            },
          ],
    }
};

export default nextConfig;
