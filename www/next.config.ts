/** @type {import('next').NextConfig} */
interface NextConfigExperimental {
  serverActions?: {
    bodySizeLimit?: number
    allowedOrigins?: string[]
  }
  optimizePackageImports?: string[]
  typedRoutes?: boolean
}

interface NextConfigWithWebpack {
  reactStrictMode: boolean
  experimental: NextConfigExperimental
  webpack: (config: any) => any
}

const nextConfig: NextConfigWithWebpack = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: 10 * 1024 * 1024, // 10MB
      allowedOrigins: ['localhost:3000']
    },
    optimizePackageImports: ['lucide-react'],
    typedRoutes: true
  },
  webpack: (config: any) => {
    config.externals = [...config.externals, 'canvas', 'jsdom']
    return config
  }
}

export default nextConfig
