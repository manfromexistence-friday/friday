/** @type {import('next').NextConfig} */
interface NextConfigExperimental {
  serverActions: boolean
  memoryBasedWorkersCount: boolean
  workerThreads: boolean
  maxMemoryLimit: string
}

interface NextConfigWithWebpack {
  reactStrictMode: boolean
  experimental: NextConfigExperimental
  webpack: (config: any) => any
}

const nextConfig: NextConfigWithWebpack = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
    memoryBasedWorkersCount: true,
    workerThreads: true,
    maxMemoryLimit: '2GB',
  },
  webpack: (config: any) => {
    config.externals = [...config.externals, 'canvas', 'jsdom']
    return config
  }
}

export default nextConfig
