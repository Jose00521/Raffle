const webpack = require('webpack')
const EventEmitter = require('events');

// Increase max listeners to prevent memory leak warnings
EventEmitter.defaultMaxListeners = 50;

const { parsed: myEnv } = require('dotenv').config({
  path:'.env.example'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ignorar erros de ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignorar erros de TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config,{ isServer }) {
    config.plugins.push(new webpack.EnvironmentPlugin(myEnv))
      // Lidar melhor com módulos nativos
    config.externals.push({ 'thread-stream': 'commonjs thread-stream', pino: 'commonjs pino' });

    // Excluir pino-pretty do bundle de produção
    if (isServer && process.env.NODE_ENV === 'production') {
      config.externals.push('pino-pretty');
    }

    return config
},
  compiler: {
    styledComponents: true,
  },
  // env: {
  //   AUTH_SECRET: process.env.AUTH_SECRET,
  //   MONGODB_URI: process.env.MONGODB_URI,
  //   PORT: process.env.PORT,
  //   ID_SECRET_KEY: process.env.ID_SECRET_KEY,
  //   MIGRATE_SECRET_KEY: process.env.MIGRATE_SECRET_KEY,
  // },
};

module.exports = nextConfig; 