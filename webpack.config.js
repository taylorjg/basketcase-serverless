const slsw = require("serverless-webpack");

module.exports = {
  mode: "production",
  entry: slsw.lib.entries,
  target: "node",
};
