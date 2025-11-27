/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // 启用 standalone 输出模式，用于 Docker
  async rewrites() {
    // 获取后端 API 地址，支持环境变量配置
    const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:8080';
    
    // 生产环境（Vercel）中，将 /api/prompts 代理到指定的生产 API
    const promptsApiUrl = process.env.VERCEL 
      ? 'https://prompt-ops.qestionlearn.cn'
      : apiBaseUrl;
    
    return [
      {
        source: '/api/platforms',
        destination: `${apiBaseUrl}/api/platforms`
      },
      {
        source: '/api/prompts/:path*',
        destination: `${promptsApiUrl}/api/prompts/:path*`
      },
      {
        source: '/api/articles',
        destination: `${apiBaseUrl}/api/articles`
      }
    ];
  }
};

export default nextConfig;

