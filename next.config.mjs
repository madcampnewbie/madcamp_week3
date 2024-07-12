// next.config.mjs
export default {
    reactStrictMode: true,
    webpack(config, { buildId, dev, isServer, defaultLoaders, webpack }) {
      return config;
    },
};
  