const webpack = require('webpack')

const { parsed: myEnv } = require('dotenv').config({
  path:'.env.local'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.plugins.push(new webpack.EnvironmentPlugin(myEnv))
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