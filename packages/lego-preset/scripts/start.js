"use strict";

const detect = require("detect-port");
const chalk = require("chalk");
const WebpackCompiler = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const configFactory = require("../config/webpack.config");

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const serverConfig = {
  host: HOST,
  port: DEFAULT_PORT,
  before: devServerBefore,
};

function devServerBefore() {}

detect(DEFAULT_PORT)
  .then((_port) => {
    if (DEFAULT_PORT !== _port) {
      serverConfig.port = _port;
      console.log(chalk.red(`port: ${port} was occupied, try port: ${_port}`));
    }

    const config = configFactory("development");
    const compiler = WebpackCompiler(config);
    const server = new WebpackDevServer(serverConfig, compiler);

    server.startCallback(() => {
      console.log(
        chalk.cyan(
          `Successfully started server on http://localhost:${serverConfig.port}`
        )
      );
    });

    ["SIGINT", "SIGTERM"].forEach(function (sig) {
      process.on(sig, function () {
        console.log("Server closed");
        server.close();
        process.exit();
      });
    });
  })
  .catch(async (err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
