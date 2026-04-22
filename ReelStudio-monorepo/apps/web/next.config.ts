import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'fluent-ffmpeg', 'chokidar'],
};

export default nextConfig;
