const webpack = require("webpack");

  module.exports = function override(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer"),
      "process": require.resolve("process/browser")
    };

    config.plugins = [
      ...config.plugins,
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
        process: "process"
      })
    ];

    return config;
  };
